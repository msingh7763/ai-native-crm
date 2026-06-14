const axios = require('axios');

async function run() {
  try {
    const res = await axios.post('http://localhost:5002/api/customers', {
      name: 'Test Customer ' + Date.now(),
      email: `test${Date.now()}@example.com`,
      phone: '1234567890',
      city: 'Delhi',
      totalSpent: 100,
      lastOrderDate: ''
    });
    console.log("Success! Data:", res.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
run();
