import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Admin from './Admin';
import Uploader from './Uploader';

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Uploader />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
