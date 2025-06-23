import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home-page/home-page.js';
import SignIn from './pages/signin-page/signin.js';
import SignUp from './pages/signup-page/signup.js';
import Dashboard from './pages/dashboard/dashboard.js';
import ProtectedRoute from './utils/protected-route.js';
import './styles/global.css';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} /> 
        <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />}/>
      </Routes>
    </Router>
  );
}
export default App;
