const express = require('express');
const router = express.Router();
const Scan = require('../models/Scan');
const Cluster = require('../models/Cluster');
const certificateScanner = require('../services/certificateScanner');
const logger = require('../utils/logger');

// GET /api/scans/recent - Get recent scans
router.get('/recent', async (req, res) => {
  try {
    logger.info('Fetching recent scans');
    
    const scans = await Scan.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('clusterName createdAt certificatesFound status summary');

    const formattedScans = scans.map(scan => ({
      _id: scan._id,
      clusterName: scan.clusterName,
      timestamp: scan.createdAt.toISOString(),
      certificatesFound: scan.certificatesFound,
      status: scan.status,
      summary: scan.summary
    }));

    logger.info(`Retrieved ${scans.length} recent scans`);
    res.json({ scans: formattedScans });
    
  } catch (error) {
    logger.error('Error fetching recent scans:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/scans - Initiate a new scan
router.post('/', async (req, res) => {
  try {
    const { clusterId } = req.body;
    
    if (!clusterId) {
      return res.status(400).json({ error: 'Cluster ID is required' });
    }

    logger.info(`Initiating scan for cluster: ${clusterId}`);
    
    const cluster = await Cluster.findById(clusterId);
    if (!cluster) {
      return res.status(404).json({ error: 'Cluster not found' });
    }

    const scan = await certificateScanner.initiateScan(cluster);
    
    logger.info(`Scan initiated with ID: ${scan._id}`);
    res.status(201).json({
      scanId: scan._id,
      status: scan.status,
      message: 'Scan initiated successfully'
    });
    
  } catch (error) {
    logger.error('Error initiating scan:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/scans/:scanId - Get specific scan details
router.get('/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;
    
    logger.info(`Fetching scan details for: ${scanId}`);
    
    const scan = await Scan.findById(scanId);
    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    res.json({
      _id: scan._id,
      clusterId: scan.clusterId,
      clusterName: scan.clusterName,
      status: scan.status,
      startedAt: scan.startedAt.toISOString(),
      completedAt: scan.completedAt ? scan.completedAt.toISOString() : null,
      certificatesFound: scan.certificatesFound,
      summary: scan.summary,
      error: scan.error,
      namespaces: scan.namespaces
    });
    
  } catch (error) {
    logger.error('Error fetching scan details:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/scans/statistics - Get scan statistics
router.get('/statistics', async (req, res) => {
  try {
    logger.info('Fetching scan statistics');
    
    const totalScans = await Scan.countDocuments();
    const completedScans = await Scan.countDocuments({ status: 'completed' });
    const failedScans = await Scan.countDocuments({ status: 'failed' });
    const inProgressScans = await Scan.countDocuments({ status: 'in_progress' });
    
    // Scans in last 24 hours
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    const scansLast24h = await Scan.countDocuments({
      createdAt: { $gte: yesterday }
    });

    const statistics = {
      total_scans: totalScans,
      completed_scans: completedScans,
      failed_scans: failedScans,
      in_progress_scans: inProgressScans,
      scans_last_24h: scansLast24h
    };

    logger.info('Scan statistics retrieved successfully');
    res.json(statistics);
    
  } catch (error) {
    logger.error('Error fetching scan statistics:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;