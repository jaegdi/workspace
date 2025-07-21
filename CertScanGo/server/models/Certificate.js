const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  scanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scan',
    required: true
  },
  clusterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cluster',
    required: true
  },
  clusterName: {
    type: String,
    required: true
  },
  namespace: {
    type: String,
    required: true
  },
  objectName: {
    type: String,
    required: true
  },
  objectType: {
    type: String,
    enum: ['Secret', 'ConfigMap'],
    required: true
  },
  certificateKey: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['OK', 'WARNING', 'EXPIRED'],
    required: true
  },
  notValidBefore: {
    type: Date
  },
  notValidAfter: {
    type: Date,
    required: true
  },
  daysRemaining: {
    type: Number,
    required: true
  },
  issuer: {
    type: String
  },
  subject: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
certificateSchema.index({ scanId: 1 });
certificateSchema.index({ clusterId: 1, status: 1 });
certificateSchema.index({ status: 1 });
certificateSchema.index({ notValidAfter: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);