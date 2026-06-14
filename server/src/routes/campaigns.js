const express = require('express');
const router = express.Router();
const { getCampaigns, generateCampaign, saveAndLaunchCampaign } = require('../controllers/campaignController');

router.get('/', getCampaigns);
router.post('/generate', generateCampaign);
router.post('/launch', saveAndLaunchCampaign);

module.exports = router;
