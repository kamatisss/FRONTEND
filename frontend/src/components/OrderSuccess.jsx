import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Printer, ArrowLeft, Leaf } from 'lucide-react';

export default function OrderSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId    = searchParams.get('order_id');
  const orderTotal = searchParams.get('total');
  const orderName  = searchParams.get('name');
  const now        = new Date();

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* ── Print styles: hide UI chrome when user saves PDF ── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-container { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 flex items-center justify-center p-6">
        <div className="print-container bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden">

          {/* ── Header ── */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-10 text-white text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle size={64} strokeWidth={1.5} className="drop-shadow-lg" />
            </div>
            <h1 className="text-3xl font-black mb-1">Payment Successful!</h1>
            <p className="text-emerald-100 text-sm">Your garden items have been confirmed.</p>
          </div>

          {/* ── Receipt Body ── */}
          <div className="px-8 py-6">

            {/* Brand */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <Leaf size={20} className="text-emerald-600" />
              <span className="text-lg font-extrabold text-slate-800 tracking-tight">Garden Studio</span>
            </div>

            {/* Order Meta */}
            <div className="border border-dashed border-slate-200 rounded-2xl p-5 mb-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Order Number</span>
                <span className="font-bold text-slate-900">#{orderId ?? '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Customer</span>
                <span className="font-bold text-slate-900">{orderName ?? '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Date</span>
                <span className="font-bold text-slate-900">
                  {now.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Time</span>
                <span className="font-bold text-slate-900">
                  {now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Payment Method</span>
                <span className="font-bold text-slate-900">Stripe (Card)</span>
              </div>
            </div>

            {/* Total */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex justify-between items-center mb-6">
              <span className="text-emerald-800 font-extrabold text-sm uppercase tracking-wider">Amount Paid</span>
              <span className="text-2xl font-black text-emerald-600">
                ₱{orderTotal ? Number(orderTotal).toLocaleString('en-PH', { minimumFractionDigits: 2 }) : '—'}
              </span>
            </div>

            {/* Note */}
            <p className="text-xs text-slate-400 text-center mb-6 leading-relaxed">
              A confirmation has been sent to your email. Your items will be prepared and delivered to your address within the scheduled timeframe.
            </p>

            {/* ── Actions ── */}
            <div className="no-print flex flex-col gap-3">
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all shadow-md active:scale-95"
              >
                <Printer size={18} />
                Print / Save as PDF
              </button>
              <button
                onClick={() => navigate('/studio')}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-bold transition-all active:scale-95"
              >
                <ArrowLeft size={18} />
                Back to Garden Studio
              </button>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="bg-slate-50 border-t border-slate-100 px-8 py-4 text-center">
            <p className="text-xs text-slate-400">
              Thank you for choosing <span className="font-bold text-emerald-600">Garden Studio</span>. Happy gardening! 🌿
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
