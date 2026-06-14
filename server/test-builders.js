const axios = require('axios');

async function test() {
  try {
    const res1 = await axios.post('http://localhost:5002/api/segments/build', { prompt: "Test fallback query" });
    console.log("Segment:", res1.data);
    
    const res2 = await axios.post('http://localhost:5002/api/campaigns/generate', { goal: "discount" });
    console.log("Campaign:", res2.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
test();
