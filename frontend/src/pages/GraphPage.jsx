import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import axios from 'axios';

// Register the layout
cytoscape.use(coseBilkent);

// Configure axios base URL
const api = axios.create({
  baseURL: '/api'  // Use the proxy instead of direct URL
});

function GraphPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchError, setSearchError] = useState(null);
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const navigate = useNavigate();

  // Fetch graph data
  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        setLoading(true);
        console.log('Fetching graph data...');
        const response = await api.get('/graph');
        const data = response.data;
        console.log('Graph data received:', data);

        if (!data || !data.nodes || !data.edges) {
          throw new Error('Invalid graph data format');
        }

        console.log(`Received ${data.nodes.length} nodes and ${data.edges.length} edges`);
        setGraphData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching graph data:', err);
        setError(`Failed to load graph data: ${err.message}`);
        setLoading(false);
      }
    };

    fetchGraphData();
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!searchInput.trim()) {
      setSearchError('Please enter a user ID');
      return;
    }

    try {
      setSearchError(null);
      
      // First check if the node exists
      const searchResponse = await api.get(`/graph/search?id=${searchInput}`);
      if (!searchResponse.data.exists) {
        setSearchError('User not found');
        return;
      }

      // If node exists, navigate to search results page
      navigate(`/search/${searchInput}`, { replace: true });
      
      // Highlight the node in the graph if it's visible
      if (cyRef.current) {
        const node = cyRef.current.getElementById(searchInput);
        if (node.length > 0) {
          cyRef.current.elements().removeClass('highlight');
          node.addClass('highlight');
          node.neighborhood().addClass('highlight');
        }
      }
    } catch (err) {
      console.error('Error searching user:', err);
      setSearchError(err.response?.data?.error || 'Error searching user');
    }
  };

  // Initialize graph after data is loaded and container is mounted
  useEffect(() => {
    if (loading || !graphData || !containerRef.current) return;

    try {
      console.log('Initializing graph...');
      const cy = cytoscape({
        container: containerRef.current,
        elements: graphData,
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#666',
              'label': 'data(id)',
              'width': 40,
              'height': 40,
              'font-size': '12px',
              'text-valign': 'center',
              'text-halign': 'center',
              'color': '#fff',
              'border-width': 2,
              'border-color': '#fff'
            }
          },
          {
            selector: 'node.highlight',
            style: {
              'background-color': '#ff6b6b',
              'border-color': '#ff6b6b'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#999',
              'curve-style': 'bezier',
              'opacity': 0.7
            }
          },
          {
            selector: 'edge.highlight',
            style: {
              'line-color': '#ff6b6b'
            }
          }
        ],
        layout: {
          name: 'cose-bilkent',
          animate: true,
          animationDuration: 1000,
          nodeDimensionsIncludeLabels: true,
          idealEdgeLength: 100,
          padding: 50,
          randomize: true,
          componentSpacing: 100,
          nodeRepulsion: 400000
        }
      });

      // Store the cytoscape instance in the ref
      cyRef.current = cy;

      // Add event listeners
      cy.on('tap', 'node', function(evt) {
        const node = evt.target;
        const nodeId = parseInt(node.id());
        console.log('Node clicked:', nodeId);
        
        // Update selected node
        setSelectedNode(nodeId);
        setSearchInput(nodeId.toString());
        
        // Highlight the node and its neighbors
        cy.elements().removeClass('highlight');
        node.addClass('highlight');
        node.neighborhood().addClass('highlight');
      });

      cy.on('tap', 'edge', function(evt) {
        const edge = evt.target;
        console.log('Edge clicked:', edge.id());
        // Highlight the edge and its connected nodes
        cy.elements().removeClass('highlight');
        edge.addClass('highlight');
        edge.connectedNodes().addClass('highlight');
      });

      // Fit the graph to the viewport
      cy.fit();
      
      // Center the graph
      cy.center();

      console.log('Graph initialized successfully');
    } catch (err) {
      console.error('Error initializing graph:', err);
      setError(`Failed to initialize graph: ${err.message}`);
    }

    // Cleanup function
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [loading, graphData]);

  return (
    <div className="graph-page">
      <div className="graph-header">
        <h2>Social Network Graph</h2>
        <p className="graph-description">Interactive visualization of social connections</p>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="graph-container">
        <div className="graph-main">
          <div 
            ref={containerRef}
            className="graph-visualization"
            style={{ display: loading ? 'none' : 'block' }}
          />
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading graph data...</p>
            </div>
          )}
          <div className="graph-info">
            <p>Displaying first 50 users. Use search to find any user in the network.</p>
          </div>
        </div>
        
        <div className="graph-sidebar">
          <div className="search-section">
            <h3>Search User</h3>
            <div className="search-input-group">
              <input
                type="number"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter user ID"
                className={searchError ? 'error' : ''}
              />
              {searchError && <div className="search-error">{searchError}</div>}
              <button 
                onClick={handleSearch}
                className="search-button"
              >
                Search
              </button>
            </div>
          </div>
          
          {selectedNode && (
            <div className="user-details-section">
              <div className="user-profile">
                <div className="user-avatar">
                  <span className="avatar-text">U{selectedNode}</span>
                </div>
                <div className="user-info">
                  <h3>User {selectedNode}</h3>
                  <div className="user-stats">
                    <div className="stat-item">
                      <span className="stat-label">Connections</span>
                      <span className="stat-value">{recommendations ? recommendations.length : 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {loadingRecommendations ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading recommendations...</p>
                </div>
              ) : recommendations && recommendations.length > 0 ? (
                <div className="recommendations-section">
                  <h4>Friend Recommendations</h4>
                  <div className="recommendations-list">
                    {recommendations.map((rec, index) => (
                      <div key={index} className="recommendation-card">
                        <div className="rec-header">
                          <div className="rec-avatar">
                            <span className="avatar-text">U{rec.user_id}</span>
                          </div>
                          <div className="rec-info">
                            <span className="rec-name">User {rec.user_id}</span>
                            <span className="rec-mutual-count">{rec.mutual_friends_count} mutual friends</span>
                          </div>
                        </div>
                        {rec.mutual_friends && rec.mutual_friends.length > 0 && (
                          <div className="rec-mutual-friends">
                            <span className="mutual-label">Mutual Friends:</span>
                            <div className="mutual-list">
                              {rec.mutual_friends.map((friend, idx) => (
                                <span key={idx} className="mutual-friend">U{friend}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="no-recommendations">
                  <p>No recommendations available for this user</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GraphPage; 