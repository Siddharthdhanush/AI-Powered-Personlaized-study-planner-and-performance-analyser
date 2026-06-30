import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function ProfilePreferences() {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [preferences, setPreferences] = useState({ 
    daily_hours: 0, 
    wake_time: '', 
    sleep_time: '', 
    study_start_time: '', 
    break_duration: 0 
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, prefRes] = await Promise.all([
          api.get('/user/profile'),
          api.get('/user/preferences')
        ]);
        setProfile(profRes.data);
        setPreferences(prefRes.data);
        setLoading(false);
      } catch (err) {
        navigate('/login');
      }
    };
    fetchData();
  }, [navigate]);

  const handlePrefChange = (e) => {
    setPreferences({ ...preferences, [e.target.name]: e.target.value });
  };

  const handleSavePrefs = async (e) => {
    e.preventDefault();
    try {
      await api.put('/user/preferences', {
        daily_hours: parseFloat(preferences.daily_hours),
        wake_time: preferences.wake_time,
        sleep_time: preferences.sleep_time,
        study_start_time: preferences.study_start_time,
        break_duration: parseInt(preferences.break_duration)
      });
      alert('Preferences saved successfully!');
    } catch (err) {
      alert('Failed to save preferences.');
    }
  };

  if (loading) return <div className="flex-center" style={{height: '50vh'}}>Loading...</div>;

  return (
    <div style={{maxWidth: '900px', margin: '0 auto'}}>
      <h1 style={{marginBottom: '32px'}}>Account Settings</h1>
      
      <div className="grid grid-cols-2">
        {/* Profile Card */}
        <div className="glass-panel" style={{alignSelf: 'start'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px'}}>
            <div style={{
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--accent-color), #60a5fa)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: '700'
            }}>
              {profile.name ? profile.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h2 style={{marginBottom: '4px'}}>{profile.name}</h2>
              <p style={{margin: 0}}>{profile.email}</p>
            </div>
          </div>
          
          <div className="form-group">
            <label>Name</label>
            <input type="text" className="input-field" value={profile.name} disabled style={{background: '#f3f4f6', cursor: 'not-allowed'}} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="input-field" value={profile.email} disabled style={{background: '#f3f4f6', cursor: 'not-allowed'}} />
          </div>
        </div>

        {/* Preferences Card */}
        <div className="glass-panel" style={{alignSelf: 'start'}}>
          <h2>Study Preferences</h2>
          <p>These settings are used by our AI Engine to generate your Adaptive Timetable.</p>
          <form onSubmit={handleSavePrefs}>
            <div className="form-group">
              <label>Daily Study Commitment (Hours)</label>
              <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                <input type="range" min="0.5" max="12" step="0.5" name="daily_hours" value={preferences.daily_hours} onChange={handlePrefChange} style={{flex: 1, accentColor: 'var(--accent-color)'}} />
                <span style={{fontWeight: '600', width: '40px'}}>{preferences.daily_hours}h</span>
              </div>
            </div>
            
            <div className="grid" style={{gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
              <div className="form-group">
                <label>Wake Time</label>
                <input type="time" name="wake_time" className="input-field" value={preferences.wake_time} onChange={handlePrefChange} required />
              </div>
              <div className="form-group">
                <label>Sleep Time</label>
                <input type="time" name="sleep_time" className="input-field" value={preferences.sleep_time} onChange={handlePrefChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Study Start Time</label>
              <input type="time" name="study_start_time" className="input-field" value={preferences.study_start_time} onChange={handlePrefChange} required />
            </div>
            
            <div className="form-group">
              <label>Break Duration (Minutes per Session)</label>
              <input type="number" name="break_duration" className="input-field" value={preferences.break_duration} onChange={handlePrefChange} required />
            </div>
            
            <button type="submit" className="btn" style={{marginTop: '16px', width: '100%'}}>Save Preferences</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilePreferences;
