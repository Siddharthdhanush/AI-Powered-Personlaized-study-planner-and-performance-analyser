import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [mlAnalytics, setMlAnalytics] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editSessionData, setEditSessionData] = useState({ planned_date: '', planned_minutes: 0, start_time: '', end_time: '' });
  const [viewMode, setViewMode] = useState('list');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, timeRes, subRes, prefRes] = await Promise.all([
          api.get('/user/profile'),
          api.get('/planning/timetable'),
          api.get('/syllabus/subjects'),
          api.get('/user/preferences')
        ]);
        setProfile(profRes.data);
        setTimetable(timeRes.data);
        setSubjects(subRes.data);
        setPreferences(prefRes.data);
      } catch (err) {
        navigate('/login');
      }
    };
    fetchData();
  }, [navigate]);

  const handleCompleteSession = async (planId) => {
    try {
      await api.put(`/planning/sessions/${planId}/complete`);
      // Refresh timetable
      const timeRes = await api.get('/planning/timetable');
      setTimetable(timeRes.data);
    } catch (err) {
      alert('Failed to mark complete');
    }
  };

  if (!profile) return <div className="flex-center" style={{height: '50vh'}}>Loading...</div>;

  // Helper to map topic_id to topic name across all subjects
  const getTopicName = (topicId) => {
    for (let s of subjects) {
      const t = s.topics.find(t => t.topic_id === topicId);
      if (t) return `${s.subject_name} - ${t.topic_name}`;
    }
    return `Topic #${topicId}`;
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear your entire timetable?")) return;
    try {
      await api.delete('/planning/sessions');
      const timeRes = await api.get('/planning/timetable');
      setTimetable(timeRes.data);
    } catch (err) {
      alert('Failed to clear timetable');
    }
  };

  const handleDeleteSession = async (planId) => {
    try {
      await api.delete(`/planning/sessions/${planId}`);
      const timeRes = await api.get('/planning/timetable');
      setTimetable(timeRes.data);
    } catch (err) {
      alert('Failed to delete session');
    }
  };


  const handleEditSession = (plan) => {
    setEditingSessionId(plan.plan_id);
    setEditSessionData({
      planned_date: plan.planned_date,
      planned_minutes: plan.planned_minutes,
      start_time: plan.start_time || '',
      end_time: plan.end_time || ''
    });
  };

  const handleSaveSession = async (planId) => {
    try {
      await api.put(`/planning/sessions/${planId}`, editSessionData);
      setEditingSessionId(null);
      const timeRes = await api.get('/planning/timetable');
      setTimetable(timeRes.data);
    } catch (err) {
      alert('Failed to update study session');
    }
  };

  const pendingSessions = timetable.filter(t => !t.is_completed);
  const completedSessions = timetable.filter(t => t.is_completed);

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px'}}>
        <div>
          <h1 style={{ marginBottom: '8px' }}>Welcome, {profile.name}!</h1>
          <p style={{ fontSize: '1.1rem', margin: 0 }}>Here is your personalized adaptive study plan.</p>
        </div>
        <div style={{display: 'flex', gap: '12px'}}>
          <button className="btn" onClick={() => navigate('/syllabus')} style={{background: 'var(--success-color)'}}>
            📅 Create Timetable
          </button>
          <button className="btn btn-secondary" onClick={async () => {
            if (!mlAnalytics) {
              try {
                const res = await api.get('/ml/analytics');
                setMlAnalytics(res.data);
              } catch (e) {
                alert("Failed to load ML Analytics");
              }
            }
            setShowAnalytics(!showAnalytics);
          }}>
            📈 {showAnalytics ? 'Hide Performance' : 'Check Performance'}
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/quiz')}>
            🧠 Take a Quiz
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2">
        <div className="glass-panel" style={{alignSelf: 'start'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
            <h2>Your Study Plan</h2>
            <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
              <div style={{display: 'flex', background: '#f3f4f6', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                <button 
                  onClick={() => setViewMode('list')} 
                  style={{
                    padding: '6px 12px', 
                    background: viewMode === 'list' ? '#fff' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  List View
                </button>
                <button 
                  onClick={() => setViewMode('grid')} 
                  style={{
                    padding: '6px 12px', 
                    background: viewMode === 'grid' ? '#fff' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  Weekly Grid
                </button>
              </div>
              {timetable.length > 0 && (
                <button onClick={handleClearAll} style={{background: 'transparent', color: 'var(--danger-color)', border: '1px solid var(--danger-color)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem'}}>
                  Clear All
                </button>
              )}
            </div>
          </div>
          
          {timetable.length === 0 ? (
            <div style={{background: '#f9fafb', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center'}}>
              <p>You haven't generated a timetable yet!</p>
              <button className="btn" onClick={() => navigate('/syllabus')} style={{marginTop: '12px'}}>
                Go to Syllabus Manager
              </button>
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              {pendingSessions.length === 0 && completedSessions.length > 0 && (
                <div className="badge badge-success" style={{padding: '12px', fontSize: '1rem', justifyContent: 'center'}}>
                  🎉 All caught up! Syllabus completed!
                </div>
              )}

              {viewMode === 'grid' && editingSessionId && (
                <div style={{background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '16px'}}>
                  <h4 style={{margin: '0 0 12px 0'}}>Edit Study Session</h4>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px'}}>
                    <div>
                      <label style={{fontSize: '0.8rem', display: 'block', marginBottom: '4px'}}>Planned Date</label>
                      <input
                        type="date"
                        className="input-field"
                        value={editSessionData.planned_date}
                        onChange={(e) => setEditSessionData({ ...editSessionData, planned_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{fontSize: '0.8rem', display: 'block', marginBottom: '4px'}}>Duration (mins)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={editSessionData.planned_minutes}
                        onChange={(e) => setEditSessionData({ ...editSessionData, planned_minutes: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label style={{fontSize: '0.8rem', display: 'block', marginBottom: '4px'}}>Timeslots</label>
                      <div style={{display: 'flex', gap: '4px'}}>
                        <input
                          type="text"
                          placeholder="Start"
                          className="input-field"
                          value={editSessionData.start_time}
                          onChange={(e) => setEditSessionData({ ...editSessionData, start_time: e.target.value })}
                        />
                        <input
                          type="text"
                          placeholder="End"
                          className="input-field"
                          value={editSessionData.end_time}
                          onChange={(e) => setEditSessionData({ ...editSessionData, end_time: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                    <button onClick={() => handleSaveSession(editingSessionId)} className="btn" style={{padding: '6px 12px', fontSize: '0.85rem', background: 'var(--success-color)'}}>
                      Save
                    </button>
                    <button onClick={() => setEditingSessionId(null)} className="btn btn-secondary" style={{padding: '6px 12px', fontSize: '0.85rem'}}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {viewMode === 'list' ? (
                <div style={{overflowX: 'auto'}}>
                  <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                    <thead>
                      <tr style={{borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
                        <th style={{padding: '10px 8px'}}>Date</th>
                        <th style={{padding: '10px 8px'}}>Topic</th>
                        <th style={{padding: '10px 8px'}}>Duration / Time</th>
                        <th style={{padding: '10px 8px', textAlign: 'right'}}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingSessions.map(plan => {
                        const isEditing = editingSessionId === plan.plan_id;
                        return (
                          <tr key={plan.plan_id} style={{borderBottom: '1px solid var(--border-color)'}}>
                            <td style={{padding: '12px 8px', verticalAlign: 'middle'}}>
                              {isEditing ? (
                                <input
                                  type="date"
                                  value={editSessionData.planned_date}
                                  onChange={(e) => setEditSessionData({ ...editSessionData, planned_date: e.target.value })}
                                  style={{padding: '4px', fontSize: '0.85rem', width: '120px'}}
                                />
                              ) : (
                                <span style={{fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-color)'}}>{plan.planned_date}</span>
                              )}
                            </td>
                            <td style={{padding: '12px 8px', verticalAlign: 'middle'}}>
                              <span style={{fontSize: '0.95rem', fontWeight: 500}}>{getTopicName(plan.topic_id)}</span>
                            </td>
                            <td style={{padding: '12px 8px', verticalAlign: 'middle'}}>
                              {isEditing ? (
                                <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                                  <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                                    <input
                                      type="number"
                                      value={editSessionData.planned_minutes}
                                      onChange={(e) => setEditSessionData({ ...editSessionData, planned_minutes: parseInt(e.target.value) || 0 })}
                                      style={{padding: '4px', fontSize: '0.85rem', width: '60px'}}
                                    />
                                    <span style={{fontSize: '0.8rem'}}>mins</span>
                                  </div>
                                  <div style={{display: 'flex', gap: '4px'}}>
                                    <input
                                      type="text"
                                      placeholder="Start"
                                      value={editSessionData.start_time}
                                      onChange={(e) => setEditSessionData({ ...editSessionData, start_time: e.target.value })}
                                      style={{padding: '4px', fontSize: '0.8rem', width: '60px'}}
                                    />
                                    <input
                                      type="text"
                                      placeholder="End"
                                      value={editSessionData.end_time}
                                      onChange={(e) => setEditSessionData({ ...editSessionData, end_time: e.target.value })}
                                      style={{padding: '4px', fontSize: '0.8rem', width: '60px'}}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                                  {plan.start_time && plan.end_time ? (
                                    <>🕒 {plan.start_time} - {plan.end_time} ({plan.planned_minutes}m)</>
                                  ) : (
                                    <>⏱️ {plan.planned_minutes} mins</>
                                  )}
                                </span>
                              )}
                            </td>
                            <td style={{padding: '12px 8px', verticalAlign: 'middle', textAlign: 'right'}}>
                              {isEditing ? (
                                <div style={{display: 'flex', gap: '4px', justifyContent: 'flex-end'}}>
                                  <button onClick={() => handleSaveSession(plan.plan_id)} className="btn" style={{padding: '6px 10px', fontSize: '0.8rem', background: 'var(--success-color)', boxShadow: 'none'}}>
                                    Save
                                  </button>
                                  <button onClick={() => setEditingSessionId(null)} className="btn btn-secondary" style={{padding: '6px 10px', fontSize: '0.8rem'}}>
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div style={{display: 'flex', gap: '4px', justifyContent: 'flex-end'}}>
                                  <button onClick={() => handleCompleteSession(plan.plan_id)} className="btn" style={{padding: '6px 10px', fontSize: '0.8rem', background: 'var(--success-color)', boxShadow: 'none'}}>
                                    Done
                                  </button>
                                  <button onClick={() => handleEditSession(plan)} className="btn btn-secondary" style={{padding: '6px 8px', fontSize: '0.8rem', boxShadow: 'none'}}>
                                    ✏️
                                  </button>
                                  <button onClick={() => handleDeleteSession(plan.plan_id)} className="btn" style={{padding: '6px 8px', fontSize: '0.8rem', background: 'var(--danger-color)', boxShadow: 'none'}}>
                                    🗑️
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <WeeklyGridView 
                  timetable={timetable} 
                  getTopicName={getTopicName} 
                  handleCompleteSession={handleCompleteSession} 
                  handleEditSession={handleEditSession} 
                  preferences={preferences}
                />
              )}
            </div>
          )}
        </div>

        <div className="glass-panel" style={{alignSelf: 'start'}}>
          <h2>Progress Tracking</h2>
          
          <div style={{background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '16px'}}>
            <h3 style={{fontSize: '1rem', margin: 0, color: 'var(--text-secondary)'}}>Overall Completion</h3>
            <div style={{fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px'}}>
              {timetable.length > 0 ? Math.round((completedSessions.length / timetable.length) * 100) : 0}%
            </div>
            <p style={{margin: 0, fontSize: '0.9rem'}}>
              {completedSessions.length} of {timetable.length} sessions completed
            </p>
          </div>

          {showAnalytics && mlAnalytics && (
            <div style={{background: '#eff6ff', padding: '16px', borderRadius: '12px', border: '1px solid #bfdbfe', marginBottom: '16px'}}>
              <h3 style={{fontSize: '1rem', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px'}}>
                🤖 ML Engine Insights
              </h3>
              <div style={{marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span style={{color: 'var(--text-secondary)', fontSize: '0.95rem'}}>Predicted Exam Readiness:</span>
                  <span style={{fontWeight: 700, color: mlAnalytics.exam_readiness_prob > 0.7 ? 'var(--success-color)' : 'var(--accent-color)'}}>
                    {Math.round(mlAnalytics.exam_readiness_prob * 100)}%
                  </span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span style={{color: 'var(--text-secondary)', fontSize: '0.95rem'}}>Overall Topic Mastery:</span>
                  <span style={{fontWeight: 700}}>{mlAnalytics.topic_mastery}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span style={{color: 'var(--text-secondary)', fontSize: '0.95rem'}}>Historical MCQ Accuracy:</span>
                  <span style={{fontWeight: 700}}>{mlAnalytics.mcq_accuracy}%</span>
                </div>
                {mlAnalytics.weak_topics && mlAnalytics.weak_topics.length > 0 && (
                  <div style={{marginTop: '8px', borderTop: '1px dashed #bfdbfe', paddingTop: '8px'}}>
                    <span style={{color: 'var(--danger-color)', fontSize: '0.9rem', fontWeight: 700, display: 'block', marginBottom: '4px'}}>⚠️ Weak Topics (&lt; 60% score):</span>
                    <ul style={{margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-primary)'}}>
                      {mlAnalytics.weak_topics.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px', textAlign: 'right'}}>
                  Based on behavior tracking models.
                </div>
              </div>
            </div>
          )}

          <h3>Recent History</h3>
          <ul style={{listStyle: 'none', padding: 0}}>
            {completedSessions.slice(-5).map(plan => (
              <li key={plan.plan_id} style={{padding: '12px 0', borderBottom: '1px solid var(--border-color)'}}>
                <span style={{display: 'inline-block', width: '20px', color: 'var(--success-color)'}}>✓</span>
                <span style={{fontWeight: 500}}>{getTopicName(plan.topic_id)}</span>
                <span style={{float: 'right', color: 'var(--text-secondary)', fontSize: '0.85rem'}}>{plan.planned_minutes} min</span>
              </li>
            ))}
            {completedSessions.length === 0 && (
              <li style={{color: 'var(--text-secondary)'}}>No sessions completed yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Weekly Grid Schedule View Component
function WeeklyGridView({ timetable, getTopicName, handleCompleteSession, handleEditSession, preferences }) {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Dynamic wake/sleep hours based on preferences
  const wakeHour = parseInt(preferences?.wake_time?.split(':')[0]) || 7;
  const sleepHour = parseInt(preferences?.sleep_time?.split(':')[0]) || 22;
  
  const hourlySlots = [];
  for (let h = wakeHour; h <= sleepHour; h++) {
    hourlySlots.push(`${h.toString().padStart(2, '0')}:00`);
  }

  const getDayName = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const getSessionHour = (startTimeStr) => {
    if (!startTimeStr) return null;
    const hour = startTimeStr.split(':')[0];
    return `${hour.padStart(2, '0')}:00`;
  };

  // Group pending sessions
  const gridMap = {};
  timetable.forEach(plan => {
    if (plan.is_completed) return;
    const day = getDayName(plan.planned_date);
    const hour = getSessionHour(plan.start_time);
    if (day && hour) {
      if (!gridMap[day]) gridMap[day] = {};
      if (!gridMap[day][hour]) gridMap[day][hour] = [];
      gridMap[day][hour].push(plan);
    }
  });

  return (
    <div style={{ overflowX: 'auto', marginTop: '8px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-color)' }}>
            <th style={{ padding: '12px 8px', borderRight: '1px solid var(--border-color)', width: '90px', textAlign: 'center', fontWeight: 700 }}>Time</th>
            {daysOfWeek.map(day => (
              <th key={day} style={{ padding: '12px 8px', borderRight: '1px solid var(--border-color)', textAlign: 'center', fontWeight: 700 }}>
                {day.substring(0, 3)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hourlySlots.map(hour => (
            <tr key={hour} style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '10px 8px', borderRight: '1px solid var(--border-color)', fontWeight: 600, textAlign: 'center', background: '#f8fafc', color: 'var(--text-secondary)' }}>
                {hour}
              </td>
              {daysOfWeek.map(day => {
                const sessions = gridMap[day]?.[hour] || [];
                return (
                  <td key={day} style={{ padding: '4px', borderRight: '1px solid var(--border-color)', verticalAlign: 'top', height: '65px', background: sessions.length > 0 ? '#eff6ff' : '#fff', transition: 'background 0.2s' }}>
                    {sessions.map(plan => (
                      <div 
                        key={plan.plan_id}
                        style={{
                          background: 'linear-gradient(135deg, var(--accent-color), #60a5fa)',
                          color: '#fff',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          marginBottom: '4px',
                          fontSize: '0.75rem',
                          boxShadow: '0 2px 4px rgba(59, 130, 246, 0.15)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={getTopicName(plan.topic_id)}>
                          {getTopicName(plan.topic_id)}
                        </div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.9, marginTop: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>🕒 {plan.start_time}</span>
                          <div style={{ display: 'flex', gap: '3px' }}>
                            <button 
                              onClick={() => handleCompleteSession(plan.plan_id)}
                              style={{ background: 'rgba(255,255,255,0.25)', border: 'none', color: '#fff', borderRadius: '3px', padding: '1px 3px', cursor: 'pointer', fontSize: '0.65rem' }}
                              title="Done"
                            >
                              ✓
                            </button>
                            <button 
                              onClick={() => handleEditSession(plan)}
                              style={{ background: 'rgba(255,255,255,0.25)', border: 'none', color: '#fff', borderRadius: '3px', padding: '1px 3px', cursor: 'pointer', fontSize: '0.65rem' }}
                              title="Edit"
                            >
                              ✏️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
