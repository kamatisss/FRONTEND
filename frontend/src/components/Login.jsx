import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Leaf, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { loginUser } = useAuth();
  const location      = useLocation();

  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [rememberMe,   setRememberMe]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);

  const successMessage = location.state?.message || '';
  const from           = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginUser(username, password, from);
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        {/* Header */}
        <div className="login-header">
          <div className="login-logo">
            <Leaf size={32} color="var(--accent)" />
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to your Garden Design Studio</p>
          {from && (
            <p style={{ fontSize: '0.78rem', color: 'var(--accent)', marginTop: '8px', fontWeight: 600 }}>
              🔒 You'll be redirected after login
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="login-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Success (e.g. after registration) */}
        {successMessage && !error && (
          <div className="login-success">
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">

          {/* Username */}
          <div className="input-group">
            <User className="input-icon" size={20} />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div className="input-group" style={{ position: 'relative' }}>
            <Lock className="input-icon" size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{ paddingRight: '2.8rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                padding: 0,
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Row: Remember Me + Forgot Password */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '4px',
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--accent)', width: '15px', height: '15px' }}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="auth-link" style={{ fontSize: '0.85rem' }}>
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer-link">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
