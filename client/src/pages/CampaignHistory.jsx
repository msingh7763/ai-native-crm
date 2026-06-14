import React, { useEffect, useState, useContext } from 'react';
import { getCampaigns } from '../services/api';
import { ThemeContext } from '../App';
import { Megaphone, Activity, Clock, BarChart3 } from 'lucide-react';

const CampaignHistory = () => {
  const { liveUpdates } = useContext(ThemeContext);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCampaigns = async () => {
    try {
      const res = await getCampaigns();
      setCampaigns(res.data);
      setError('');
    } catch (err) {
      setError('Unable to load campaigns. Is the server running on port 5002?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (liveUpdates.length > 0) {
      fetchCampaigns();
    }
  }, [liveUpdates]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Running': return 'bg-red-100   dark:bg-gray-800/30 dark:  border-red-200 dark:border-gray-800';
      case 'Completed': return 'bg-red-100   dark:bg-gray-800/30 dark:  border-red-200 dark:border-gray-800';
      default: return 'bg-red-100   dark:bg-gray-800 dark:  border-red-200 dark:border-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-black">Campaign History</h1>
        <p className="dark:text-black-700">Track and analyze your past broadcasts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12 dark:text-gray-700">Loading campaigns...</div>
        ) : error ? (
          <div className="col-span-3 text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-red-300 dark:border-gray-800">
            {error}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="col-span-3 text-center py-12 dark: bg-white dark:bg-gray-800 rounded-xl border border-dashed border-red-300 dark:border-gray-700">
            No campaigns found. Go create one!
          </div>
        ) : (
          campaigns.map(c => (
            <div key={c._id} className="bg-white dark:bg-orange-800 rounded-xl shadow-sm border border-red-100 dark:border-gray-700 overflow-hidden card-hover flex flex-col">
              <div className="p-5 border-b border-red-100 dark:border-gray-700 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(c.status)}`}>
                    {c.status}
                  </span>
                  <span className="flex items-center text-xs dark: font-medium">
                    <Clock size={14} className="mr-1" />
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold dark: mb-2 line-clamp-1">{c.name}</h3>
                <p className="text-sm dark: line-clamp-2 mb-3">{c.subjectLine}</p>
                {c.stats && (
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
                      <p className="font-bold text-green-700 dark:text-green-300">{c.stats.deliveryRate}%</p>
                      <p className="opacity-70">Delivered</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
                      <p className="font-bold text-blue-700 dark:text-blue-300">{c.stats.openRate}%</p>
                      <p className="opacity-70">Opened</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 text-center">
                      <p className="font-bold text-purple-700 dark:text-purple-300">{c.stats.clickRate}%</p>
                      <p className="opacity-70">Clicked</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 text-center">
                      <p className="font-bold text-amber-700 dark:text-amber-300">{c.stats.conversionRate}%</p>
                      <p className="opacity-70">Orders</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-red-50 dark:bg-gray-800/50 p-4 flex justify-between items-center text-sm">
                <div className="flex items-center font-medium">
                  <Megaphone size={16} className="mr-2 text-indigo-500" />
                  {c.channel}
                </div>
                <div className="flex items-center font-medium">
                  <BarChart3 size={16} className="mr-2" />
                  {c.stats?.sent ?? c.audienceCount} sent
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CampaignHistory;
