import json
from pathlib import Path
import networkx as nx

def export_graph_for_frontend(input_file, output_file):
    """
    Convert the processed data into a format suitable for the frontend visualization.
    Includes circle (community) information and node features.
    """
    # Check if input file exists
    if not Path(input_file).exists():
        print(f"Error: Input file {input_file} not found!")
        print("Please run clean_data.py first to generate the processed data.")
        return
    
    try:
        # Read the processed data
        with open(input_file, 'r') as f:
            data = json.load(f)
        
        # Create the frontend-friendly format
        frontend_data = {
            'nodes': [
                {
                    'data': {
                        'id': str(node['id']),
                        'degree': 0,  # Will be calculated below
                        'circles': list(node['metadata'].get('circles', {}).keys()),
                        'num_circles': len(node['metadata'].get('circles', {})),
                        'features': node['metadata'].get('features', {}),
                    }
                }
                for node in data['nodes']
            ],
            'edges': [
                {
                    'data': {
                        'id': f"e{idx}",
                        'source': str(edge['source']),
                        'target': str(edge['target']),
                        'ego_network': edge['ego_network']
                    }
                }
                for idx, edge in enumerate(data['edges'])
            ]
        }
        
        # Calculate node degrees
        degree_count = {}
        for edge in frontend_data['edges']:
            source_id = edge['data']['source']
            target_id = edge['data']['target']
            
            degree_count[source_id] = degree_count.get(source_id, 0) + 1
            degree_count[target_id] = degree_count.get(target_id, 0) + 1
        
        # Update node degrees
        for node in frontend_data['nodes']:
            node_id = node['data']['id']
            node['data']['degree'] = degree_count.get(node_id, 0)
        
        # Add circle (community) information
        circles = {}
        for node in data['nodes']:
            for circle_name in node['metadata'].get('circles', {}):
                if circle_name not in circles:
                    circles[circle_name] = []
                circles[circle_name].append(str(node['id']))
        
        # Add metadata
        frontend_data['metadata'] = {
            'num_nodes': data['metadata']['num_nodes'],
            'num_edges': data['metadata']['num_edges'],
            'num_ego_networks': data['metadata']['num_ego_networks'],
            'ego_network_sizes': data['metadata']['ego_network_sizes'],
            'circles': circles,
            'num_circles': len(circles)
        }
        
        # Save the frontend data
        with open(output_file, 'w') as f:
            json.dump(frontend_data, f, indent=2)
        
        print(f"Exported graph data to {output_file}")
        print(f"Included {len(circles)} circles and feature information")

    except Exception as e:
        print(f"Error processing data: {str(e)}")
        raise

if __name__ == "__main__":
    input_file = Path(__file__).parent.parent / "processed_data.json"
    output_file = Path(__file__).parent.parent / "frontend_graph.json"
    
    print(f"Looking for input file at: {input_file}")
    export_graph_for_frontend(input_file, output_file) 