import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import LoginRegister from './pages/LoginRegister';
import Dashboard from './pages/Dashboard';
import ProfilePreferences from './pages/ProfilePreferences';
import SyllabusManager from './pages/SyllabusManager';
import QuizSession from './pages/QuizSession';
import StudyTracker from './pages/StudyTracker';
import PerformanceAnalytics from './pages/PerformanceAnalytics';
import AdminDashboard from './pages/AdminDashboard';
import api from './api';

function Navigation() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = async () => {
    try {
      await api.post('/user/logout');
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!token) return null;

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <h2>AIML System</h2>
      </div>
      <div className="nav-links">
        <Link to="/" className="nav-link">Dashboard</Link>
        <Link to="/syllabus" className="nav-link">Syllabus</Link>
        <Link to="/quiz" className="nav-link">Quizzes</Link>
        <Link to="/tracker" className="nav-link">Tracker</Link>
        <Link to="/performance" className="nav-link">Performance</Link>
        <Link to="/profile" className="nav-link">Profile</Link>
        <Link to="/admin" className="nav-link" style={{ color: "#38bdf8", fontWeight: "bold" }}>🖥️ Admin</Link>
        <button onClick={handleLogout} className="btn btn-secondary" style={{padding: '6px 12px', fontSize: '0.9rem'}}>Logout</button>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <div className="container">
        <Routes>
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePreferences />} />
          <Route path="/syllabus" element={<SyllabusManager />} />
          <Route path="/quiz" element={<QuizSession />} />
          <Route path="/tracker" element={<StudyTracker />} />
          <Route path="/performance" element={<PerformanceAnalytics />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
