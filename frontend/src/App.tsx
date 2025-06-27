import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home-page/home-page';
import SignIn from './pages/signin-page/signin';
import SignUp from './pages/signup-page/signup';
import Dashboard from './pages/dashboard/dashboard';
import ProtectedRoute from './utils/protected-route';
import './styles/global.css';
import { SocketProvider } from './context/socket-context';


function App() {
  return (
    <Router>
    <SocketProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} /> 
          <Route path="/dashboard" element={        
            <ProtectedRoute element={Dashboard} />
          }
          />
      </Routes>
    </SocketProvider>
    </Router>
  );
}
export default App;
