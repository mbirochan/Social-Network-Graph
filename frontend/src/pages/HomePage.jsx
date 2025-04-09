import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="home-page">
      <h2>Welcome to Social Network Graph Visualization</h2>
      <p>This application allows you to visualize and analyze social network graphs.</p>
      <Link to="/graph" className="btn btn-primary">
        View Graph
      </Link>
    </div>
  );
}

export default HomePage; 