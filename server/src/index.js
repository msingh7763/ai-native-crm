const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/customers', require('./routes/customers'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/segments', require('./routes/segments'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/webhook', require('./routes/webhook'));
app.use('/api/demo', require('./routes/demo'));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
	await connectDB();
	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
