import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        // FastAPI expects form data for OAuth2
        const form = new URLSearchParams();
        form.append('username', formData.email);
        form.append('password', formData.password);
        
        const res = await api.post('/user/login', form);
        localStorage.setItem('token', res.data.access_token);
        navigate('/');
      } else {
        await api.post('/user/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        setIsLogin(true); // Switch to login after register
        alert('Registration successful! Please login.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        {error && <div style={{ color: 'var(--danger-color)', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Name</label>
              <input 
                type="text" 
                name="name" 
                className="input-field" 
                value={formData.name} 
                onChange={handleChange} 
                required={!isLogin} 
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              name="email" 
              className="input-field" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Password (Min 8 chars)</label>
            <input 
              type="password" 
              name="password" 
              className="input-field" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              minLength="8"
            />
          </div>

          <button type="submit" className="btn" style={{ width: '100%', marginTop: '16px' }}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ fontSize: '0.9rem' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              style={{ color: 'var(--accent-color)', cursor: 'pointer', fontWeight: '600' }}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign up here' : 'Login here'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginRegister;
