import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Methodology from './pages/Methodology';
import Dataset from './pages/Dataset';
import Publications from './pages/Publications';
import About from './pages/About';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/dataset" element={<Dataset />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;