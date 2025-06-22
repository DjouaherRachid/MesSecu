import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home-page/home-page.js';
import SignIn from './pages/signin-page/signin.js';
import SignUp from './pages/signup-page/signup.js';
import HomeConnected from './pages/home-connected/home-connected.js';
import ProtectedRoute from './utils/protected-route.js';
import './styles/global.css';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} /> 
        <Route path="/homeConnected" element={<ProtectedRoute element={HomeConnected} />}/>
      </Routes>
    </Router>
  );
}
export default App;
