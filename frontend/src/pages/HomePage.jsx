import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h2>Welcome to Social Network Graph Visualization</h2>
        <p className="subtitle">Explore and analyze complex social networks with our interactive visualization tool</p>
        <div className="cta-buttons">
          <Link to="/graph" className="btn btn-primary">
            View Graph
          </Link>
          <Link to="/graph" className="btn btn-secondary">
            Learn More
          </Link>
        </div>
      </div>
      
      <div className="features-grid">
        <div className="card feature-card">
          <h3>Interactive Visualization</h3>
          <p>Explore social networks with our intuitive and interactive graph visualization tools.</p>
        </div>
        <div className="card feature-card">
          <h3>Real-time Analysis</h3>
          <p>Get instant insights into network patterns and relationships.</p>
        </div>
        <div className="card feature-card">
          <h3>Customizable Views</h3>
          <p>Tailor the visualization to your needs with various layout options and filters.</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage; 