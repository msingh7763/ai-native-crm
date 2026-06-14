const Customer = require('../models/Customer');
const Campaign = require('../models/Campaign');
const CommunicationLog = require('../models/CommunicationLog');
const { getCache, setCache, clearCache } = require('../services/inMemoryCache');

exports.getAnalytics = async (req, res) => {
  try {
    const cacheKey = 'analytics_dashboard';
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const totalCustomers = await Customer.countDocuments();
    const totalCampaigns = await Campaign.countDocuments();
    const groupedStatuses = await CommunicationLog.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = groupedStatuses.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const totalMessages = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    const delivered = (statusCounts.Delivered || 0) + (statusCounts.Opened || 0) + (statusCounts.Read || 0) + (statusCounts.Clicked || 0);
    const opened = (statusCounts.Opened || 0) + (statusCounts.Read || 0) + (statusCounts.Clicked || 0);
    const clicked = statusCounts.Clicked || 0;
    const failed = statusCounts.Failed || 0;

    const deliveryRate = totalMessages ? (delivered / totalMessages) * 100 : 0;
    const openRate = totalMessages ? (opened / totalMessages) * 100 : 0;
    const clickRate = totalMessages ? (clicked / totalMessages) * 100 : 0;

    const analyticsData = {
      totalCustomers,
      totalCampaigns,
      totalMessages,
      deliveryRate: deliveryRate.toFixed(2),
      openRate: openRate.toFixed(2),
      clickRate: clickRate.toFixed(2),
      failed
    };

    setCache(cacheKey, analyticsData, 10); // cache for 10 seconds

    res.json(analyticsData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.clearAnalyticsCache = (req, res) => {
  try {
    clearCache('analytics_dashboard');
    res.json({ message: 'Analytics cache cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
