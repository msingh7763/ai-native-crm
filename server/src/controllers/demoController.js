const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Campaign = require('../models/Campaign');
const CommunicationLog = require('../models/CommunicationLog');
const { clearCache } = require('../services/inMemoryCache');

exports.generateDemoData = async (req, res) => {
  try {
    await Customer.deleteMany({});
    await Order.deleteMany({});
    await Campaign.deleteMany({});
    await CommunicationLog.deleteMany({});

    const customers = [];
    const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'];
    
    for (let i = 0; i < 500; i++) {
      customers.push({
        name: `Customer ${i+1}`,
        email: `customer${i+1}@example.com`,
        phone: `+9198${Math.floor(10000000 + Math.random() * 90000000)}`,
        city: cities[Math.floor(Math.random() * cities.length)],
        totalSpent: 0,
        lastOrderDate: null
      });
    }

    const savedCustomers = await Customer.insertMany(customers);
    const customerMap = new Map(savedCustomers.map(c => [c._id.toString(), c]));

    const orders = [];
    const categories = ['Electronics', 'Clothing', 'Groceries', 'Books', 'Home'];

    for (let i = 0; i < 2000; i++) {
      const c = savedCustomers[Math.floor(Math.random() * savedCustomers.length)];
      const amount = Math.floor(Math.random() * 5000) + 100;
      
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 100));

      orders.push({
        customerId: c._id,
        orderAmount: amount,
        orderDate: date,
        productCategory: categories[Math.floor(Math.random() * categories.length)]
      });

      const custObj = customerMap.get(c._id.toString());
      if (custObj) {
        custObj.totalSpent += amount;
        if (!custObj.lastOrderDate || new Date(custObj.lastOrderDate) < date) {
          custObj.lastOrderDate = date;
        }
      }
    }

    await Order.insertMany(orders);

    await Customer.bulkWrite(
      savedCustomers.map(sc => ({
        updateOne: {
          filter: { _id: sc._id },
          update: { $set: { totalSpent: sc.totalSpent, lastOrderDate: sc.lastOrderDate } }
        }
      }))
    );

    clearCache('analytics_dashboard');

    res.json({ message: '500 Customers and 2000 Orders generated successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
