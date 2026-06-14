const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const CRM_WEBHOOK_URL = process.env.CRM_WEBHOOK_URL || 'http://localhost:5002/api/webhook/receipt';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

// Probability-based status generator (Assignment-Compliant Simulator)
const generateStatus = () => {
  const rand = Math.random() * 100;
  if (rand < 10) return 'Failed'; // 10% failed
  if (rand < 30) return 'Delivered'; // 20% delivered but not opened
  if (rand < 65) return 'Opened'; // 35% opened
  if (rand < 85) return 'Read'; // 20% read
  if (rand < 95) return 'Clicked'; // 10% clicked
  return 'Converted'; // 5% converted (ordered)
};

app.post('/api/send', (req, res) => {
  const { logId, customerId, campaignId, channel, recipient, subjectLine, message } = req.body;

  if (!logId) {
    return res.status(400).json({ error: 'logId is required' });
  }

  // Acknowledge receipt immediately
  res.status(202).json({ status: 'Processing' });

  // Simulate networking delay 2-5 seconds
  const delay = Math.floor(Math.random() * 3000) + 2000;

  setTimeout(async () => {
    const finalStatus = generateStatus();
    
    try {
      await axios.post(CRM_WEBHOOK_URL, {
        logId,
        status: finalStatus
      }, {
        headers: {
          'x-webhook-token': WEBHOOK_SECRET || ''
        }
      });
      console.log(`[SIMULATOR] Sent webhook for log ${logId} (${channel}): ${finalStatus}`);
    } catch (error) {
      console.error(`[SIMULATOR] Failed to send webhook for log ${logId}:`, error.message);
    }
  }, delay);
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Assignment-Compliant Channel Stub Service running on port ${PORT}`));
