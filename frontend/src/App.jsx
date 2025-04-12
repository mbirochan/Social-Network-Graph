import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GraphPage from './pages/GraphPage';
import SearchResults from './pages/SearchResults';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Social Network Graph Visualization</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/graph" element={<GraphPage />} />
            <Route path="/search/:userId" element={<SearchResults />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 