import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function SyllabusManager() {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Topic state
  const [activeSubject, setActiveSubject] = useState(null);
  const [newTopic, setNewTopic] = useState({ name: '', difficulty: '2', hours: '2', preferredTime: '' });
  const [newExam, setNewExam] = useState('');
  const [editingExamId, setEditingExamId] = useState(null);
  const [editExamDate, setEditExamDate] = useState('');

  const navigate = useNavigate();

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/syllabus/subjects');
      setSubjects(res.data);
    } catch (err) {
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [navigate]);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    try {
      // 1. Create Subject
      const res = await api.post('/syllabus/subjects', { subject_name: newSubject });
      const createdSubjectId = res.data.subject_id;

      // 2. Upload file if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        await api.post(`/syllabus/subjects/${createdSubjectId}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      setNewSubject('');
      setSelectedFile(null);
      fetchSubjects();
    } catch (err) {
      alert('Failed to add subject or upload file');
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!activeSubject) return;
    try {
      await api.post(`/syllabus/subjects/${activeSubject}/topics`, {
        topic_name: newTopic.name,
        difficulty_weight: parseFloat(newTopic.difficulty),
        estimated_hours: parseFloat(newTopic.hours),
        preferred_time: newTopic.preferredTime || null
      });
      setNewTopic({ name: '', difficulty: '2', hours: '2', preferredTime: '' });
      fetchSubjects(); 
    } catch (err) {
      alert('Failed to add topic');
    }
  };

  const handleAddExam = async (e) => {
    e.preventDefault();
    if (!activeSubject || !newExam) return;
    try {
      await api.post(`/syllabus/subjects/${activeSubject}/exams`, {
        exam_date: newExam
      });
      setNewExam('');
      fetchSubjects();
    } catch (err) {
      alert('Failed to add exam date');
    }
  };

  const handleUpdateExam = async (e, examId) => {
    e.preventDefault();
    if (!activeSubject || !editExamDate) return;
    try {
      await api.put(`/syllabus/subjects/${activeSubject}/exams/${examId}`, {
        exam_date: editExamDate
      });
      setEditingExamId(null);
      setEditExamDate('');
      fetchSubjects();
    } catch (err) {
      alert('Failed to update exam date');
    }
  };

  const handleExtractSyllabus = async () => {
    if (!activeSubject) return;
    try {
      alert('Asking Ollama AI to read your PDF and extract topics. This may take 30-60 seconds depending on your hardware...');
      await api.post(`/ai/syllabus/extract/${activeSubject}`);
      alert('Topics successfully extracted and added!');
      fetchSubjects();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to extract topics. Is Ollama running?');
    }
  };

  const handleGenerateTimetable = async () => {
    if (!activeSubject) return;
    try {
      await api.post(`/planning/generate/${activeSubject}`);
      alert('Timetable generated successfully! Head to your Dashboard to see it.');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to generate timetable. Ensure you have preferences, topics, and an exam date set.');
    }
  };

  return (
    <div>
      <h1 style={{marginBottom: '32px'}}>Syllabus Manager</h1>
      
      <div className="grid grid-cols-2">
        {/* Subjects List */}
        <div className="glass-panel" style={{alignSelf: 'start'}}>
          <h2>Your Subjects</h2>
          
          <div style={{background: '#f9fafb', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--border-color)'}}>
            <h3 style={{fontSize: '1rem', marginBottom: '12px'}}>Add New Subject</h3>
            <form onSubmit={handleAddSubject} style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Subject Name (e.g. Machine Learning)" 
                value={newSubject} 
                onChange={e => setNewSubject(e.target.value)} 
                required
              />
              <div>
                <label style={{fontSize: '0.9rem', fontWeight: 500, display: 'block', marginBottom: '6px'}}>Upload Syllabus (PDF/DOC)</label>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx"
                  onChange={e => setSelectedFile(e.target.files[0])}
                  style={{fontSize: '0.9rem'}}
                />
              </div>
              <button type="submit" className="btn" style={{marginTop: '8px'}}>Create Subject</button>
            </form>
          </div>

          {subjects.length === 0 ? (
            <p style={{textAlign: 'center', padding: '20px 0'}}>No subjects added yet.</p>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              {subjects.map(sub => (
                <div 
                  key={sub.subject_id} 
                  className="glass-panel"
                  style={{
                    padding: '16px', 
                    cursor: 'pointer',
                    borderWidth: '2px',
                    borderColor: activeSubject === sub.subject_id ? 'var(--accent-color)' : 'var(--border-color)',
                    boxShadow: activeSubject === sub.subject_id ? '0 4px 6px -1px rgba(59, 130, 246, 0.2)' : 'none',
                    transform: 'none'
                  }}
                  onClick={() => setActiveSubject(sub.subject_id)}
                >
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <div>
                      <span style={{fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)', display: 'block', marginBottom: '4px'}}>
                        {sub.subject_name}
                      </span>
                      {sub.file_path && (
                        <span style={{fontSize: '0.8rem', color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '4px'}}>
                          📎 File Uploaded
                        </span>
                      )}
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end'}}>
                      <span className="badge">{sub.topics?.length || 0} Topics</span>
                      {sub.exams?.length > 0 && <span className="badge" style={{color: '#d97706', background: '#fef3c7', borderColor: '#fde68a'}}>📅 Exam Set</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Topic/Exam Manager for active subject */}
        <div className="glass-panel" style={{alignSelf: 'start', minHeight: '400px'}}>
          {!activeSubject ? (
            <div className="flex-center" style={{height: '100%', color: 'var(--text-secondary)', textAlign: 'center'}}>
              <div>
                <p style={{fontSize: '1.2rem', fontWeight: 500, marginBottom: '8px'}}>No Subject Selected</p>
                <p style={{fontSize: '0.9rem'}}>Select a subject from the list to manage its topics and exams.</p>
              </div>
            </div>
          ) : (
            <>
              {(() => {
                const activeSubObj = subjects.find(s => s.subject_id === activeSubject);
                return (
                  <>
                    <h2 style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span>Managing: <span style={{color: 'var(--accent-color)'}}>{activeSubObj?.subject_name}</span></span>
                      {activeSubObj?.topics?.length > 0 && activeSubObj?.exams?.length > 0 && (
                        <button onClick={handleGenerateTimetable} className="btn" style={{fontSize: '0.9rem', padding: '8px 16px', background: 'var(--success-color)', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)'}}>
                          ✨ Generate Timetable
                        </button>
                      )}
                    </h2>
                    
                    {/* Exam Date Section */}
                    <div style={{background: '#f9fafb', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--border-color)'}}>
                      <h3 style={{fontSize: '1.05rem', marginBottom: '12px'}}>Target Exam Date</h3>
                      {activeSubObj?.exams?.length > 0 ? (
                        editingExamId === activeSubObj.exams[0].exam_id ? (
                          <form onSubmit={(e) => handleUpdateExam(e, activeSubObj.exams[0].exam_id)} style={{display: 'flex', gap: '12px'}}>
                            <input type="date" className="input-field" style={{flex: 1}} value={editExamDate} onChange={e => setEditExamDate(e.target.value)} required />
                            <button type="submit" className="btn btn-secondary">Save</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setEditingExamId(null)}>Cancel</button>
                          </form>
                        ) : (
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 600}}>
                              <span>📅</span> {activeSubObj.exams[0].exam_date}
                            </div>
                            <button className="btn btn-secondary" style={{padding: '4px 12px', fontSize: '0.85rem'}} onClick={() => {
                              setEditingExamId(activeSubObj.exams[0].exam_id);
                              setEditExamDate(activeSubObj.exams[0].exam_date);
                            }}>Edit Date</button>
                          </div>
                        )
                      ) : (
                        <form onSubmit={handleAddExam} style={{display: 'flex', gap: '12px'}}>
                          <input type="date" className="input-field" style={{flex: 1}} value={newExam} onChange={e => setNewExam(e.target.value)} required />
                          <button type="submit" className="btn btn-secondary">Set Date</button>
                        </form>
                      )}
                    </div>
                    
                    {/* Syllabus Overview Section */}
                    {activeSubObj?.file_path && (
                      <div style={{background: '#e0e7ff', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #c7d2fe'}}>
                        <h3 style={{fontSize: '1.05rem', marginBottom: '8px', color: '#3730a3'}}>📄 Uploaded Syllabus</h3>
                        <p style={{fontSize: '0.9rem', color: '#4f46e5', marginBottom: '12px'}}>We have received your syllabus file. Click below to let our AI Engine extract and structure the topics automatically!</p>
                        <button onClick={handleExtractSyllabus} className="btn" style={{background: '#4f46e5', color: '#fff', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)'}}>
                          ✨ Extract Topics with AI
                        </button>
                      </div>
                    )}

                    {/* Topics Section */}
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                      <h3 style={{fontSize: '1.1rem', margin: 0}}>Topics List</h3>
                      <span className="badge">{activeSubObj?.topics?.length || 0}</span>
                    </div>

                    <form onSubmit={handleAddTopic} style={{display: 'grid', gap: '12px', marginBottom: '24px', background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)'}}>
                      <input type="text" className="input-field" placeholder="Topic Name (e.g. Backpropagation)" value={newTopic.name} onChange={e => setNewTopic({...newTopic, name: e.target.value})} required />
                      <div style={{display: 'flex', gap: '16px'}}>
                        <div className="form-group" style={{flex: 1}}>
                          <label style={{fontSize: '0.9rem', fontWeight: 600}}>Difficulty (1-5)</label>
                          <input type="number" min="1" max="5" className="input-field" value={newTopic.difficulty} onChange={e => setNewTopic({...newTopic, difficulty: e.target.value})} />
                        </div>
                        <div className="form-group" style={{flex: 1}}>
                          <label style={{fontSize: '0.9rem', fontWeight: 600}}>Est. Hours</label>
                          <input type="number" step="0.5" className="input-field" value={newTopic.hours} onChange={e => setNewTopic({...newTopic, hours: e.target.value})} />
                        </div>
                        <div className="form-group" style={{flex: 1.5}}>
                          <label style={{fontSize: '0.9rem', fontWeight: 600}}>Pref. Time (Optional)</label>
                          <input type="time" className="input-field" value={newTopic.preferredTime} onChange={e => setNewTopic({...newTopic, preferredTime: e.target.value})} />
                        </div>
                      </div>
                      <button type="submit" className="btn" style={{marginTop: '4px'}}>Add Topic</button>
                    </form>

                    {/* Topics List */}
                    <ul style={{listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px'}}>
                      {activeSubObj?.topics?.map(topic => (
                        <li key={topic.topic_id} style={{padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                          <span style={{fontWeight: 600, fontSize: '1.05rem'}}>{topic.topic_name}</span>
                          <div style={{display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                            <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                              <span style={{color: '#f59e0b'}}>★</span> Difficulty: {topic.difficulty_weight}
                            </span>
                            <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                              <span style={{color: '#3b82f6'}}>⏱️</span> Est. Time: {topic.estimated_hours} hrs
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SyllabusManager;
