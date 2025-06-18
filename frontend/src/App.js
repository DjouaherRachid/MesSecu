import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home-page/home-page.js';
import Login from './components/auth/login';
import ChatPage from './pages/Chat';
import SignIn from './pages/signin-page/signin.js';
import SignUp from './pages/signup-page/signup.js';
import './styles/global.css';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} /> 
      </Routes>
    </Router>
  );
}
export default App;
