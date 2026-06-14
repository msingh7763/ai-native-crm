const Order = require('../models/Order');
const Customer = require('../models/Customer');

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('customerId', 'name email').sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addOrder = async (req, res) => {
  try {
    const { customerId, orderAmount, productCategory } = req.body;
    const order = new Order({ customerId, orderAmount, productCategory });
    await order.save();

    // Update Customer stats
    const customer = await Customer.findById(customerId);
    if (customer) {
      customer.totalSpent += Number(orderAmount);
      customer.lastOrderDate = new Date();
      await customer.save();
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
