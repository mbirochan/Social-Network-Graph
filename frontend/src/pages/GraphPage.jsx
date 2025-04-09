import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
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
      setSearchError('Please enter a node ID');
      return;
    }

    try {
      setLoadingRecommendations(true);
      setSearchError(null);
      
      // First check if the node exists
      const searchResponse = await api.get(`/graph/search?id=${searchInput}`);
      if (!searchResponse.data.exists) {
        setSearchError('Node not found');
        return;
      }

      // If node exists, get recommendations
      const response = await api.get(`/graph/recommendations/${searchInput}`);
      setRecommendations(response.data);
      setSelectedNode(parseInt(searchInput));
      
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
      console.error('Error searching node:', err);
      setSearchError(err.response?.data?.error || 'Error searching node');
    } finally {
      setLoadingRecommendations(false);
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
    <div className="graph-page" style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: '20px', boxSizing: 'border-box', overflow: 'hidden' }}>
      <h2>Social Network Graph</h2>
      {error && <div className="error-message" style={{ color: 'red', padding: '10px' }}>{error}</div>}
      <div style={{ display: 'flex', flex: 1, gap: '20px', minHeight: '0', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', minWidth: '0', width: '100%', position: 'relative' }}>
          <div 
            ref={containerRef}
            style={{ 
              flex: 1,
              height: 'calc(100vh - 250px)', 
              border: '1px solid #ccc',
              backgroundColor: '#f5f5f5',
              display: loading ? 'none' : 'block',
              position: 'relative',
              overflow: 'visible',
              width: '100%',
              minWidth: '0',
              boxSizing: 'border-box',
              zIndex: 1
            }} 
          />
          <div style={{ padding: '10px', backgroundColor: '#fff', border: '1px solid #ccc', flexShrink: 0, position: 'relative', zIndex: 2 }}>
            <p style={{ margin: '0 0 10px 0' }}>Displaying first 50 users. Use search to find any user in the network.</p>
          </div>
        </div>
        <div style={{ flex: 1, padding: '20px', border: '1px solid #ccc', backgroundColor: '#fff', minWidth: '300px', maxWidth: '400px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 250px)', boxSizing: 'border-box', position: 'relative', zIndex: 2 }}>
          <h3>Search User</h3>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="number"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter user ID"
              style={{ 
                padding: '8px',
                width: '100%',
                marginBottom: '10px',
                border: searchError ? '1px solid red' : '1px solid #ccc'
              }}
            />
            {searchError && <div style={{ color: 'red', marginBottom: '10px' }}>{searchError}</div>}
            <button 
              onClick={handleSearch}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Search
            </button>
          </div>
          <h3>Friend Recommendations</h3>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
            {loadingRecommendations ? (
              <div>Loading recommendations...</div>
            ) : selectedNode ? (
              recommendations ? (
                <div>
                  <h4>Recommendations for User {selectedNode}</h4>
                  {recommendations.recommendations.map((rec, index) => (
                    <div key={index} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee' }}>
                      <div style={{ fontWeight: 'bold' }}>User {rec.user_id}</div>
                      <div>Mutual Friends: {rec.mutual_friends_count}</div>
                      <div style={{ fontSize: '0.9em', color: '#666' }}>
                        Mutual Friends: {rec.mutual_friends.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>No recommendations available</div>
              )
            ) : (
              <div>Search for a user to see friend recommendations</div>
            )}
          </div>
        </div>
      </div>
      {loading && <div className="loading" style={{ padding: '20px' }}>Loading graph...</div>}
      <Link to="/" className="btn btn-secondary" style={{ marginTop: '10px' }}>
        Back to Home
      </Link>
    </div>
  );
}

export default GraphPage; 