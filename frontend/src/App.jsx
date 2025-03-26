import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudySession from './pages/StudySession';
import NewSession from "./pages/NewSession";



function App() {
  return (
    <Router>
      <div className="p-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/study/:sessionId" element={<StudySession />} />
          <Route path="/new-session" element={<NewSession />} />
          <Route path="/session/:sessionId" element={<StudySession />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
