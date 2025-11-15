// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Please fill both email and password.');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{maxWidth:920, marginTop:36}}>
      <div className="auth-grid">
        <div className="auth-left">
          <h1>Welcome back</h1>
          <p className="muted">Login to access your orders, wishlist and faster checkout.</p>

          <form className="auth" onSubmit={onSubmit} style={{marginTop:18}}>
            {error && <div className="error" role="alert">{error}</div>}

            <label>
              Email
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/>
            </label>

            <label>
              Password
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/>
            </label>

            <div style={{display:'flex', gap:12, alignItems:'center', marginTop:6}}>
              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
              <Link to="/register" className="btn-outline">Create account</Link>
            </div>

            <div style={{marginTop:12, fontSize:13}} className="muted">
              Forgot password? <Link to="/forgot" className="link">Reset</Link>
            </div>
          </form>
        </div>

        <aside className="auth-right">
          <div className="promo-card">
            <h3>Why create an account?</h3>
            <ul>
              <li>Fast checkout & saved addresses</li>
              <li>Track orders & view history</li>
              <li>Wishlist & personalized recommendations</li>
            </ul>
            <div style={{marginTop:18}}>
              <img src="/images/login-illustration.svg" alt="shopping" style={{width:'40%', maxWidth:300}}/>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
