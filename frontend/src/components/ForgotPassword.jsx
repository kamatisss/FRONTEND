import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Leaf, AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API call — replace with real Django reset endpoint when available
    // e.g. POST /api/auth/password-reset/  { email }
    try {
      await new Promise(r => setTimeout(r, 1500)); // Simulated network delay
      // When Django's email reset is configured:
      // await fetch('http://localhost:8000/api/auth/password-reset/', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-slate-100 px-4">

      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/60 border border-white/60 p-8 md:p-10">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <Leaf size={32} className="text-emerald-600" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reset Password</h1>
            <p className="text-sm text-slate-500 mt-1 text-center leading-relaxed">
              Enter your account email and we'll send you a secure link to reset your password.
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-sm mb-6 font-medium"
            >
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Success State */}
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={36} className="text-emerald-500" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Check your inbox!</h2>
              <p className="text-sm text-slate-500 mb-6">
                If an account exists for <strong>{email}</strong>, you'll receive a password reset email within a few minutes.
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95">
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-extrabold text-base transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Sending link...</>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <p className="text-center text-sm text-slate-500 pt-2">
                Remember your password?{' '}
                <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors">
                  Sign in →
                </Link>
              </p>
            </form>
          )}
        </div>

        {/* Back to Landing */}
        <p className="text-center mt-6">
          <Link to="/" className="text-sm text-slate-400 hover:text-emerald-600 transition-colors font-medium">
            ← Back to Garden Studio
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
