const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  clusterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cluster',
    required: true
  },
  clusterName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'failed'],
    default: 'in_progress'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  certificatesFound: {
    type: Number,
    default: 0
  },
  summary: {
    valid: { type: Number, default: 0 },
    warning: { type: Number, default: 0 },
    expired: { type: Number, default: 0 }
  },
  error: {
    type: String
  },
  namespaces: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for efficient queries
scanSchema.index({ clusterId: 1, createdAt: -1 });
scanSchema.index({ status: 1 });
scanSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Scan', scanSchema);