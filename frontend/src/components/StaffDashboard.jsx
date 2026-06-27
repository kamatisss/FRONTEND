import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDesign } from '../context/DesignContext';
import { loadDesign } from '../services/api';
import {
  LayoutDashboard, Shield, Eye, CheckCircle2,
  ShoppingBag, Calendar, FileText, AlertTriangle, Truck,
  X, Package, Star, ArrowRight, Clock, ChevronDown, ChevronUp,
  CheckCircle, XCircle, Layers,
} from 'lucide-react';
import ThreeGardenCanvas from './ThreeGardenCanvas';

/* ─── Toast notification system ─────────────────────────────────────────── */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500);
  }, []);
  const dismiss = useCallback(id => setToasts(t => t.filter(x => x.id !== id)), []);
  return { toasts, push, dismiss };
}

function ToastStack({ toasts, dismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold min-w-[260px] max-w-sm border transition-all
            ${t.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}
        >
          {t.type === 'success'
            ? <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            : <AlertTriangle size={16} className="shrink-0 text-red-500" />}
          <span className="flex-1">{t.msg}</span>
          <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-50 hover:opacity-100 cursor-pointer bg-transparent border-none p-0">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─── Skeleton loader ────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="border border-slate-100 rounded-2xl bg-white p-5 shadow-sm animate-pulse">
      <div className="w-full h-36 bg-slate-100 rounded-xl mb-4" />
      <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
      <div className="h-3 bg-slate-100 rounded w-1/2 mb-4" />
      <div className="space-y-2">
        <div className="h-3 bg-slate-100 rounded" />
        <div className="h-3 bg-slate-100 rounded" />
        <div className="h-3 bg-slate-100 rounded w-4/5" />
      </div>
      <div className="mt-5 h-9 bg-slate-100 rounded-xl" />
    </div>
  );
}

/* ─── Status badge ───────────────────────────────────────────────────────── */
const STATUS_STYLES = {
  Pending:          'bg-amber-50  text-amber-700  border-amber-200',
  Paid:             'bg-emerald-50 text-emerald-700 border-emerald-200',
  Shipped:          'bg-blue-50   text-blue-700   border-blue-200',
  'Out for Delivery':'bg-sky-50   text-sky-700    border-sky-200',
  Delivered:        'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled:        'bg-red-50    text-red-700    border-red-200',
  Confirmed:        'bg-blue-50   text-blue-700   border-blue-200',
  'In Progress':    'bg-amber-50  text-amber-700  border-amber-200',
  'Awaiting Review':'bg-purple-50 text-purple-700 border-purple-200',
};

function Badge({ label }) {
  const cls = STATUS_STYLES[label] || 'bg-slate-100 text-slate-600 border-slate-200';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${cls}`}>
      {label}
    </span>
  );
}

/* ─── Empty state ────────────────────────────────────────────────────────── */
function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white border border-slate-100 rounded-2xl">
      <div className="p-4 bg-slate-50 rounded-2xl mb-4">
        <Icon size={36} className="text-slate-300" strokeWidth={1.5} />
      </div>
      <p className="text-slate-700 font-semibold text-base">{title}</p>
      <p className="text-slate-400 text-sm mt-1">{sub}</p>
    </div>
  );
}

/* ─── Stat card ──────────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, iconBg, iconColor, border }) {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border flex items-center justify-between gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ${border}`}>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
        <p className="text-3xl font-extrabold text-slate-800 leading-none">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${iconBg} shrink-0`}>
        <Icon size={22} className={iconColor} />
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
const StaffDashboard = () => {
  const { authTokens, user } = useAuth();
  const { dispatch } = useDesign();
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, push: toast, dismiss } = useToast();

  const [designs,        setDesigns]        = useState([]);
  const [allDesigns,     setAllDesigns]     = useState([]);
  const [orders,         setOrders]         = useState([]);
  const [bookings,       setBookings]       = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [activeTab,      setActiveTab]      = useState('overview');
  const [expandedOrder,  setExpandedOrder]  = useState(null);
  const [actionLoading,  setActionLoading]  = useState(null);
  const [designModal,    setDesignModal]    = useState(null);
  const [modalArMode,    setModalArMode]    = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

  /* Sync tab with ?tab= URL param */
  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab && ['overview', 'designs', 'bookings', 'orders'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  /* Reset AR mode whenever a new design is opened in the modal */
  useEffect(() => { setModalArMode(false); }, [designModal]);

  const headers = { Authorization: `Bearer ${authTokens?.access}` };

  useEffect(() => {
    if (!authTokens) return;
    const get = (url) => fetch(`${API}${url}`, { headers }).then(r => r.ok ? r.json() : Promise.reject());
    Promise.all([
      get('/designs/submitted_designs/').then(setDesigns).catch(() => {}),
      get('/orders/').then(setOrders).catch(() => {}),
      get('/bookings/').then(setBookings).catch(() => {}),
      get('/inventory/').then(setInventoryItems).catch(() => {}),
      get('/designs/').then(setAllDesigns).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [authTokens]);

  /* ── Derived counts ── */
  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })();
  const pendingDesigns   = designs.length;
  const todaysBookings   = bookings.filter(b => b.scheduled_date === today).length;
  const pendingOrders    = orders.filter(o => o.status?.toLowerCase() === 'pending').length;
  const lowStock         = inventoryItems.filter(i => Number(i.stock_quantity || 0) < 10).length;

  /* ── Tab definitions ── */
  const TABS = [
    { key: 'overview',  label: 'Overview',  Icon: LayoutDashboard, badge: null },
    { key: 'designs',   label: 'Designs',   Icon: Star,            badge: pendingDesigns || null },
    { key: 'bookings',  label: 'Bookings',  Icon: Calendar,        badge: todaysBookings || null },
    { key: 'orders',    label: 'Orders',    Icon: Package,         badge: pendingOrders || null },
  ];

  /* ── API actions ── */
  const updateDesignStatus = async (id, status) => {
    setActionLoading(id);
    try {
      const r = await fetch(`${API}/designs/${id}/update_status/`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (r.ok) {
        setDesigns(d => d.filter(x => x.id !== id));
        toast(`Design ${status === 'approved' ? 'approved' : 'rejected'} successfully.`);
      } else {
        toast('Failed to update design status.', 'error');
      }
    } catch {
      toast('Network error — please try again.', 'error');
    }
    setActionLoading(null);
  };

  const refreshOrders = async () => {
    const r = await fetch(`${API}/orders/`, { headers });
    if (r.ok) setOrders(await r.json());
  };

  const updateOrderStatus = async (id, status) => {
    setActionLoading(id);
    try {
      const r = await fetch(`${API}/orders/${id}/update_status/`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (r.ok) { await refreshOrders(); toast(`Order marked as ${status}.`); }
      else       { const d = await r.json(); toast(d.error || 'Failed to update order.', 'error'); }
    } catch {
      toast('Network error — please try again.', 'error');
    }
    setActionLoading(null);
  };

  const refreshBookings = async () => {
    const r = await fetch(`${API}/bookings/`, { headers });
    if (r.ok) setBookings(await r.json());
  };

  const updateBookingStatus = async (id, status) => {
    setActionLoading(id);
    try {
      const r = await fetch(`${API}/bookings/${id}/update_status/`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (r.ok) { await refreshBookings(); toast(`Booking updated to ${status}.`); }
      else       { toast('Failed to update booking.', 'error'); }
    } catch {
      toast('Network error — please try again.', 'error');
    }
    setActionLoading(null);
  };

  const handleViewDesign = async (id) => {
    try {
      const design = await loadDesign(id);
      dispatch({
        type: 'LOAD_DESIGN',
        payload: {
          designId: design.id,
          designName: design.name,
          depthData: design.depth_data,
          placedItems: (design.placed_items || []).map((item, idx) => ({
            id: Date.now() + idx,
            productId: item.product_id,
            name: item.name,
            modelType: item.model_type,
            price: item.price,
            position: item.position,
            rotation: item.rotation,
            scale: item.scale,
          })),
          dimensions: design.dimensions || { width: 10, length: 15, terrainType: 'flat' },
          terrainHeight: design.terrain_height || 1.5,
          timeOfDay: design.time_of_day || 14,
        },
      });
      navigate('/studio');
    } catch {
      toast('Could not load the design for preview.', 'error');
    }
  };

  const getLinkedDesign = (identifier) =>
    allDesigns.find(d =>
      d.customer_name?.toLowerCase() === identifier?.toLowerCase() ||
      d.name?.toLowerCase().includes(identifier?.toLowerCase())
    );

  const getLotProfile = (booking) => {
    const d = allDesigns.find(x => x.id === booking.design);
    return d?.dimensions
      ? `${d.dimensions.width}m × ${d.dimensions.length}m (${d.dimensions.terrainType || 'flat'})`
      : 'Consultation Lot';
  };

  const getThumbnail = (booking) => {
    const d = allDesigns.find(x => x.id === booking.design);
    return d?.original_image_url || booking.design_details?.image_url || null;
  };

  /* ── Transform placed_items → ThreeGardenCanvas plant format ── */
  const toCanvasPlants = (placedItems = []) =>
    placedItems.map(item => {
      // AI designer flat format: { plant_id, x, z, rotation }
      if (item.plant_id !== undefined) {
        return { plant_id: item.plant_id, x: item.x ?? 0, z: item.z ?? 0, rotation: item.rotation ?? 0 };
      }
      // Studio format: { productId/modelType, position: {x,z}, rotation: {y} }
      return {
        plant_id: item.modelType || item.model_type || String(item.productId || ''),
        x: item.position?.x ?? 0,
        z: item.position?.z ?? 0,
        rotation: item.rotation?.y ?? 0,
      };
    });

  /* ── Greeting ── */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  /* ────────────────────────────── RENDER ────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── Page Header ── */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-600 rounded-2xl shadow-sm">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">
                Staff Portal
              </h1>
              <p className="text-slate-500 text-sm">{greeting}, <span className="font-semibold text-slate-700">{user?.first_name || user?.username || 'Staff'}</span> · {dateStr}</p>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Calendar}      label="Today's Bookings"  value={todaysBookings}  iconBg="bg-emerald-50"  iconColor="text-emerald-600" border="border-slate-100" />
          <StatCard icon={Package}       label="Pending Orders"    value={pendingOrders}   iconBg="bg-blue-50"     iconColor="text-blue-600"    border="border-slate-100" />
          <StatCard icon={FileText}      label="Pending Reviews"   value={pendingDesigns}  iconBg="bg-purple-50"   iconColor="text-purple-600"  border="border-slate-100" />
          <StatCard icon={AlertTriangle} label="Low Stock Alerts"  value={lowStock}        iconBg="bg-red-50"      iconColor="text-red-500"     border="border-slate-100" />
        </div>

        {/* ── Tab Navigation Bar ── */}
        <div className="flex items-center gap-1 mb-6 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm w-fit">
          {TABS.map(({ key, label, Icon, badge }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border-none
                ${activeTab === key
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 bg-transparent'}`}
            >
              <Icon size={15} />
              <span>{label}</span>
              {badge != null && (
                <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold
                  ${activeTab === key ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Loading skeletons ── */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Overview Tab ── */}
        {!loading && activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Welcome banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-sm">
              <h2 className="text-xl font-extrabold mb-1">Welcome back, {user?.first_name || user?.username || 'Staff Member'}!</h2>
              <p className="text-emerald-100 text-sm">Here is your daily operational summary for {dateStr}.</p>
            </div>

            {/* Quick action cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  icon: Star, iconBg: 'bg-purple-100', iconColor: 'text-purple-600',
                  title: 'Design Queue', tab: 'designs',
                  body: pendingDesigns
                    ? `${pendingDesigns} layout${pendingDesigns > 1 ? 's' : ''} awaiting your review.`
                    : 'All design reviews are up to date.',
                  cta: 'Review Designs',
                },
                {
                  icon: Calendar, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600',
                  title: 'Appointments', tab: 'bookings',
                  body: todaysBookings
                    ? `${todaysBookings} consultation${todaysBookings > 1 ? 's' : ''} scheduled for today.`
                    : 'No consultations scheduled for today.',
                  cta: 'View Bookings',
                },
                {
                  icon: Package, iconBg: 'bg-blue-100', iconColor: 'text-blue-600',
                  title: 'Order Fulfillment', tab: 'orders',
                  body: pendingOrders
                    ? `${pendingOrders} order${pendingOrders > 1 ? 's' : ''} pending fulfillment.`
                    : 'No orders pending fulfillment.',
                  cta: 'Manage Orders',
                },
              ].map(({ icon: Icon, iconBg, iconColor, title, tab, body, cta }) => (
                <div key={tab} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                  <div>
                    <div className={`inline-flex p-2.5 rounded-xl ${iconBg} mb-3`}>
                      <Icon size={18} className={iconColor} />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-1">{title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">{body}</p>
                  </div>
                  <button
                    onClick={() => setActiveTab(tab)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer border-none"
                  >
                    {cta} <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Low stock alert strip */}
            {lowStock > 0 && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <AlertTriangle size={18} className="text-red-500 shrink-0" />
                <p className="text-sm text-red-700 font-medium">
                  <span className="font-bold">{lowStock} inventory item{lowStock > 1 ? 's' : ''}</span> {lowStock > 1 ? 'are' : 'is'} running low (under 10 units). Check the inventory manager.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Designs Tab ── */}
        {!loading && activeTab === 'designs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {designs.length === 0 ? (
              <EmptyState icon={Star} title="All caught up!" sub="No design layouts are currently pending review." />
            ) : designs.map(design => {
              const w = design.dimensions?.width || 10;
              const l = design.dimensions?.length || 15;
              const terrain = design.dimensions?.terrainType || 'flat';
              const isAct = actionLoading === design.id;
              return (
                <div key={design.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                  {/* Thumbnail */}
                  <div className="relative w-full h-40 bg-slate-50">
                    {design.original_image_url
                      ? <img src={design.original_image_url} alt={design.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-300">
                          <FileText size={36} strokeWidth={1} /><span className="text-xs">No reference image</span>
                        </div>
                    }
                    <div className="absolute top-2 right-2"><Badge label="Awaiting Review" /></div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-slate-800 truncate mb-0.5">{design.name}</h3>
                    <p className="text-xs text-slate-400 mb-4">#{design.id} · {new Date(design.updated_at).toLocaleDateString()}</p>

                    <div className="space-y-2 text-sm mb-5">
                      <Row label="Customer"      value={design.customer_name || 'Anonymous'} />
                      <Row label="Lot"           value={`${w}m × ${l}m (${terrain})`} />
                      <Row label="Estimate"      value={`₱${Number(design.total_cost).toLocaleString()}`} valueClass="font-bold text-emerald-600" />
                    </div>

                    <div className="flex flex-col gap-2 mt-auto">
                      <button
                        onClick={() => handleViewDesign(design.id)}
                        disabled={isAct}
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer border-none disabled:opacity-50"
                      >
                        <Eye size={14} /> Review in 3D Studio
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateDesignStatus(design.id, 'approved')}
                          disabled={isAct}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle size={13} /> Approve
                        </button>
                        <button
                          onClick={() => updateDesignStatus(design.id, 'rejected')}
                          disabled={isAct}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Bookings Tab ── */}
        {!loading && activeTab === 'bookings' && (() => {
          const active = bookings.filter(b => b.status === 'Confirmed' || b.status === 'In Progress');
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {active.length === 0 ? (
                <EmptyState icon={Calendar} title="No active consultations" sub="All bookings are either completed or pending confirmation." />
              ) : active.map(booking => {
                const isAct = actionLoading === booking.id;
                const thumb = getThumbnail(booking);
                return (
                  <div key={booking.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                    <div className="relative w-full h-40 bg-slate-50">
                      {thumb ? (
                        <img src={thumb} alt={booking.service_type} className="w-full h-full object-cover" />
                      ) : booking.design_details ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                          <div className="p-3 bg-emerald-50 rounded-xl">
                            <Layers size={26} className="text-emerald-400" strokeWidth={1.5} />
                          </div>
                          <span className="text-xs text-slate-500 font-semibold max-w-[140px] truncate text-center">
                            {booking.design_details.name}
                          </span>
                          <button
                            onClick={() => setDesignModal(booking.design_details)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg border-none cursor-pointer transition-colors"
                          >
                            <Eye size={12} /> View AI Design
                          </button>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-300">
                          <Calendar size={36} strokeWidth={1} /><span className="text-xs">No reference image</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2"><Badge label={booking.status} /></div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-slate-800 capitalize mb-0.5">{booking.service_type} Consultation</h3>
                      <p className="text-xs text-slate-400 mb-4">Ref #{booking.id} · {booking.scheduled_date}</p>

                      <div className="space-y-2 text-sm mb-5">
                        <Row label="Customer"  value={booking.customer_name} />
                        <Row label="Lot"       value={getLotProfile(booking)} />
                        <Row label="Time"      value={booking.preferred_time || 'Morning'} />
                        <Row label="Contact"   value={booking.contact_number || '—'} />
                      </div>

                      {booking.service_address && (
                        <div className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 mb-5 leading-relaxed border border-slate-100">
                          <span className="font-bold text-slate-600 uppercase tracking-wide text-[10px] block mb-0.5">Address</span>
                          {booking.service_address}
                        </div>
                      )}

                      <div className="flex flex-col gap-2 mt-auto">
                        {booking.design_details && (
                          <button
                            onClick={() => setDesignModal(booking.design_details)}
                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors cursor-pointer border-none"
                          >
                            <Layers size={14} /> View Attached 3D Design
                          </button>
                        )}
                        <button
                          onClick={() => updateBookingStatus(booking.id, booking.status === 'Confirmed' ? 'In Progress' : 'Completed')}
                          disabled={isAct}
                          className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer border-none disabled:opacity-50"
                        >
                          {isAct ? 'Updating…' : booking.status === 'Confirmed' ? '▶ Start Consultation' : '✓ Complete Consultation'}
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'Cancelled')}
                          disabled={isAct}
                          className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl border border-red-200 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* ── Orders Tab ── */}
        {!loading && activeTab === 'orders' && (() => {
          const active = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {active.length === 0 ? (
                <EmptyState icon={Package} title="No active orders" sub="All orders have been delivered or cancelled." />
              ) : active.map(order => {
                const isAct = actionLoading === order.id;
                const linked = getLinkedDesign(order.customer_name);
                const thumb = linked?.original_image_url || null;
                const itemSummary = order.items?.map(i => `${i.quantity}× ${i.item_name}`).join(', ') || 'Custom Plant Assets';
                const isExpanded = expandedOrder === order.id;
                return (
                  <div key={order.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                    <div className="relative w-full h-40 bg-slate-50">
                      {thumb
                        ? <img src={thumb} alt="Order ref" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-300">
                            <ShoppingBag size={36} strokeWidth={1} /><span className="text-xs">No reference photo</span>
                          </div>
                      }
                      <div className="absolute top-2 right-2"><Badge label={order.status} /></div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-slate-800 mb-0.5">Order #{order.id}</h3>
                      <p className="text-xs text-slate-400 mb-4">
                        {new Date(order.created_at).toLocaleDateString()} · {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
                      </p>

                      <div className="space-y-2 text-sm mb-3">
                        <Row label="Customer" value={order.customer_name} />
                        <Row label="Email"    value={order.customer_email} />
                        <Row label="Total"    value={`₱${Number(order.total_price).toLocaleString()}`} valueClass="font-bold text-emerald-600" />
                      </div>

                      <div className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 mb-5 leading-relaxed border border-slate-100 line-clamp-2">
                        <span className="font-bold text-slate-600 uppercase tracking-wide text-[10px] block mb-0.5">Items</span>
                        {itemSummary}
                      </div>

                      <div className="flex flex-col gap-2 mt-auto">
                        <button
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                          className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer border-none"
                        >
                          <Truck size={14} /> Update Fulfillment
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {isExpanded && (
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mt-1">
                            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Order Items</p>
                            <ul className="space-y-1 mb-3">
                              {order.items?.map(item => (
                                <li key={item.id} className="text-xs text-slate-600">
                                  <span className="font-bold">{item.quantity}×</span> {item.item_name}
                                  <span className="text-slate-400"> · ₱{Number(item.price_at_booking).toLocaleString()}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200">
                              {(order.status === 'Pending' || order.status === 'Paid') && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'Shipped')}
                                  disabled={isAct}
                                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg border-none cursor-pointer disabled:opacity-50"
                                >
                                  Ship Order
                                </button>
                              )}
                              {(order.status !== 'Delivered') && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'Delivered')}
                                  disabled={isAct}
                                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg border-none cursor-pointer disabled:opacity-50"
                                >
                                  Mark Delivered
                                </button>
                              )}
                              <button
                                onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                                disabled={isAct}
                                className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold rounded-lg border border-red-200 cursor-pointer disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

      </div>

      {/* ── Toast stack ── */}
      <ToastStack toasts={toasts} dismiss={dismiss} />

      {/* ── Design View Modal ── */}
      {designModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
          onClick={() => setDesignModal(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden w-full shadow-2xl"
            style={{ maxWidth: '860px' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <p className="font-extrabold text-slate-900 text-base leading-none mb-0.5">
                  {designModal.name}
                </p>
                <p className="text-slate-400 text-xs">
                  {modalArMode ? 'AR Photo Overlay · Read-only Preview' : '3D Garden Layout · Read-only Preview'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {(designModal.reference_image_url || designModal.image_url) && (
                  <div style={{ display: 'inline-flex', background: '#F1F5F9', borderRadius: '8px', padding: '3px', gap: '2px' }}>
                    {[{ key: false, label: '3D View' }, { key: true, label: 'AR Overlay' }].map(({ key, label }) => (
                      <button
                        key={String(key)}
                        type="button"
                        onClick={() => setModalArMode(key)}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '6px',
                          border: modalArMode === key ? '1.5px solid #4A7A3A' : '1.5px solid transparent',
                          cursor: 'pointer',
                          fontSize: '0.71rem',
                          fontWeight: 700,
                          background: modalArMode === key ? '#2D4A2D' : 'transparent',
                          color: modalArMode === key ? '#F7F3EC' : '#64748B',
                          transition: 'all 0.18s',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setDesignModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer bg-transparent border-none"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            {/* Canvas */}
            <div style={{ height: '450px' }}>
              <ThreeGardenCanvas
                plants={toCanvasPlants(designModal.placed_items)}
                lotWidth={designModal.dimensions?.width || 10}
                lotLength={designModal.dimensions?.length || 15}
                backgroundImageUrl={designModal.reference_image_url || designModal.image_url || null}
                arMode={modalArMode}
                arGrid={modalArMode}
                horizonY={designModal.dimensions?.horizonY ?? 0.5}
                readOnly={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Inline key-value row helper ──────────────────────────────────────── */
function Row({ label, value, valueClass = 'font-semibold text-slate-700' }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-slate-400 shrink-0">{label}</span>
      <span className={`truncate max-w-[160px] text-right ${valueClass}`}>{value}</span>
    </div>
  );
}

export default StaffDashboard;
