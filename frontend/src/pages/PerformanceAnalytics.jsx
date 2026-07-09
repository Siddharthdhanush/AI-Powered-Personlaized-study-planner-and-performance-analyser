import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function PerformanceAnalytics() {
  const [mlAnalytics, setMlAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const [analyticsRes, historyRes] = await Promise.all([
          api.get('/ml/analytics'),
          api.get('/ml/history')
        ]);
        setMlAnalytics(analyticsRes.data);
        setHistory(historyRes.data);
      } catch (err) {
        console.error("Failed to load analytics: ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  if (loading) {
    return <div className="flex-center" style={{ height: '50vh' }}>Loading performance telemetry...</div>;
  }

  // Helper to format date
  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>📊 Performance Hub & ML Predictions</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          ← Back to Dashboard
        </button>
      </div>

      {mlAnalytics ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Left Column: Latest Analytics & History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Predictions Grid */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '1.2rem', margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                🤖 Current ML Engine Predictions
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {/* Exam Readiness Meter */}
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    border: '6px solid #e2e8f0',
                    borderTopColor: mlAnalytics.exam_readiness_prob > 0.7 ? '#10b981' : '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    color: '#1e293b'
                  }}>
                    {Math.round(mlAnalytics.exam_readiness_prob * 100)}%
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Exam Readiness</span>
                    <strong style={{ fontSize: '1rem', color: mlAnalytics.exam_readiness_prob > 0.7 ? '#047857' : '#b45309' }}>
                      {mlAnalytics.exam_readiness_prob > 0.7 ? 'Exam Ready' : 'Needs Review'}
                    </strong>
                  </div>
                </div>

                {/* Mastery badge */}
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Predicted Mastery Level</span>
                  <div>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: mlAnalytics.topic_mastery === 'Strong' ? '#047857' : mlAnalytics.topic_mastery === 'Moderate' ? '#b45309' : '#b91c1c',
                      background: mlAnalytics.topic_mastery === 'Strong' ? '#d1fae5' : mlAnalytics.topic_mastery === 'Moderate' ? '#fef3c7' : '#fee2e2'
                    }}>
                      🏆 {mlAnalytics.topic_mastery}
                    </span>
                  </div>
                </div>
              </div>

              {/* Behavior telemetry */}
              <h3 style={{ fontSize: '1rem', margin: '0 0 12px 0', color: '#475569' }}>📊 Active Behavioral Telemetry</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Accuracy</span>
                  <strong style={{ fontSize: '1.25rem', color: '#1e293b' }}>{mlAnalytics.mcq_accuracy}%</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Avg Pace</span>
                  <strong style={{ fontSize: '1.25rem', color: '#1e293b' }}>{mlAnalytics.avg_response_time}s</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Skipped</span>
                  <strong style={{ fontSize: '1.25rem', color: '#1e293b' }}>{mlAnalytics.skip_count}</strong>
                </div>
              </div>
            </div>

            {/* Historical Progress */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '1.2rem', margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                📈 Performance Improvement History
              </h2>
              {history.length <= 1 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                  Take more quizzes to trace and visualize your performance trends over time.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {history.map((entry, index) => {
                    const prevEntry = index > 0 ? history[index - 1] : null;
                    const accuracyDiff = prevEntry ? entry.mcq_accuracy - prevEntry.mcq_accuracy : 0;
                    const readinessDiff = prevEntry ? entry.exam_readiness_prob - prevEntry.exam_readiness_prob : 0;
                    
                    return (
                      <div 
                        key={entry.prediction_id} 
                        style={{ 
                          padding: '14px', 
                          borderRadius: '10px', 
                          border: '1px solid var(--border-color)', 
                          background: '#fff',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>
                            {formatDate(entry.timestamp)}
                          </span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>
                            Mastery: {entry.topic_mastery}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Accuracy</span>
                            <span style={{ fontWeight: 700 }}>{entry.mcq_accuracy}%</span>
                            {accuracyDiff !== 0 && (
                              <span style={{ fontSize: '0.75rem', marginLeft: '6px', color: accuracyDiff > 0 ? '#10b981' : '#ef4444' }}>
                                {accuracyDiff > 0 ? `↑ +${accuracyDiff.toFixed(1)}%` : `↓ ${accuracyDiff.toFixed(1)}%`}
                              </span>
                            )}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Readiness</span>
                            <span style={{ fontWeight: 700 }}>{Math.round(entry.exam_readiness_prob * 100)}%</span>
                            {readinessDiff !== 0 && (
                              <span style={{ fontSize: '0.75rem', marginLeft: '6px', color: readinessDiff > 0 ? '#10b981' : '#ef4444' }}>
                                {readinessDiff > 0 ? `↑ +${Math.round(readinessDiff * 100)}%` : `↓ ${Math.round(readinessDiff * 100)}%`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Explanations & Weak Topics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Weak topics */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', margin: '0 0 12px 0', color: 'var(--text-primary)' }}>⚠️ Areas of Improvement</h3>
              {mlAnalytics.weak_topics && mlAnalytics.weak_topics.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {mlAnalytics.weak_topics.map((t, idx) => (
                    <div key={idx} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#991b1b', fontSize: '0.85rem', fontWeight: 600 }}>
                      • {t}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1fae5', background: '#ecfdf5', color: '#065f46', fontSize: '0.85rem', fontWeight: 600 }}>
                  🎉 No weak topics detected! Keep maintaining this standard.
                </div>
              )}
            </div>

            {/* Decision Model Explanation */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', margin: '0 0 10px 0', color: 'var(--text-primary)' }}>⚙️ Behind the Engine</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                <p style={{ margin: '0 0 8px 0' }}>
                  Our system evaluates behavior indicators using local Scikit-Learn models trained on mock historical student profiles.
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  <strong>Decision Tree (Mastery):</strong> Traverses accuracy thresholds and response pace to classify topics into <em>Strong</em>, <em>Moderate</em>, or <em>Weak</em> mastery.
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  <strong>Logistic Regression (Readiness):</strong> Estimates overall probability of passing exams by evaluating response consistency, skips, and accuracy.
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Remedial Engine:</strong> If you score below 50% on any quiz, the backend scheduler instantly maps out and injects an extra remedial study plan slot to review that topic.
                </p>
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px' }} className="glass-panel">
          <p>No assessment telemetry available yet. Take a quiz to trigger your first ML Engine predictions!</p>
          <button className="btn" onClick={() => navigate('/quiz')} style={{ marginTop: '12px' }}>
            Go to Quizzes
          </button>
        </div>
      )}
    </div>
  );
}

export default PerformanceAnalytics;
