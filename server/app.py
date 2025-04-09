from flask import Flask, jsonify, request
from flask_cors import CORS
import graph_api  # This will be our C++ bindings

app = Flask(__name__)
# Configure CORS to allow requests from frontend
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Initialize the graph
graph = graph_api.Graph()
graph.build_from_file("../dataset/facebook_combined.txt")

@app.route('/api/graph', methods=['GET'])
def get_graph():
    # Get the first 50 vertices
    vertices = list(range(min(50, graph.get_num_vertices())))
    edges = []
    
    # Get edges only between the first 50 vertices
    for v in vertices:
        neighbors = graph.get_neighbors(v)
        for neighbor in neighbors:
            if neighbor < 50 and v < neighbor:  # Add each edge only once and only if both nodes are in our subset
                edges.append({'source': v, 'target': neighbor})
    
    # Format data for Cytoscape
    elements = {
        'nodes': [{'data': {'id': str(v)}} for v in vertices],
        'edges': [{'data': {'source': str(e['source']), 'target': str(e['target'])}} for e in edges]
    }
    
    return jsonify(elements)

@app.route('/api/graph/search', methods=['GET'])
def search_node():
    try:
        node_id = request.args.get('id', type=int)
        if node_id is None:
            return jsonify({'error': 'Please provide a node ID'}), 400
        
        # Check if node exists
        neighbors = graph.get_neighbors(node_id)
        if not neighbors:
            return jsonify({'error': f'Node {node_id} not found'}), 404
        
        return jsonify({
            'node_id': node_id,
            'exists': True,
            'neighbors': neighbors
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/graph/stats', methods=['GET'])
def get_graph_stats():
    return jsonify({
        'num_vertices': graph.get_num_vertices(),
        'num_edges': graph.get_num_edges()
    })

@app.route('/api/graph/neighbors/<int:user_id>', methods=['GET'])
def get_neighbors(user_id):
    neighbors = graph.get_neighbors(user_id)
    return jsonify({'neighbors': neighbors})

@app.route('/api/graph/recommendations/<int:user_id>', methods=['GET'])
def get_recommendations(user_id):
    try:
        # Get the user's current friends
        current_friends = set(graph.get_neighbors(user_id))
        
        # Get potential friends (friends of friends)
        potential_friends = {}
        for friend in current_friends:
            for friend_of_friend in graph.get_neighbors(friend):
                if friend_of_friend != user_id and friend_of_friend not in current_friends:
                    if friend_of_friend not in potential_friends:
                        potential_friends[friend_of_friend] = set()
                    potential_friends[friend_of_friend].add(friend)
        
        # Sort by number of mutual friends
        recommendations = sorted(
            [(user, len(mutual_friends)) for user, mutual_friends in potential_friends.items()],
            key=lambda x: x[1],
            reverse=True
        )
        
        # Get top 5 recommendations
        top_recommendations = recommendations[:5]
        
        return jsonify({
            'user_id': user_id,
            'recommendations': [
                {
                    'user_id': rec[0],
                    'mutual_friends_count': rec[1],
                    'mutual_friends': list(potential_friends[rec[0]])
                }
                for rec in top_recommendations
            ]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/graph/shortest-path', methods=['GET'])
def get_shortest_path():
    start = request.args.get('start', type=int)
    end = request.args.get('end', type=int)
    if start is None or end is None:
        return jsonify({'error': 'Missing start or end parameters'}), 400
    path = graph.shortest_path(start, end)
    return jsonify({'path': path})

@app.route('/api/graph/communities', methods=['GET'])
def get_communities():
    communities = graph.detect_communities()
    return jsonify({'communities': communities})

if __name__ == '__main__':
    app.run(debug=True, port=5000) 