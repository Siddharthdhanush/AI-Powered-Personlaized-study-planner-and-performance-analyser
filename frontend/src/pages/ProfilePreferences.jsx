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
    break_duration: 0,
    college_start_time: '09:00',
    college_end_time: '16:00',
    busy_start_time: '18:00',
    busy_end_time: '19:00'
  });
  const [weeklyCollege, setWeeklyCollege] = useState({});
  const [weeklyBusy, setWeeklyBusy] = useState({});
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
        
        try {
          setWeeklyCollege(JSON.parse(prefRes.data.weekly_college_timings || '{}'));
        } catch(e) {
          setWeeklyCollege({});
        }
        
        try {
          setWeeklyBusy(JSON.parse(prefRes.data.weekly_busy_timings || '{}'));
        } catch(e) {
          setWeeklyBusy({});
        }
        
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

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleDayCollegeChange = (day, field, value) => {
    setWeeklyCollege(prev => ({
      ...prev,
      [day]: {
        ...(prev[day] || { start: preferences.college_start_time || '09:00', end: preferences.college_end_time || '16:00' }),
        [field]: value
      }
    }));
  };

  const handleDayBusyChange = (day, field, value) => {
    setWeeklyBusy(prev => ({
      ...prev,
      [day]: {
        ...(prev[day] || { start: preferences.busy_start_time || '17:00', end: preferences.busy_end_time || '18:30' }),
        [field]: value
      }
    }));
  };

  const toggleUseCustomDay = (day, type) => {
    if (type === 'college') {
      setWeeklyCollege(prev => {
        const updated = { ...prev };
        if (updated[day]) {
          delete updated[day];
        } else {
          updated[day] = { start: preferences.college_start_time || '09:00', end: preferences.college_end_time || '16:00' };
        }
        return updated;
      });
    } else {
      setWeeklyBusy(prev => {
        const updated = { ...prev };
        if (updated[day]) {
          delete updated[day];
        } else {
          updated[day] = { start: preferences.busy_start_time || '17:00', end: preferences.busy_end_time || '18:30' };
        }
        return updated;
      });
    }
  };

  const handleSavePrefs = async (e) => {
    e.preventDefault();
    try {
      await api.put('/user/preferences', {
        daily_hours: parseFloat(preferences.daily_hours),
        wake_time: preferences.wake_time,
        sleep_time: preferences.sleep_time,
        study_start_time: preferences.study_start_time,
        break_duration: parseInt(preferences.break_duration),
        college_start_time: preferences.college_start_time || '09:00',
        college_end_time: preferences.college_end_time || '16:00',
        busy_start_time: preferences.busy_start_time || '18:00',
        busy_end_time: preferences.busy_end_time || '19:00',
        weekly_college_timings: JSON.stringify(weeklyCollege),
        weekly_busy_timings: JSON.stringify(weeklyBusy)
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

            <div className="grid" style={{gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
              <div className="form-group">
                <label>College Start Time</label>
                <input type="time" name="college_start_time" className="input-field" value={preferences.college_start_time || '09:00'} onChange={handlePrefChange} required />
              </div>
              <div className="form-group">
                <label>College End Time</label>
                <input type="time" name="college_end_time" className="input-field" value={preferences.college_end_time || '16:00'} onChange={handlePrefChange} required />
              </div>
            </div>

            <div className="grid" style={{gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
              <div className="form-group">
                <label>Study Start Time</label>
                <input type="time" name="study_start_time" className="input-field" value={preferences.study_start_time} onChange={handlePrefChange} required />
              </div>
              <div className="form-group">
                <label>Break Duration (Mins)</label>
                <input type="number" name="break_duration" className="input-field" value={preferences.break_duration} onChange={handlePrefChange} required />
              </div>
            </div>

            <div className="grid" style={{gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
              <div className="form-group">
                <label>Busy Start Time</label>
                <input type="time" name="busy_start_time" className="input-field" value={preferences.busy_start_time || '18:00'} onChange={handlePrefChange} required />
              </div>
              <div className="form-group">
                <label>Busy End Time</label>
                <input type="time" name="busy_end_time" className="input-field" value={preferences.busy_end_time || '19:00'} onChange={handlePrefChange} required />
              </div>
            </div>
            
            <button type="submit" className="btn" style={{marginTop: '16px', width: '100%'}}>Save Preferences</button>
          </form>
        </div>
        
        {/* Day-by-Day Custom Settings */}
        <div className="glass-panel" style={{gridColumn: 'span 2', marginTop: '24px'}}>
          <h2>Weekly Timetable (Custom College & Busy Timings)</h2>
          <p style={{marginBottom: '20px', color: 'var(--text-secondary)'}}>Customize your schedule by day of week. If unchecked, the system defaults to the global timings above.</p>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            {days.map(day => {
              const customCollege = weeklyCollege[day];
              const customBusy = weeklyBusy[day];
              
              return (
                <div key={day} style={{
                  display: 'grid', 
                  gridTemplateColumns: '1.2fr 2fr 2fr', 
                  gap: '16px', 
                  padding: '16px', 
                  background: '#f9fafb', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border-color)',
                  alignItems: 'center'
                }}>
                  <strong style={{fontSize: '1.05rem', color: 'var(--text-primary)'}}>{day}</strong>
                  
                  {/* College Timings */}
                  <div style={{background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', marginBottom: '8px'}}>
                      <input 
                        type="checkbox" 
                        checked={!!customCollege} 
                        onChange={() => toggleUseCustomDay(day, 'college')}
                        style={{accentColor: 'var(--accent-color)'}}
                      />
                      Custom College Hours
                    </label>
                    {customCollege ? (
                      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                        <input 
                          type="time" 
                          className="input-field" 
                          style={{padding: '4px 8px', fontSize: '0.8rem'}}
                          value={customCollege.start} 
                          onChange={e => handleDayCollegeChange(day, 'start', e.target.value)} 
                        />
                        <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>to</span>
                        <input 
                          type="time" 
                          className="input-field" 
                          style={{padding: '4px 8px', fontSize: '0.8rem'}}
                          value={customCollege.end} 
                          onChange={e => handleDayCollegeChange(day, 'end', e.target.value)} 
                        />
                      </div>
                    ) : (
                      <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                        Using Global ({preferences.college_start_time || '09:00'} - {preferences.college_end_time || '16:00'})
                      </span>
                    )}
                  </div>
                  
                  {/* Busy Timings */}
                  <div style={{background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', marginBottom: '8px'}}>
                      <input 
                        type="checkbox" 
                        checked={!!customBusy} 
                        onChange={() => toggleUseCustomDay(day, 'busy')}
                        style={{accentColor: 'var(--accent-color)'}}
                      />
                      Custom Busy Hours
                    </label>
                    {customBusy ? (
                      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                        <input 
                          type="time" 
                          className="input-field" 
                          style={{padding: '4px 8px', fontSize: '0.8rem'}}
                          value={customBusy.start} 
                          onChange={e => handleDayBusyChange(day, 'start', e.target.value)} 
                        />
                        <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>to</span>
                        <input 
                          type="time" 
                          className="input-field" 
                          style={{padding: '4px 8px', fontSize: '0.8rem'}}
                          value={customBusy.end} 
                          onChange={e => handleDayBusyChange(day, 'end', e.target.value)} 
                        />
                      </div>
                    ) : (
                      <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                        Using Global ({preferences.busy_start_time || '18:00'} - {preferences.busy_end_time || '19:00'})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePreferences;
