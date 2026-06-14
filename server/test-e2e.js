const axios = require('axios');

async function testE2E() {
  try {
    console.log("Launching campaign...");
    const res = await axios.post('http://localhost:5002/api/campaigns/launch', {
      name: "Test Winback",
      goal: "Winback",
      subjectLine: "Hello",
      message: "Hi [Name]",
      channel: "Email",
      targetSegment: { totalSpent: { "$gt": 5000 } }
    });
    
    console.log("Campaign launched. ID:", res.data._id, "Audience Count:", res.data.audienceCount);
    
    console.log("Waiting 12 seconds for channel-service webhooks to process...");
    await new Promise(r => setTimeout(r, 12000));
    
    console.log("Fetching analytics...");
    const analytics = await axios.get('http://localhost:5002/api/analytics');
    
    console.log("Analytics Data:");
    console.log(JSON.stringify(analytics.data, null, 2));
    
  } catch (error) {
    console.error("Test failed:", error.response ? error.response.data : error.message);
  }
}

testE2E();
