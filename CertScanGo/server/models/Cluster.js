const mongoose = require('mongoose');

const clusterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  url: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  namespaces: [{
    type: String
  }],
  autoScan: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
clusterSchema.index({ name: 1 });
clusterSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Cluster', clusterSchema);