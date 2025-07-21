const k8s = require('@kubernetes/client-node');
const logger = require('../utils/logger');

class OpenShiftClient {
  constructor(clusterUrl, token) {
    this.clusterUrl = clusterUrl;
    this.token = token;
    this.kc = new k8s.KubeConfig();
    
    // Configure the client
    this.kc.loadFromOptions({
      clusters: [{
        name: 'cluster',
        server: clusterUrl,
        skipTLSVerify: true // In production, you should use proper TLS verification
      }],
      users: [{
        name: 'user',
        token: token
      }],
      contexts: [{
        name: 'context',
        cluster: 'cluster',
        user: 'user'
      }],
      currentContext: 'context'
    });

    this.coreV1Api = this.kc.makeApiClient(k8s.CoreV1Api);
  }

  async testConnection() {
    try {
      logger.info(`Testing connection to OpenShift cluster: ${this.clusterUrl}`);
      const response = await this.coreV1Api.listNamespace();
      logger.info(`Successfully connected to cluster. Found ${response.body.items.length} namespaces`);
      return { success: true, namespaces: response.body.items.length };
    } catch (error) {
      logger.error(`Failed to connect to cluster ${this.clusterUrl}:`, error.message);
      throw new Error(`Connection failed: ${error.message}`);
    }
  }

  async getNamespaces() {
    try {
      const response = await this.coreV1Api.listNamespace();
      return response.body.items.map(ns => ns.metadata.name);
    } catch (error) {
      logger.error(`Failed to get namespaces:`, error.message);
      throw new Error(`Failed to get namespaces: ${error.message}`);
    }
  }

  async getSecretsInNamespace(namespace) {
    try {
      const response = await this.coreV1Api.listNamespacedSecret(namespace);
      return response.body.items;
    } catch (error) {
      logger.error(`Failed to get secrets in namespace ${namespace}:`, error.message);
      throw new Error(`Failed to get secrets: ${error.message}`);
    }
  }

  async getConfigMapsInNamespace(namespace) {
    try {
      const response = await this.coreV1Api.listNamespacedConfigMap(namespace);
      return response.body.items;
    } catch (error) {
      logger.error(`Failed to get configmaps in namespace ${namespace}:`, error.message);
      throw new Error(`Failed to get configmaps: ${error.message}`);
    }
  }
}

module.exports = OpenShiftClient;