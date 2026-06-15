import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { getCampaigns, getCampaignStats, deleteCampaign } from '../services/api';
import { ThemeContext } from '../App';
import { Megaphone, Clock, BarChart3, Trash2, CheckCircle2 } from 'lucide-react';

const POLL_INTERVAL = 2500;
const COMPLETED_EXTRA_POLLS = 4;

/* ── Animated counter ───────────────────────────────────────── */
const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(parseFloat(value));
  const prevRef = useRef(parseFloat(value));
  useEffect(() => {
    const target = parseFloat(value);
    const start = prevRef.current;
    if (start === target) return;
    const duration = 600, startTime = performance.now();
    const step = (now) => {
      const p = Math.min((now - startTime) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(parseFloat((start + (target - start) * e).toFixed(1)));
      if (p < 1) requestAnimationFrame(step);
      else prevRef.current = target;
    };
    requestAnimationFrame(step);
  }, [value]);
  return <>{display.toFixed(1)}</>;
};

/* ── Stat box ───────────────────────────────────────────────── */
const StatBox = ({ value, label, color, bg }) => (
  <div className="rounded-xl p-2.5 text-center" style={{ background: bg }}>
    <p className="font-bold text-sm" style={{ color }}>
      <AnimatedNumber value={value} />%
    </p>
    <p className="text-xs mt-0.5 opacity-70">{label}</p>
  </div>
);

/* ── Pulsing dot ────────────────────────────────────────────── */
const PulsingDot = () => (
  <span className="relative flex h-2 w-2 mr-1.5">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
      style={{ background: '#F28C6F' }} />
    <span className="relative inline-flex rounded-full h-2 w-2"
      style={{ background: '#F28C6F' }} />
  </span>
);

/* ── Campaign Card ──────────────────────────────────────────── */
const CampaignCard = ({ campaign, onCompleted, onDeleted }) => {
  const [stats, setStats] = useState(campaign.stats || {
    sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0,
    failed: 0, pending: 0,
    deliveryRate: '0.0', openRate: '0.0', clickRate: '0.0', conversionRate: '0.0',
  });
  const [status, setStatus]       = useState(campaign.status);
  const [confirmDelete, setConfirm] = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const pollRef      = useRef(null);
  const confirmTimer = useRef(null);
  const extraPolls   = useRef(0);

  const poll = useCallback(async () => {
    try {
      const res = await getCampaignStats(campaign._id);
      setStats(res.data.stats);
      if (res.data.status === 'Completed' && status !== 'Completed') {
        setStatus('Completed');
        extraPolls.current = 0;
        if (onCompleted) onCompleted(campaign._id);
      } else if (res.data.status === 'Completed') {
        extraPolls.current += 1;
        if (extraPolls.current >= COMPLETED_EXTRA_POLLS) clearInterval(pollRef.current);
      }
    } catch { /* silent */ }
  }, [campaign._id, status, onCompleted]);

  useEffect(() => {
    if (status === 'Running') {
      poll();
      pollRef.current = setInterval(poll, POLL_INTERVAL);
      return () => clearInterval(pollRef.current);
    }
    // Completed with 0% — poll a few times to recover stats
    if (status === 'Completed' &&
        parseFloat(campaign.stats?.deliveryRate || '0') === 0 &&
        (campaign.audienceCount || 0) > 0) {
      extraPolls.current = 0;
      poll();
      pollRef.current = setInterval(poll, POLL_INTERVAL);
      return () => clearInterval(pollRef.current);
    }
  }, [status]);

  const handleDeleteClick = () => {
    setConfirm(true);
    confirmTimer.current = setTimeout(() => setConfirm(false), 3000);
  };
  const handleDeleteConfirm = async () => {
    clearTimeout(confirmTimer.current);
    clearInterval(pollRef.current);
    setDeleting(true);
    try {
      await deleteCampaign(campaign._id);
      if (onDeleted) onDeleted(campaign._id);
    } catch {
      setDeleting(false);
      setConfirm(false);
    }
  };
  const handleDeleteCancel = () => {
    clearTimeout(confirmTimer.current);
    setConfirm(false);
  };
  useEffect(() => () => clearTimeout(confirmTimer.current), []);

  const isRunning    = status === 'Running';
  const dispatchPct  = (campaign.audienceCount || 0) > 0
    ? Math.min(((stats.sent || 0) / campaign.audienceCount) * 100, 100) : 0;

  return (
    <div
      className="rounded-2xl border flex flex-col overflow-hidden card-hover transition-opacity duration-300"
      style={{
        background: '#fff',
        borderColor: '#F1E3DA',
        opacity: deleting ? 0.4 : 1,
        pointerEvents: deleting ? 'none' : 'auto',
      }}
    >
      {/* Body */}
      <div className="p-5 flex-1">

        {/* Badge + date */}
        <div className="flex items-center justify-between mb-4">
          {isRunning ? (
            <span className="flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border"
              style={{ background: '#FFF1E8', borderColor: '#FFD6C8', color: '#E07355' }}>
              <PulsingDot /> Running
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border"
              style={{ background: '#F0FDF4', borderColor: '#C6E8C2', color: '#5A9A52' }}>
              <CheckCircle2 size={12} /> Completed
            </span>
          )}
          <span className="flex items-center text-xs" style={{ color: '#B8AFA9' }}>
            <Clock size={12} className="mr-1" />
            {new Date(campaign.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Title + subject */}
        <h3 className="font-bold text-base mb-1 line-clamp-1" style={{ color: '#2D2A26' }}>
          {campaign.name}
        </h3>
        <p className="text-sm mb-4 line-clamp-1" style={{ color: '#7A736E' }}>
          {campaign.subjectLine}
        </p>

        {/* Dispatch progress bar — running only */}
        {isRunning && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1" style={{ color: '#B8AFA9' }}>
              <span>Dispatching</span>
              <span>{stats.sent || 0} / {campaign.audienceCount || 0}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F8EDE8' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${dispatchPct}%`, background: 'linear-gradient(90deg,#F28C6F,#E07355)' }} />
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2">
          <StatBox value={stats.deliveryRate}   label="Delivered" color="#F28C6F" bg="#FFF1E8" />
          <StatBox value={stats.openRate}        label="Opened"    color="#60A5FA" bg="#EFF6FF" />
          <StatBox value={stats.clickRate}       label="Clicked"   color="#C084FC" bg="#FDF4FF" />
          <StatBox value={stats.conversionRate}  label="Orders"    color="#4ADE80" bg="#F0FDF4" />
        </div>

        {/* Pending status line */}
        {isRunning && (
          <p className="text-xs mt-3" style={{ color: '#B8AFA9' }}>
            {(stats.pending || 0) > 0
              ? `⏳ ${stats.pending} pending · ${stats.delivered} delivered · ${stats.failed} failed`
              : (stats.sent || 0) > 0
                ? '✓ All dispatched — finalising receipts…'
                : 'Sending…'}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t flex items-center justify-between text-sm"
        style={{ borderColor: '#F8EDE8', background: '#FFFAF7' }}>
        <div className="flex items-center gap-1.5 font-medium" style={{ color: '#7A736E' }}>
          <Megaphone size={14} style={{ color: '#F28C6F' }} />
          {campaign.channel}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium" style={{ color: '#7A736E' }}>
            <BarChart3 size={14} />
            {stats.sent || campaign.audienceCount} sent
          </div>
          {!confirmDelete ? (
            <button onClick={handleDeleteClick}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: '#B8AFA9' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#F87171'; }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#B8AFA9'; }}>
              <Trash2 size={14} />
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium" style={{ color: '#F28C6F' }}>Delete?</span>
              <button onClick={handleDeleteConfirm}
                className="px-2 py-1 text-xs font-semibold rounded-lg text-white"
                style={{ background: '#F28C6F' }}>Yes</button>
              <button onClick={handleDeleteCancel}
                className="px-2 py-1 text-xs font-semibold rounded-lg border"
                style={{ borderColor: '#F1E3DA', color: '#7A736E' }}>No</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Page ──────────────────────────────────────────────────── */
const CampaignHistory = () => {
  const { liveUpdates } = useContext(ThemeContext);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const fetchCampaigns = async () => {
    try {
      const res = await getCampaigns();
      setCampaigns(res.data);
      setError('');
    } catch {
      setError('Unable to load campaigns. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCampaigns(); }, []);
  useEffect(() => { if (liveUpdates?.length > 0) fetchCampaigns(); }, [liveUpdates]);

  const handleCompleted = useCallback((id) => {
    setCampaigns(prev => prev.map(c => c._id === id ? { ...c, status: 'Completed' } : c));
  }, []);
  const handleDeleted = useCallback((id) => {
    setCampaigns(prev => prev.filter(c => c._id !== id));
  }, []);

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h2 className="text-xl font-bold" style={{ color: '#2D2A26' }}>Campaign History</h2>
        <p className="text-sm mt-0.5" style={{ color: '#7A736E' }}>
          {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} total
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 animate-spin"
            style={{ borderColor: '#FFD6C8', borderTopColor: '#F28C6F' }} />
        </div>
      ) : error ? (
        <div className="text-center py-16 rounded-2xl border border-dashed"
          style={{ borderColor: '#FFD6C8', color: '#F28C6F' }}>
          {error}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed"
          style={{ borderColor: '#F1E3DA', color: '#B8AFA9' }}>
          No campaigns yet — go create one!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {campaigns.map(c => (
            <CampaignCard
              key={c._id}
              campaign={c}
              onCompleted={handleCompleted}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignHistory;
