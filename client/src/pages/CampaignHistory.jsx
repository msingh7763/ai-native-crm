import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { getCampaigns, getCampaignStats } from '../services/api';
import { ThemeContext } from '../App';
import { Megaphone, Clock, BarChart3, RefreshCw } from 'lucide-react';

const POLL_INTERVAL = 3000; // 3 seconds

const StatBox = ({ value, label, colorClass }) => (
  <div className={`${colorClass} rounded-lg p-2 text-center`}>
    <p className="font-bold">{value}%</p>
    <p className="opacity-70">{label}</p>
  </div>
);

const RunningBadge = () => (
  <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-100 dark:bg-orange-900/40 border border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300">
    {/* Pulsing dot */}
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
    </span>
    Running
  </span>
);

const CampaignCard = ({ campaign, onStatusChange }) => {
  const [stats, setStats] = useState(campaign.stats);
  const [status, setStatus] = useState(campaign.status);
  const [refreshing, setRefreshing] = useState(false);
  const pollRef = useRef(null);

  const fetchStats = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await getCampaignStats(campaign._id);
      setStats(res.data.stats);
      if (res.data.status !== status) {
        setStatus(res.data.status);
        // Notify parent so the badge transitions to Completed
        if (onStatusChange) onStatusChange(campaign._id, res.data.status);
      }
    } catch (_) {
      // silently ignore poll errors
    } finally {
      setRefreshing(false);
    }
  }, [campaign._id, status, onStatusChange]);

  useEffect(() => {
    if (status === 'Running') {
      // Immediate first poll
      fetchStats();
      pollRef.current = setInterval(fetchStats, POLL_INTERVAL);
    }
    return () => clearInterval(pollRef.current);
  }, [status]); // re-run only when status changes

  const isRunning = status === 'Running';

  return (
    <div className="bg-white dark:bg-orange-800 rounded-xl shadow-sm border border-red-100 dark:border-gray-700 overflow-hidden card-hover flex flex-col">
      <div className="p-5 border-b border-red-100 dark:border-gray-700 flex-1">
        <div className="flex justify-between items-start mb-4">
          {isRunning ? (
            <RunningBadge />
          ) : (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full border bg-red-100 dark:bg-gray-800/30 border-red-200 dark:border-gray-800">
              {status}
            </span>
          )}
          <div className="flex items-center gap-2">
            {isRunning && (
              <RefreshCw
                size={12}
                className={`text-orange-400 ${refreshing ? 'animate-spin' : ''}`}
              />
            )}
            <span className="flex items-center text-xs font-medium">
              <Clock size={14} className="mr-1" />
              {new Date(campaign.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-bold dark: mb-2 line-clamp-1">{campaign.name}</h3>
        <p className="text-sm dark: line-clamp-2 mb-3">{campaign.subjectLine}</p>

        {/* Progress bar for Running campaigns */}
        {isRunning && stats && stats.sent > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1 opacity-70">
              <span>Delivery progress</span>
              <span>{stats.delivered} / {stats.sent}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-orange-500 h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${stats.deliveryRate}%` }}
              />
            </div>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-4 gap-2 text-xs">
            <StatBox
              value={stats.deliveryRate}
              label="Delivered"
              colorClass="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
            />
            <StatBox
              value={stats.openRate}
              label="Opened"
              colorClass="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
            />
            <StatBox
              value={stats.clickRate}
              label="Clicked"
              colorClass="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
            />
            <StatBox
              value={stats.conversionRate}
              label="Orders"
              colorClass="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
            />
          </div>
        )}

        {/* Pending count for running campaigns */}
        {isRunning && stats && (
          <p className="text-xs mt-2 opacity-60">
            {stats.pending > 0
              ? `⏳ ${stats.pending} message${stats.pending !== 1 ? 's' : ''} pending…`
              : '✓ All messages dispatched'}
          </p>
        )}
      </div>

      <div className="bg-red-50 dark:bg-gray-800/50 p-4 flex justify-between items-center text-sm">
        <div className="flex items-center font-medium">
          <Megaphone size={16} className="mr-2 text-indigo-500" />
          {campaign.channel}
        </div>
        <div className="flex items-center font-medium">
          <BarChart3 size={16} className="mr-2" />
          {stats?.sent ?? campaign.audienceCount} sent
        </div>
      </div>
    </div>
  );
};

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

  // When a running card transitions to Completed, refresh the list once
  const handleStatusChange = useCallback((id, newStatus) => {
    setCampaigns(prev =>
      prev.map(c => c._id === id ? { ...c, status: newStatus } : c)
    );
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-black">Campaign History</h1>
        <p className="dark:text-black-800">Track and analyze your past broadcasts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12 dark:text-gray-700">Loading campaigns...</div>
        ) : error ? (
          <div className="col-span-3 text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-red-300 dark:border-gray-800">
            {error}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="col-span-3 text-center py-12 dark:bg-white dark:bg-gray-800 rounded-xl border border-dashed border-red-300 dark:border-gray-700">
            No campaigns found. Go create one!
          </div>
        ) : (
          campaigns.map(c => (
            <CampaignCard
              key={c._id}
              campaign={c}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CampaignHistory;
