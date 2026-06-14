const mongoose = require('mongoose');

const communicationLogSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  channel: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Sent', 'Delivered', 'Failed', 'Opened', 'Read', 'Clicked', 'Converted'], 
    default: 'Pending' 
  },
}, { timestamps: true });

module.exports = mongoose.model('CommunicationLog', communicationLogSchema);
