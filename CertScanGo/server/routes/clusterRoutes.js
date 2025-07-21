const express = require('express');
const router = express.Router();
const Cluster = require('../models/Cluster');
const OpenShiftClient = require('../services/openShiftClient');
const logger = require('../utils/logger');

// GET /api/clusters - Get all clusters
router.get('/', async (req, res) => {
  try {
    logger.info('Fetching all clusters');

    const clusters = await Cluster.find()
      .select('name url namespaces autoScan createdAt updatedAt')
      .sort({ createdAt: -1 });

    const formattedClusters = clusters.map(cluster => ({
      _id: cluster._id,
      name: cluster.name,
      url: cluster.url,
      namespaces: cluster.namespaces || [],
      autoScan: cluster.autoScan || false,
      createdAt: cluster.createdAt.toISOString(),
      updatedAt: cluster.updatedAt.toISOString()
    }));

    logger.info(`Retrieved ${clusters.length} clusters`);
    res.json({ clusters: formattedClusters });

  } catch (error) {
    logger.error('Error fetching clusters:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/clusters - Create a new cluster
router.post('/', async (req, res) => {
  try {
    const { name, url, token, namespaces, autoScan } = req.body;

    if (!name || !url || !token) {
      return res.status(400).json({ error: 'Name, URL, and token are required' });
    }

    logger.info(`Creating new cluster: ${name}`);

    const cluster = new Cluster({
      name,
      url,
      token,
      namespaces: namespaces || [],
      autoScan: autoScan || false
    });

    await cluster.save();

    logger.info(`Created cluster with ID: ${cluster._id}`);
    res.status(201).json({
      _id: cluster._id,
      name: cluster.name,
      url: cluster.url,
      namespaces: cluster.namespaces,
      autoScan: cluster.autoScan,
      message: 'Cluster created successfully'
    });

  } catch (error) {
    logger.error('Error creating cluster:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/clusters/:id - Update a cluster
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, token, namespaces, autoScan } = req.body;

    logger.info(`Updating cluster: ${id}`);

    const cluster = await Cluster.findById(id);
    if (!cluster) {
      return res.status(404).json({ error: 'Cluster not found' });
    }

    // Update fields
    if (name) cluster.name = name;
    if (url) cluster.url = url;
    if (token) cluster.token = token;
    if (namespaces !== undefined) cluster.namespaces = namespaces;
    if (autoScan !== undefined) cluster.autoScan = autoScan;

    await cluster.save();

    logger.info(`Updated cluster: ${id}`);
    res.json({
      _id: cluster._id,
      name: cluster.name,
      url: cluster.url,
      namespaces: cluster.namespaces,
      autoScan: cluster.autoScan,
      message: 'Cluster updated successfully'
    });

  } catch (error) {
    logger.error('Error updating cluster:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/clusters/:id - Delete a cluster
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    logger.info(`Deleting cluster: ${id}`);

    const cluster = await Cluster.findById(id);
    if (!cluster) {
      return res.status(404).json({ error: 'Cluster not found' });
    }

    await Cluster.findByIdAndDelete(id);

    logger.info(`Deleted cluster: ${id}`);
    res.json({ message: 'Cluster deleted successfully' });

  } catch (error) {
    logger.error('Error deleting cluster:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/clusters/:id/test - Test cluster connection
router.post('/:id/test', async (req, res) => {
  try {
    const { id } = req.params;

    logger.info(`Testing connection for cluster: ${id}`);

    const cluster = await Cluster.findById(id);
    if (!cluster) {
      return res.status(404).json({ error: 'Cluster not found' });
    }

    const client = new OpenShiftClient(cluster.url, cluster.token);
    const result = await client.testConnection();

    logger.info(`Connection test successful for cluster: ${id}`);
    res.json({
      success: true,
      message: 'Connection successful',
      namespaces: result.namespaces
    });

  } catch (error) {
    logger.error(`Connection test failed for cluster ${id}:`, error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/clusters/status - Get cluster status information
router.get('/status', async (req, res) => {
  try {
    logger.info('Fetching cluster status information');

    const clusters = await Cluster.find().select('name url');
    const clusterStatuses = [];

    for (const cluster of clusters) {
      try {
        const client = new OpenShiftClient(cluster.url, cluster.token);
        await client.testConnection();

        // Get latest scan for this cluster
        const Scan = require('../models/Scan');
        const latestScan = await Scan.findOne({ clusterId: cluster._id })
          .sort({ createdAt: -1 });

        clusterStatuses.push({
          _id: cluster._id,
          name: cluster.name,
          url: cluster.url,
          status: 'connected',
          lastScan: latestScan ? latestScan.createdAt.toISOString() : null,
          certificateCount: latestScan ? latestScan.certificatesFound : 0,
          health: latestScan ? latestScan.summary : { valid: 0, warning: 0, expired: 0 }
        });

      } catch (error) {
        clusterStatuses.push({
          _id: cluster._id,
          name: cluster.name,
          url: cluster.url,
          status: 'error',
          lastScan: null,
          certificateCount: 0,
          health: { valid: 0, warning: 0, expired: 0 }
        });
      }
    }

    logger.info(`Retrieved status for ${clusterStatuses.length} clusters`);
    res.json({ clusters: clusterStatuses });

  } catch (error) {
    logger.error('Error fetching cluster status:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;