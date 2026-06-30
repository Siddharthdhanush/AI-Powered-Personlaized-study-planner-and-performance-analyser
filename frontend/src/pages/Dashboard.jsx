import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, timeRes, subRes] = await Promise.all([
          api.get('/user/profile'),
          api.get('/planning/timetable'),
          api.get('/syllabus/subjects')
        ]);
        setProfile(profRes.data);
        setTimetable(timeRes.data);
        setSubjects(subRes.data);
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
      fetchTimetable();
    } catch (err) {
      alert('Failed to clear timetable');
    }
  };

  const handleDeleteSession = async (planId) => {
    try {
      await api.delete(`/planning/sessions/${planId}`);
      fetchTimetable();
    } catch (err) {
      alert('Failed to delete session');
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
          <button className="btn btn-secondary" onClick={() => alert('Performance tracking algorithms will be available in Phase 4!')}>
            📈 Check Performance
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
            {timetable.length > 0 && (
              <button onClick={handleClearAll} style={{background: 'transparent', color: 'var(--danger-color)', border: '1px solid var(--danger-color)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer'}}>
                Clear All
              </button>
            )}
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
              
              {pendingSessions.map(plan => (
                <div key={plan.plan_id} style={{background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <span style={{fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: 700}}>{plan.planned_date}</span>
                    <h3 style={{margin: '4px 0', fontSize: '1.1rem'}}>{getTopicName(plan.topic_id)}</h3>
                    <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                      {plan.start_time && plan.end_time ? (
                        <>🕒 {plan.start_time} - {plan.end_time} ({plan.planned_minutes} mins)</>
                      ) : (
                        <>⏱️ {plan.planned_minutes} minutes scheduled</>
                      )}
                    </span>
                  </div>
                  <div style={{display: 'flex', gap: '8px'}}>
                    <button onClick={() => handleCompleteSession(plan.plan_id)} className="btn" style={{padding: '8px 16px', background: 'var(--success-color)', boxShadow: 'none'}}>
                      Complete
                    </button>
                    <button onClick={() => handleDeleteSession(plan.plan_id)} className="btn" style={{padding: '8px', background: 'var(--danger-color)', boxShadow: 'none'}}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
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

export default Dashboard;
