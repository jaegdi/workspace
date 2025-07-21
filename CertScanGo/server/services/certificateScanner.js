const forge = require('node-forge');
const OpenShiftClient = require('./openShiftClient');
const Certificate = require('../models/Certificate');
const Scan = require('../models/Scan');
const logger = require('../utils/logger');

class CertificateScanner {
  constructor() {
    this.warningThresholdDays = 30;
  }

  async initiateScan(cluster) {
    logger.info(`Initiating certificate scan for cluster: ${cluster.name}`);
    
    // Create scan record
    const scan = new Scan({
      clusterId: cluster._id,
      clusterName: cluster.name,
      status: 'in_progress',
      startedAt: new Date()
    });
    
    await scan.save();
    logger.info(`Created scan record with ID: ${scan._id}`);

    // Start scanning in background
    this.performScan(scan, cluster).catch(error => {
      logger.error(`Scan ${scan._id} failed:`, error.message);
    });

    return scan;
  }

  async performScan(scan, cluster) {
    try {
      logger.info(`Starting scan ${scan._id} for cluster ${cluster.name}`);
      
      const client = new OpenShiftClient(cluster.url, cluster.token);
      
      // Test connection first
      await client.testConnection();
      
      // Get namespaces to scan
      const namespacesToScan = cluster.namespaces && cluster.namespaces.length > 0 
        ? cluster.namespaces 
        : await client.getNamespaces();
      
      logger.info(`Scanning ${namespacesToScan.length} namespaces`);
      
      const certificates = [];
      
      for (const namespace of namespacesToScan) {
        try {
          logger.info(`Scanning namespace: ${namespace}`);
          
          // Scan secrets
          const secrets = await client.getSecretsInNamespace(namespace);
          const secretCerts = await this.extractCertificatesFromSecrets(secrets, namespace, scan, cluster);
          certificates.push(...secretCerts);
          
          // Scan configmaps
          const configMaps = await client.getConfigMapsInNamespace(namespace);
          const configMapCerts = await this.extractCertificatesFromConfigMaps(configMaps, namespace, scan, cluster);
          certificates.push(...configMapCerts);
          
        } catch (error) {
          logger.error(`Error scanning namespace ${namespace}:`, error.message);
          // Continue with other namespaces
        }
      }

      // Save all certificates
      if (certificates.length > 0) {
        await Certificate.insertMany(certificates);
        logger.info(`Saved ${certificates.length} certificates for scan ${scan._id}`);
      }

      // Calculate summary
      const summary = this.calculateSummary(certificates);
      
      // Update scan record
      scan.status = 'completed';
      scan.completedAt = new Date();
      scan.certificatesFound = certificates.length;
      scan.summary = summary;
      scan.namespaces = namespacesToScan;
      
      await scan.save();
      logger.info(`Completed scan ${scan._id}. Found ${certificates.length} certificates`);
      
    } catch (error) {
      logger.error(`Scan ${scan._id} failed:`, error.message);
      
      // Update scan record with error
      scan.status = 'failed';
      scan.completedAt = new Date();
      scan.error = error.message;
      await scan.save();
    }
  }

  async extractCertificatesFromSecrets(secrets, namespace, scan, cluster) {
    const certificates = [];
    
    for (const secret of secrets) {
      if (!secret.data) continue;
      
      for (const [key, value] of Object.entries(secret.data)) {
        try {
          // Decode base64 data
          const decodedData = Buffer.from(value, 'base64').toString('utf-8');
          
          // Try to parse as certificate
          const certData = this.parseCertificate(decodedData);
          if (certData) {
            const certificate = {
              scanId: scan._id,
              clusterId: cluster._id,
              clusterName: cluster.name,
              namespace: namespace,
              objectName: secret.metadata.name,
              objectType: 'Secret',
              certificateKey: key,
              ...certData
            };
            certificates.push(certificate);
          }
        } catch (error) {
          // Not a certificate or parsing failed, continue
        }
      }
    }
    
    return certificates;
  }

  async extractCertificatesFromConfigMaps(configMaps, namespace, scan, cluster) {
    const certificates = [];
    
    for (const configMap of configMaps) {
      if (!configMap.data) continue;
      
      for (const [key, value] of Object.entries(configMap.data)) {
        try {
          // Try to parse as certificate
          const certData = this.parseCertificate(value);
          if (certData) {
            const certificate = {
              scanId: scan._id,
              clusterId: cluster._id,
              clusterName: cluster.name,
              namespace: namespace,
              objectName: configMap.metadata.name,
              objectType: 'ConfigMap',
              certificateKey: key,
              ...certData
            };
            certificates.push(certificate);
          }
        } catch (error) {
          // Not a certificate or parsing failed, continue
        }
      }
    }
    
    return certificates;
  }

  parseCertificate(data) {
    try {
      // Try to parse PEM certificate
      let cert;
      
      if (data.includes('-----BEGIN CERTIFICATE-----')) {
        cert = forge.pki.certificateFromPem(data);
      } else {
        // Try base64 decode first
        try {
          const decoded = Buffer.from(data, 'base64').toString('utf-8');
          if (decoded.includes('-----BEGIN CERTIFICATE-----')) {
            cert = forge.pki.certificateFromPem(decoded);
          }
        } catch (e) {
          return null;
        }
      }
      
      if (!cert) return null;
      
      const notBefore = cert.validity.notBefore;
      const notAfter = cert.validity.notAfter;
      const now = new Date();
      
      // Calculate days remaining
      const daysRemaining = Math.ceil((notAfter - now) / (1000 * 60 * 60 * 24));
      
      // Determine status
      let status;
      if (daysRemaining < 0) {
        status = 'EXPIRED';
      } else if (daysRemaining <= this.warningThresholdDays) {
        status = 'WARNING';
      } else {
        status = 'OK';
      }
      
      return {
        status,
        notValidBefore: notBefore,
        notValidAfter: notAfter,
        daysRemaining,
        issuer: cert.issuer.getField('CN')?.value || 'Unknown',
        subject: cert.subject.getField('CN')?.value || 'Unknown'
      };
      
    } catch (error) {
      return null;
    }
  }

  calculateSummary(certificates) {
    const summary = { valid: 0, warning: 0, expired: 0 };
    
    for (const cert of certificates) {
      switch (cert.status) {
        case 'OK':
          summary.valid++;
          break;
        case 'WARNING':
          summary.warning++;
          break;
        case 'EXPIRED':
          summary.expired++;
          break;
      }
    }
    
    return summary;
  }
}

module.exports = new CertificateScanner();