import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchGraphData = async () => {
  try {
    const response = await api.get('/graph/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching graph data:', error);
    throw error;
  }
};

export const getNeighbors = async (userId) => {
  try {
    const response = await api.get(`/graph/neighbors/${userId}`);
    return response.data.neighbors;
  } catch (error) {
    console.error('Error fetching neighbors:', error);
    throw error;
  }
};

export const getRecommendations = async (userId, numRecommendations = 5) => {
  try {
    const response = await api.get(`/graph/recommendations/${userId}`, {
      params: { num: numRecommendations }
    });
    return response.data.recommendations;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};

export const getShortestPath = async (start, end) => {
  try {
    const response = await api.get('/graph/shortest-path', {
      params: { start, end }
    });
    return response.data.path;
  } catch (error) {
    console.error('Error fetching shortest path:', error);
    throw error;
  }
};

export const getCommunities = async () => {
  try {
    const response = await api.get('/graph/communities');
    return response.data.communities;
  } catch (error) {
    console.error('Error fetching communities:', error);
    throw error;
  }
}; 