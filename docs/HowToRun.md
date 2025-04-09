# How to Run the Application

This guide provides detailed instructions for setting up and running the Social Network Graph application.

## Prerequisites

Before running the application, ensure you have the following installed:

1. C++17 compatible compiler (e.g., GCC 7+, Clang 5+, MSVC 2017+)
2. Python 3.8 or higher
3. Node.js 14 or higher
4. CMake 3.10 or higher
5. pybind11

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/social-network-graph.git
cd social-network-graph
```

### 2. Download the Dataset

1. Download the Stanford Facebook dataset from [SNAP](https://snap.stanford.edu/data/ego-Facebook.html)
2. Place the `facebook_combined.txt` file in the `dataset/` directory

### 3. Process the Dataset

```bash
cd dataset/scripts
python clean_data.py
python export_graph.py
```

This will create:

- `processed_data.json`: Cleaned and processed data for the backend
- `frontend_graph.json`: Frontend-friendly format of the graph data

### 4. Build the Backend

```bash
cd ../../backend
mkdir build && cd build
cmake ..
make
```

### 5. Set Up the Python Environment

```bash
cd ../../server
python -m venv venv

# On Windows:
venv\Scripts\activate

# On Unix or MacOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 6. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Running the Application

### 1. Start the Backend Server

```bash
cd ../server
python app.py
```

The server will start on `http://localhost:5000`

### 2. Start the Frontend Development Server

```bash
cd ../frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Testing

### Backend Tests

```bash
cd backend/build
ctest
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Troubleshooting

### Common Issues

1. **CMake Build Fails**

   - Ensure you have the correct C++ compiler installed
   - Check that pybind11 is properly installed
   - Try clearing the build directory and rebuilding

2. **Python Environment Issues**

   - Make sure you're using the correct Python version
   - Try recreating the virtual environment
   - Check that all dependencies are installed correctly

3. **Frontend Build Issues**
   - Clear the node_modules directory and run `npm install` again
   - Check for any version conflicts in package.json
   - Ensure you're using a compatible Node.js version

### Getting Help

If you encounter any issues:

1. Check the error messages in the console
2. Review the documentation in the `docs/` directory
3. Open an issue on the project's GitHub repository

## Development Workflow

1. Make changes to the code
2. Run tests to ensure everything works
3. Build the project to verify compilation
4. Start the development servers
5. Test the changes in the browser

## Production Deployment

For production deployment:

1. Build the frontend: `npm run build`
2. Use a production-grade WSGI server (e.g., Gunicorn) for the Flask app
3. Set up proper environment variables
4. Configure CORS settings appropriately
5. Use HTTPS for security
