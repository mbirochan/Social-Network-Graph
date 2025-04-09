# Social Network Graph Visualization

A full-stack application for visualizing and analyzing social network graphs using C++, Python, and React.

## Project Structure

- `backend/`: C++ implementation of graph algorithms and data structures
- `server/`: Python Flask API server
- `frontend/`: React frontend for graph visualization
- `dataset/`: Stanford Facebook dataset and processing scripts
- `docs/`: Project documentation

## Prerequisites

- C++17 compatible compiler
- Python 3.8+
- Node.js 14+
- CMake 3.10+
- pybind11

## Setup Instructions

### Backend Setup

```bash
cd backend
mkdir build && cd build
cmake ..
make
```

### Server Setup

```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

1. Start the Flask server:

```bash
cd server
python app.py
```

2. Start the frontend development server:

```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Features

- Interactive graph visualization using Cytoscape.js
- Graph algorithms implementation (BFS, DFS, shortest path)
- Friend recommendations
- Community detection
- Centrality measures
- Real-time graph updates

## API Documentation

See `docs/API_Documentation.md` for detailed API endpoint descriptions.

## License

MIT License - see LICENSE file for details
