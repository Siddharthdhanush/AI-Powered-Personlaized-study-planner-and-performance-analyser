import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function SyllabusManager() {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [resourceFiles, setResourceFiles] = useState([]);
  
  // Topic state
  const [activeSubject, setActiveSubject] = useState(null);
  const [newTopic, setNewTopic] = useState({ name: '', difficulty: '2', hours: '2', preferredTime: '' });
  const [newExam, setNewExam] = useState('');
  const [editingExamId, setEditingExamId] = useState(null);
  const [editExamDate, setEditExamDate] = useState('');
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editTopicData, setEditTopicData] = useState({ name: '', difficulty: '2', hours: '2', preferredTime: '' });
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [editSubjectName, setEditSubjectName] = useState('');
  const [extractedTopics, setExtractedTopics] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [isAddingTopics, setIsAddingTopics] = useState(false);

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
        
        await api.post(`/syllabus/subjects/${createdSubjectId}/upload`, formData);
      }

      // 3. Upload additional resources if selected
      if (resourceFiles && resourceFiles.length > 0) {
        for (const file of resourceFiles) {
          const resFormData = new FormData();
          resFormData.append('file', file);
          await api.post(`/syllabus/subjects/${createdSubjectId}/resources`, resFormData);
        }
      }

      setNewSubject('');
      setSelectedFile(null);
      setResourceFiles([]);
      await fetchSubjects();
      setActiveSubject(createdSubjectId);
    } catch (err) {
      alert('Failed to add subject or upload file');
    }
  };

  const handleAddResource = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!activeSubject) return;
    try {
      for (const file of Array.from(e.target.files)) {
        const formData = new FormData();
        formData.append('file', file);
        await api.post(`/syllabus/subjects/${activeSubject}/resources`, formData);
      }
      fetchSubjects();
    } catch (err) {
      alert('Failed to upload resource');
    }
    // reset file input
    e.target.value = null;
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
      await api.delete(`/syllabus/subjects/${activeSubject}/resources/${resourceId}`);
      fetchSubjects();
    } catch (err) {
      alert('Failed to delete resource');
    }
  };

  const handleDeleteSubject = async (e, subjectId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this subject?")) return;
    try {
      await api.delete(`/syllabus/subjects/${subjectId}`);
      if (activeSubject === subjectId) setActiveSubject(null);
      fetchSubjects();
    } catch (err) {
      alert('Failed to delete subject');
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

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm("Are you sure you want to delete this topic?")) return;
    try {
      await api.delete(`/syllabus/subjects/${activeSubject}/topics/${topicId}`);
      fetchSubjects();
    } catch (err) {
      alert('Failed to delete topic');
    }
  };

  const handleEditTopic = (topic) => {
    setEditingTopicId(topic.topic_id);
    setEditTopicData({
      name: topic.topic_name,
      difficulty: topic.difficulty_weight.toString(),
      hours: topic.estimated_hours.toString(),
      preferredTime: topic.preferred_time || ''
    });
  };

  const handleSaveTopic = async (topicId) => {
    try {
      await api.put(`/syllabus/subjects/${activeSubject}/topics/${topicId}`, {
        topic_name: editTopicData.name,
        difficulty_weight: parseFloat(editTopicData.difficulty),
        estimated_hours: parseFloat(editTopicData.hours),
        preferred_time: editTopicData.preferredTime || null
      });
      setEditingTopicId(null);
      fetchSubjects();
    } catch (err) {
      alert('Failed to update topic');
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

  const handleSaveSubjectName = async (subjectId) => {
    if (!editSubjectName.trim()) return;
    try {
      await api.put(`/syllabus/subjects/${subjectId}`, { subject_name: editSubjectName });
      setEditingSubjectId(null);
      fetchSubjects();
    } catch (err) {
      alert('Failed to update subject name');
    }
  };

  const handleExtractSyllabus = async () => {
    if (!activeSubject) return;
    try {
      alert('Asking Ollama AI to read your PDF and extract topics. This may take 30-60 seconds depending on your hardware...');
      const res = await api.post(`/ai/syllabus/extract/${activeSubject}`);
      const topics = res.data.topics.map(t => ({ ...t, selected: true }));
      setExtractedTopics(topics);
      alert('AI extracted topics successfully! Please review the suggested list below.');
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

  const handleGenerateMultipleTimetable = async () => {
    if (selectedSubjects.length === 0) {
      alert('Please select at least one subject to generate a timetable.');
      return;
    }
    try {
      await api.post('/planning/generate', { subject_ids: selectedSubjects });
      alert('Timetable generated successfully for selected subjects! Head to your Dashboard to see it.');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to generate timetable. Ensure selected subjects have topics and exam dates set.');
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
                <label style={{fontSize: '0.9rem', fontWeight: 500, display: 'block', marginBottom: '6px'}}>Upload Syllabus (PDF/DOC/IMG)</label>
                <label 
                  htmlFor="file-upload" 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    background: '#eff6ff',
                    color: 'var(--accent-color)',
                    border: '1px dashed var(--accent-color)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    justifyContent: 'center',
                    width: '100%'
                  }}
                >
                  <span>📂 {selectedFile ? selectedFile.name : 'Choose Syllabus File'}</span>
                </label>
                <input 
                  id="file-upload"
                  type="file" 
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={e => setSelectedFile(e.target.files[0])}
                  style={{display: 'none'}}
                />
              </div>
              <div>
                <label style={{fontSize: '0.9rem', fontWeight: 500, display: 'block', marginBottom: '6px'}}>Additional Resources (Optional)</label>
                <label 
                  htmlFor="resource-upload" 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    background: '#f3f4f6',
                    color: '#4b5563',
                    border: '1px dashed #9ca3af',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    justifyContent: 'center',
                    width: '100%'
                  }}
                >
                  <span>📎 {resourceFiles.length > 0 ? `${resourceFiles.length} file(s) selected` : 'Choose Resource Files'}</span>
                </label>
                <input 
                  id="resource-upload"
                  type="file" 
                  multiple
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={e => setResourceFiles(Array.from(e.target.files))}
                  style={{display: 'none'}}
                />
              </div>
              <button type="submit" className="btn" style={{marginTop: '8px'}}>Create Subject</button>
            </form>
          </div>

          {selectedSubjects.length > 0 && (
            <div style={{
              background: '#eff6ff', 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid #bfdbfe', 
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent-color)'}}>
                {selectedSubjects.length} subject{selectedSubjects.length > 1 ? 's' : ''} selected
              </span>
              <button 
                onClick={handleGenerateMultipleTimetable} 
                className="btn" 
                style={{
                  fontSize: '0.85rem', 
                  padding: '6px 12px', 
                  background: 'var(--success-color)',
                  boxShadow: 'none'
                }}
              >
                ✨ Generate Timetable ({selectedSubjects.length})
              </button>
            </div>
          )}

          {subjects.length === 0 ? (
            <p style={{textAlign: 'center', padding: '20px 0'}}>No subjects added yet.</p>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              {subjects.map(sub => {
                const isSelected = selectedSubjects.includes(sub.subject_id);
                return (
                  <div 
                    key={sub.subject_id} 
                    className="glass-panel"
                    style={{
                      padding: '16px', 
                      cursor: 'pointer',
                      borderWidth: '2px',
                      borderColor: activeSubject === sub.subject_id ? 'var(--accent-color)' : 'var(--border-color)',
                      boxShadow: activeSubject === sub.subject_id ? '0 4px 6px -1px rgba(59, 130, 246, 0.2)' : 'none',
                      transform: 'none',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center'
                    }}
                    onClick={() => setActiveSubject(sub.subject_id)}
                  >
                    <input 
                      type="checkbox"
                      checked={isSelected}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => {
                        setSelectedSubjects(prev => 
                          prev.includes(sub.subject_id) 
                            ? prev.filter(id => id !== sub.subject_id)
                            : [...prev, sub.subject_id]
                        );
                      }}
                      style={{
                        accentColor: 'var(--accent-color)',
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer'
                      }}
                    />
                    <div style={{flex: 1}}>
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px'}} onClick={(e) => e.stopPropagation()}>
                        {editingSubjectId === sub.subject_id ? (
                          <div style={{display: 'flex', gap: '4px', width: '100%', alignItems: 'center'}}>
                            <input 
                              type="text" 
                              className="input-field" 
                              value={editSubjectName} 
                              onChange={e => setEditSubjectName(e.target.value)} 
                              style={{padding: '4px 8px', fontSize: '0.9rem', flex: 1}}
                              autoFocus
                            />
                            <button onClick={() => handleSaveSubjectName(sub.subject_id)} className="btn" style={{padding: '4px 8px', fontSize: '0.8rem', background: 'var(--success-color)'}}>✓</button>
                            <button onClick={() => setEditingSubjectId(null)} className="btn btn-secondary" style={{padding: '4px 8px', fontSize: '0.8rem'}}>✗</button>
                          </div>
                        ) : (
                          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                            <span style={{fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)'}}>
                              {sub.subject_name}
                            </span>
                            <div style={{display: 'flex', gap: '8px'}}>
                              <button onClick={(e) => { e.stopPropagation(); setEditingSubjectId(sub.subject_id); setEditSubjectName(sub.subject_name); }} style={{background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.95rem'}} title="Edit Subject Name">✏️</button>
                              <button onClick={(e) => handleDeleteSubject(e, sub.subject_id)} style={{background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.95rem'}} title="Delete Subject">🗑️</button>
                            </div>
                          </div>
                        )}
                      </div>
                      {sub.file_path && (
                        <span style={{fontSize: '0.8rem', color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '4px'}}>
                          📎 File Uploaded
                        </span>
                      )}
                      <div style={{display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '8px'}}>
                        <span className="badge">{sub.topics?.length || 0} Topics</span>
                        {sub.exams?.length > 0 && <span className="badge" style={{color: '#d97706', background: '#fef3c7', borderColor: '#fde68a'}}>📅 Exam Set</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
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

                    {extractedTopics && (
                      <div className="glass-panel" style={{ background: '#f8fafc', border: '1px solid var(--accent-color)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--accent-color)' }}>📋 Suggested Topics ({extractedTopics.length})</h3>
                        <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>Check the topics you want to include in your timetable. You can edit their names and properties after adding them.</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto', marginBottom: '16px', paddingRight: '4px' }}>
                          {extractedTopics.map((topic, idx) => (
                            <label 
                              key={idx}
                              style={{
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px', 
                                padding: '8px 12px', 
                                background: '#fff', 
                                border: '1px solid var(--border-color)', 
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                              }}
                            >
                              <input 
                                type="checkbox" 
                                checked={topic.selected}
                                onChange={() => {
                                  const updated = [...extractedTopics];
                                  updated[idx].selected = !updated[idx].selected;
                                  setExtractedTopics(updated);
                                }}
                                style={{ accentColor: 'var(--accent-color)', width: '16px', height: '16px' }}
                              />
                              <div style={{ flex: 1 }}>
                                <span style={{ fontWeight: 600 }}>{topic.topic_name}</span>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                  Difficulty: {topic.difficulty_weight} | Est. Hours: {topic.estimated_hours}h
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            type="button"
                            disabled={isAddingTopics}
                            onClick={async (e) => {
                              e.preventDefault();
                              const selected = extractedTopics.filter(t => t.selected);
                              if (selected.length === 0) {
                                alert("Please select at least one topic.");
                                return;
                              }
                              setIsAddingTopics(true);
                              try {
                                await api.post(`/syllabus/subjects/${activeSubject}/topics/bulk`, selected.map(s => ({
                                  topic_name: s.topic_name,
                                  difficulty_weight: parseFloat(String(s.difficulty_weight).replace(/[^\d.-]/g, '')) || 2.0,
                                  estimated_hours: parseFloat(String(s.estimated_hours).replace(/[^\d.-]/g, '')) || 2.0
                                })));
                                setExtractedTopics(null);
                                alert(`Successfully added ${selected.length} topics!`);
                                fetchSubjects();
                              } catch (err) {
                                alert(`Failed to add topics: ${err.response?.data?.detail || err.message}`);
                              } finally {
                                setIsAddingTopics(false);
                              }
                            }}
                            className="btn"
                            style={{ background: isAddingTopics ? '#9ca3af' : 'var(--success-color)', cursor: isAddingTopics ? 'not-allowed' : 'pointer' }}
                          >
                            {isAddingTopics ? 'Extracting Context & Saving...' : 'Add Selected Topics'}
                          </button>
                          <button 
                            onClick={() => setExtractedTopics(null)} 
                            className="btn btn-secondary"
                            disabled={isAddingTopics}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Additional Resources Section */}
                    <div style={{background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--border-color)'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                        <h3 style={{fontSize: '1.05rem', margin: 0}}>Additional Resources</h3>
                        <label 
                          htmlFor="panel-resource-upload" 
                          className="btn btn-secondary"
                          style={{padding: '4px 12px', fontSize: '0.85rem', cursor: 'pointer', margin: 0}}
                        >
                          + Add Resource
                        </label>
                        <input 
                          id="panel-resource-upload"
                          type="file" 
                          multiple
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          onChange={handleAddResource}
                          style={{display: 'none'}}
                        />
                      </div>
                      
                      {activeSubObj?.resources && activeSubObj.resources.length > 0 ? (
                        <ul style={{listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', margin: 0, padding: 0}}>
                          {activeSubObj.resources.map(res => (
                            <li key={res.resource_id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '6px'}}>
                              <span style={{fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)'}}>
                                📎 {res.filename}
                              </span>
                              <button 
                                onClick={() => handleDeleteResource(res.resource_id)}
                                style={{background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.95rem', color: '#ef4444'}}
                                title="Delete Resource"
                              >
                                🗑️
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0}}>No additional resources uploaded.</p>
                      )}
                    </div>

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
                      {activeSubObj?.topics?.map(topic => {
                        const isEditing = editingTopicId === topic.topic_id;
                        return (
                          <li key={topic.topic_id} style={{padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            {isEditing ? (
                              <div style={{display: 'grid', gap: '8px', width: '100%'}}>
                                <input
                                  type="text"
                                  className="input-field"
                                  value={editTopicData.name}
                                  onChange={e => setEditTopicData({ ...editTopicData, name: e.target.value })}
                                  placeholder="Topic Name"
                                  required
                                />
                                <div style={{display: 'flex', gap: '8px'}}>
                                  <div style={{flex: 1}}>
                                    <label style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Difficulty/Priority (1-5)</label>
                                    <input
                                      type="number"
                                      min="1" max="5"
                                      className="input-field"
                                      value={editTopicData.difficulty}
                                      onChange={e => setEditTopicData({ ...editTopicData, difficulty: e.target.value })}
                                    />
                                  </div>
                                  <div style={{flex: 1}}>
                                    <label style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Est. Hours</label>
                                    <input
                                      type="number"
                                      step="0.5"
                                      className="input-field"
                                      value={editTopicData.hours}
                                      onChange={e => setEditTopicData({ ...editTopicData, hours: e.target.value })}
                                    />
                                  </div>
                                  <div style={{flex: 1}}>
                                    <label style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Pref. Time</label>
                                    <input
                                      type="time"
                                      className="input-field"
                                      value={editTopicData.preferredTime}
                                      onChange={e => setEditTopicData({ ...editTopicData, preferredTime: e.target.value })}
                                    />
                                  </div>
                                </div>
                                <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px'}}>
                                  <button onClick={() => handleSaveTopic(topic.topic_id)} className="btn" style={{padding: '6px 12px', fontSize: '0.85rem', background: 'var(--success-color)'}}>Save</button>
                                  <button onClick={() => setEditingTopicId(null)} className="btn btn-secondary" style={{padding: '6px 12px', fontSize: '0.85rem'}}>Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div>
                                  <span style={{fontWeight: 600, fontSize: '1.05rem', display: 'block', marginBottom: '4px'}}>{topic.topic_name}</span>
                                  <div style={{display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                                    <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                                      <span style={{color: '#f59e0b'}}>★</span> Difficulty/Priority: {topic.difficulty_weight}
                                    </span>
                                    <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                                      <span style={{color: '#3b82f6'}}>⏱️</span> Est. Time: {topic.estimated_hours} hrs
                                    </span>
                                    {topic.preferred_time && (
                                      <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                                        <span>🕒</span> Pref: {topic.preferred_time}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div style={{display: 'flex', gap: '8px'}}>
                                  <button onClick={() => handleEditTopic(topic)} className="btn btn-secondary" style={{padding: '6px 8px', fontSize: '0.85rem', border: 'none', background: 'transparent'}} title="Edit Topic">✏️</button>
                                  <button onClick={() => handleDeleteTopic(topic.topic_id)} style={{background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem'}} title="Delete Topic">🗑️</button>
                                </div>
                              </>
                            )}
                          </li>
                        );
                      })}
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
