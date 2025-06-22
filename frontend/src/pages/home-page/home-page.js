import { Link } from 'react-router-dom';
import './home-page.css';
import '../../styles/animated-background.css';

function HomePage() {
    return (
        <div className="animated-background">
        <div className="homepage-container">
            <h1 className="title">Mes-Secu</h1>
            <div className="btn-container">
                <Link to="/signup" className="btn">S'inscrire</Link>
                <Link to="/signin" className="btn">Se connecter</Link>
            </div>
        </div>
        <div>
                <div className="wave"></div>
                <div className="wave"></div>
                <div className="wave"></div>
            </div>
        </div>

    );
}

export default HomePage;