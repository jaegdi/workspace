const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const Scan = require('../models/Scan');
const Cluster = require('../models/Cluster');
const logger = require('../utils/logger');

// GET /api/certificates/stats - Get certificate statistics for dashboard
router.get('/stats', async (req, res) => {
  try {
    logger.info('Fetching certificate statistics');
    
    // Get latest completed scans for each cluster
    const latestScans = await Scan.aggregate([
      { $match: { status: 'completed' } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$clusterId', latestScan: { $first: '$$ROOT' } } }
    ]);

    let totalValid = 0;
    let totalWarning = 0;
    let totalExpired = 0;

    for (const scanGroup of latestScans) {
      const scan = scanGroup.latestScan;
      totalValid += scan.summary.valid || 0;
      totalWarning += scan.summary.warning || 0;
      totalExpired += scan.summary.expired || 0;
    }

    const totalClusters = await Cluster.countDocuments();

    const stats = {
      valid: totalValid,
      warning: totalWarning,
      expired: totalExpired,
      clusters: totalClusters
    };

    logger.info('Certificate statistics retrieved successfully');
    res.json(stats);
    
  } catch (error) {
    logger.error('Error fetching certificate statistics:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/certificates/results - Get certificate scan results with filtering
router.get('/results', async (req, res) => {
  try {
    const { status, cluster, search, limit = 100 } = req.query;
    
    logger.info('Fetching certificate results with filters:', { status, cluster, search });
    
    // Build query
    let query = {};
    
    // Get latest scan for each cluster to show current results
    const latestScans = await Scan.aggregate([
      { $match: { status: 'completed' } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$clusterId', latestScanId: { $first: '$_id' } } }
    ]);

    const scanIds = latestScans.map(s => s.latestScanId);
    query.scanId = { $in: scanIds };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (cluster && cluster !== 'all') {
      query.clusterName = cluster;
    }

    if (search) {
      query.$or = [
        { objectName: { $regex: search, $options: 'i' } },
        { namespace: { $regex: search, $options: 'i' } },
        { clusterName: { $regex: search, $options: 'i' } }
      ];
    }

    const certificates = await Certificate.find(query)
      .sort({ notValidAfter: 1 })
      .limit(parseInt(limit))
      .select('objectName namespace clusterName objectType certificateKey status notValidAfter');

    const formattedCertificates = certificates.map(cert => ({
      objectName: cert.objectName,
      namespace: cert.namespace,
      clusterName: cert.clusterName,
      objectType: cert.objectType,
      certificateKey: cert.certificateKey,
      status: cert.status,
      notValidAfter: cert.notValidAfter.toISOString()
    }));

    logger.info(`Retrieved ${certificates.length} certificate results`);
    res.json({ certificates: formattedCertificates });
    
  } catch (error) {
    logger.error('Error fetching certificate results:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/certificates/:id/export - Export single certificate to JSON
router.get('/:id/export', async (req, res) => {
  try {
    const { id } = req.params;

    logger.info(`Exporting single certificate with ID: ${id}`);

    const certificate = await Certificate.findById(id)
      .populate('scanId', 'createdAt clusterId')
      .populate('clusterId', 'name url');

    if (!certificate) {
      logger.warn(`Certificate not found for export: ${id}`);
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const exportData = {
      export_timestamp: new Date().toISOString(),
      export_type: 'single_certificate',
      certificate: {
        id: certificate._id,
        scan_id: certificate.scanId._id,
        cluster: {
          id: certificate.clusterId._id,
          name: certificate.clusterId.name,
          url: certificate.clusterId.url
        },
        namespace: certificate.namespace,
        object_name: certificate.objectName,
        object_type: certificate.objectType,
        certificate_key: certificate.certificateKey,
        status: certificate.status,
        not_valid_before: certificate.notValidBefore?.toISOString(),
        not_valid_after: certificate.notValidAfter.toISOString(),
        days_remaining: certificate.daysRemaining,
        issuer: certificate.issuer,
        subject: certificate.subject,
        scan_timestamp: certificate.scanId.createdAt.toISOString()
      }
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const buffer = Buffer.from(jsonString, 'utf8');

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${certificate.objectName}-${Date.now()}.json"`);
    res.setHeader('Content-Length', buffer.length);

    logger.info(`Successfully exported certificate: ${id}`);
    res.send(buffer);

  } catch (error) {
    logger.error('Error exporting single certificate:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/certificates/export - Bulk export certificates to JSON
router.post('/export', async (req, res) => {
  try {
    const { format, filters = {}, certificateIds = [] } = req.body;

    logger.info('Bulk exporting certificates with filters:', { format, filters, certificateCount: certificateIds.length });

    if (format !== 'json') {
      return res.status(400).json({ error: 'Only JSON format is supported' });
    }

    let query = {};

    // If specific certificate IDs are provided, use them
    if (certificateIds.length > 0) {
      // Validate certificate IDs
      const validIds = certificateIds.filter(id => id && id.match(/^[0-9a-fA-F]{24}$/));
      if (validIds.length === 0) {
        return res.status(400).json({ error: 'No valid certificate IDs provided' });
      }
      query._id = { $in: validIds };
    } else {
      // Otherwise, use filters to get latest scan results
      const latestScans = await Scan.aggregate([
        { $match: { status: 'completed' } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: '$clusterId', latestScanId: { $first: '$_id' } } }
      ]);

      const scanIds = latestScans.map(s => s.latestScanId);
      query.scanId = { $in: scanIds };

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query.status = filters.status;
      }

      if (filters.cluster && filters.cluster !== 'all') {
        query.clusterName = filters.cluster;
      }

      if (filters.search) {
        query.$or = [
          { objectName: { $regex: filters.search, $options: 'i' } },
          { namespace: { $regex: filters.search, $options: 'i' } },
          { clusterName: { $regex: filters.search, $options: 'i' } }
        ];
      }
    }

    const certificates = await Certificate.find(query)
      .populate('scanId', 'createdAt clusterId')
      .populate('clusterId', 'name url')
      .sort({ notValidAfter: 1 });

    if (certificates.length === 0) {
      logger.warn('No certificates found for export');
      return res.status(404).json({ error: 'No certificates found matching the criteria' });
    }

    // Calculate summary statistics
    const summary = {
      total_certificates: certificates.length,
      ok_count: certificates.filter(c => c.status === 'OK').length,
      warning_count: certificates.filter(c => c.status === 'WARNING').length,
      expired_count: certificates.filter(c => c.status === 'EXPIRED').length
    };

    const exportData = {
      export_timestamp: new Date().toISOString(),
      export_type: 'bulk_certificates',
      summary,
      certificates: certificates.map(cert => ({
        id: cert._id,
        scan_id: cert.scanId._id,
        cluster: {
          id: cert.clusterId._id,
          name: cert.clusterId.name,
          url: cert.clusterId.url
        },
        namespace: cert.namespace,
        object_name: cert.objectName,
        object_type: cert.objectType,
        certificate_key: cert.certificateKey,
        status: cert.status,
        not_valid_before: cert.notValidBefore?.toISOString(),
        not_valid_after: cert.notValidAfter.toISOString(),
        days_remaining: cert.daysRemaining,
        issuer: cert.issuer,
        subject: cert.subject,
        scan_timestamp: cert.scanId.createdAt.toISOString()
      }))
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const buffer = Buffer.from(jsonString, 'utf8');

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="certificates-export-${Date.now()}.json"`);
    res.setHeader('Content-Length', buffer.length);

    logger.info(`Successfully exported ${certificates.length} certificates`);
    res.send(buffer);

  } catch (error) {
    logger.error('Error bulk exporting certificates:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;