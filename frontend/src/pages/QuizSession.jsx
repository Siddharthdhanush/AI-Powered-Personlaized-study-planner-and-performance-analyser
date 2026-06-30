import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function QuizSession() {
  const [subjects, setSubjects] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [quizStatus, setQuizStatus] = useState('IDLE'); // IDLE, GENERATING, READY, SUBMITTING, DONE
  
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { question_id: "A" }
  const [score, setScore] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/syllabus/subjects');
        setSubjects(res.data);
      } catch (err) {
        navigate('/login');
      }
    };
    fetchSubjects();
  }, [navigate]);

  const handleGenerateQuiz = async () => {
    if (!selectedTopic) return;
    setQuizStatus('GENERATING');
    try {
      const res = await api.post(`/ai/quiz/generate/${selectedTopic}`);
      setQuestions(res.data.questions);
      setQuizStatus('READY');
      setAnswers({});
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to generate quiz. Make sure Ollama is running!');
      setQuizStatus('IDLE');
    }
  };

  const handleSelectAnswer = (qId, option) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleSubmitQuiz = async () => {
    setQuizStatus('SUBMITTING');
    const submissionData = {
      topic_id: parseInt(selectedTopic),
      answers: questions.map(q => ({
        question_id: q.question_id,
        selected_option: answers[q.question_id] || null,
        response_time: 15.0, // Hardcoded for MVP, ideally tracked in frontend
        is_skipped: !answers[q.question_id]
      }))
    };

    try {
      const res = await api.post('/ai/assessment/submit', submissionData);
      setScore(res.data.score);
      setQuizStatus('DONE');
    } catch (err) {
      alert('Failed to submit assessment');
      setQuizStatus('READY');
    }
  };

  // Build a flat list of topics for the dropdown
  const allTopics = subjects.flatMap(s => s.topics.map(t => ({...t, subject_name: s.subject_name})));

  return (
    <div style={{maxWidth: '800px', margin: '0 auto'}}>
      <h1 style={{marginBottom: '32px'}}>🧠 AI Quiz Engine</h1>

      {quizStatus === 'IDLE' && (
        <div className="glass-panel">
          <h2>Select a Topic</h2>
          <p>Choose a topic to let the AI generate a personalized quiz for you!</p>
          <div className="form-group" style={{marginTop: '16px'}}>
            <select className="input-field" value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)}>
              <option value="">-- Choose a topic --</option>
              {allTopics.map(t => (
                <option key={t.topic_id} value={t.topic_id}>
                  {t.subject_name} - {t.topic_name}
                </option>
              ))}
            </select>
          </div>
          <button className="btn" onClick={handleGenerateQuiz} disabled={!selectedTopic} style={{marginTop: '16px', width: '100%'}}>
            ✨ Generate 3 Questions
          </button>
        </div>
      )}

      {quizStatus === 'GENERATING' && (
        <div className="glass-panel flex-center" style={{flexDirection: 'column', height: '200px'}}>
          <div style={{fontSize: '3rem', marginBottom: '16px'}}>🤖</div>
          <h3>Ollama is generating your quiz...</h3>
          <p>This may take a minute depending on your local hardware.</p>
        </div>
      )}

      {quizStatus === 'READY' && (
        <div className="glass-panel">
          <h2 style={{marginBottom: '24px'}}>Quiz Time!</h2>
          
          {questions.map((q, idx) => (
            <div key={q.question_id} style={{marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)'}}>
              <h3 style={{fontSize: '1.1rem', marginBottom: '16px'}}>
                <span style={{color: 'var(--accent-color)', marginRight: '8px'}}>Q{idx + 1}.</span> 
                {q.question_text}
              </h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                {['A', 'B', 'C', 'D'].map(opt => {
                  const optionText = q[`option_${opt.toLowerCase()}`];
                  if (!optionText) return null;
                  return (
                    <label 
                      key={opt}
                      style={{
                        padding: '12px 16px', 
                        border: '1px solid',
                        borderColor: answers[q.question_id] === opt ? 'var(--accent-color)' : 'var(--border-color)',
                        borderRadius: '8px',
                        background: answers[q.question_id] === opt ? '#eff6ff' : '#f9fafb',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input 
                        type="radio" 
                        name={`q_${q.question_id}`} 
                        checked={answers[q.question_id] === opt} 
                        onChange={() => handleSelectAnswer(q.question_id, opt)}
                        style={{accentColor: 'var(--accent-color)', width: '18px', height: '18px'}}
                      />
                      <span><strong>{opt}.</strong> {optionText}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <button className="btn" onClick={handleSubmitQuiz} style={{width: '100%', padding: '16px', fontSize: '1.1rem'}}>
            Submit Quiz
          </button>
        </div>
      )}

      {quizStatus === 'SUBMITTING' && (
        <div className="glass-panel flex-center" style={{height: '200px'}}>
          <h3>Grading...</h3>
        </div>
      )}

      {quizStatus === 'DONE' && (
        <div className="glass-panel">
          <div style={{textAlign: 'center', marginBottom: '32px'}}>
            <h2 style={{fontSize: '2rem'}}>Quiz Completed!</h2>
            <div style={{
              fontSize: '4rem', 
              fontWeight: 800, 
              color: score >= 50 ? 'var(--success-color)' : 'var(--danger-color)',
              margin: '16px 0'
            }}>
              {score.toFixed(1)}%
            </div>
            <p>Your behavioural metrics and scores have been recorded for the Phase 4 ML Engine.</p>
          </div>

          <h3 style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px'}}>Explanations</h3>
          {questions.map((q, idx) => {
            const userAns = answers[q.question_id];
            const isCorrect = userAns === q.correct_option;
            return (
              <div key={q.question_id} style={{marginBottom: '24px', padding: '16px', borderRadius: '8px', background: isCorrect ? '#ecfdf5' : '#fef2f2', border: `1px solid ${isCorrect ? '#a7f3d0' : '#fecaca'}`}}>
                <h4 style={{marginBottom: '8px'}}>Q{idx + 1}. {q.question_text}</h4>
                <p style={{margin: '0 0 8px 0'}}>
                  <strong>Your Answer:</strong> {userAns || 'Skipped'} {isCorrect ? '✅' : '❌'} <br/>
                  <strong>Correct Answer:</strong> {q.correct_option}
                </p>
                <p style={{margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                  <strong>Explanation:</strong> {q.explanation}
                </p>
              </div>
            );
          })}

          <button className="btn" onClick={() => { setQuizStatus('IDLE'); setScore(null); }} style={{width: '100%', marginTop: '16px'}}>
            Take Another Quiz
          </button>
        </div>
      )}
    </div>
  );
}

export default QuizSession;
