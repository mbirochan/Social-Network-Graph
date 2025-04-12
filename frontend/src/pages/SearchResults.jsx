import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

function SearchResults() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First check if the node exists
        const searchResponse = await api.get(`/graph/search?id=${userId}`);
        if (!searchResponse.data.exists) {
          setError('User not found');
          return;
        }

        // If node exists, get recommendations
        const response = await api.get(`/graph/recommendations/${userId}`);
        if (response.data && response.data.recommendations) {
          setRecommendations(response.data.recommendations);
          setUserDetails({
            id: userId,
            connections: response.data.recommendations.length
          });
        } else {
          setError('No recommendations available');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.error || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleNewSearch = () => {
    navigate('/graph');
  };

  if (loading) {
    return (
      <div className="search-results-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-results-page">
        <div className="error-message">{error}</div>
        <button onClick={handleNewSearch} className="back-button">
          Try Another Search
        </button>
      </div>
    );
  }

  return (
    <div className="search-results-page">
      <div className="search-header">
        <h2>Search Results for User {userId}</h2>
        <button onClick={handleNewSearch} className="back-button">
          Back to Graph
        </button>
      </div>

      <div className="user-profile-section">
        <div className="user-profile">
          <div className="user-avatar">
            <span className="avatar-text">U{userDetails.id}</span>
          </div>
          <div className="user-info">
            <h3>User {userDetails.id}</h3>
            <div className="user-stats">
              <div className="stat-item">
                <span className="stat-label">Total Connections</span>
                <span className="stat-value">{userDetails.connections}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="recommendations-section">
        <h3>Friend Recommendations</h3>
        <div className="recommendations-grid">
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
    </div>
  );
}

export default SearchResults; 