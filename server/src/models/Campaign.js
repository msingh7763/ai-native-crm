const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  goal: { type: String, required: true },
  subjectLine: { type: String, required: true },
  message: { type: String, required: true },
  channel: { type: String, enum: ['WhatsApp', 'Email', 'SMS', 'RCS'], required: true },
  targetSegment: { type: Object, required: true }, // The mongo query or segment rules
  status: { type: String, enum: ['Draft', 'Running', 'Completed'], default: 'Draft' },
  audienceCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
