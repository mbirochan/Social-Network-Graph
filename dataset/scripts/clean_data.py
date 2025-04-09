import pandas as pd
import json
from pathlib import Path
import glob
import networkx as nx

def load_ego_networks(data_dir):
    """
    Load all ego networks from the Facebook dataset.
    Includes:
    - edges: {ego_id}.edges
    - circles: {ego_id}.circles
    - features: {ego_id}.feat
    - feature names: {ego_id}.featnames
    """
    ego_networks = {}
    
    # Find all ego networks (looking for .edges files)
    edge_files = glob.glob(str(Path(data_dir) / "*.edges"))
    
    for edge_file in edge_files:
        ego_id = Path(edge_file).stem  # Get the ego ID from filename
        base_path = Path(edge_file).parent / ego_id
        
        # Load edges
        edges = pd.read_csv(f"{base_path}.edges", sep=' ', header=None, 
                          names=['source', 'target'])
        
        # Load circles if available
        circles = {}
        try:
            with open(f"{base_path}.circles", 'r') as f:
                for line in f:
                    circle_name, *members = line.strip().split()
                    circles[circle_name] = [int(m) for m in members]
        except FileNotFoundError:
            pass
        
        # Load features if available
        features = None
        feature_names = None
        try:
            features = pd.read_csv(f"{base_path}.feat", sep=' ', header=None)
            featnames = pd.read_csv(f"{base_path}.featnames", sep=' ', header=None)
            feature_names = dict(zip(featnames[0], featnames[1]))
        except FileNotFoundError:
            pass
        
        # Store all data for this ego network
        ego_networks[ego_id] = {
            'edges': edges,
            'circles': circles,
            'features': features,
            'feature_names': feature_names
        }
    
    return ego_networks

def process_networks(ego_networks):
    """
    Process all ego networks into a combined network with metadata.
    """
    # Combine all edges while maintaining ego network information
    all_edges = []
    node_metadata = {}
    
    for ego_id, data in ego_networks.items():
        # Add edges with ego network source information
        edges_df = data['edges'].copy()
        edges_df['ego_network'] = ego_id
        all_edges.append(edges_df)
        
        # Initialize node metadata for circle members
        for circle_name, members in data['circles'].items():
            for member in members:
                if member not in node_metadata:
                    node_metadata[member] = {'circles': {}, 'features': {}}  # Initialize both circles and features
                elif 'circles' not in node_metadata[member]:  # Add circles if not present
                    node_metadata[member]['circles'] = {}
                node_metadata[member]['circles'][f"{ego_id}_{circle_name}"] = True
        
        # Store features for nodes
        if data['features'] is not None:
            features = data['features']
            feature_names = data['feature_names']
            for idx, row in features.iterrows():
                node_id = row[0]
                if node_id not in node_metadata:
                    node_metadata[node_id] = {'circles': {}, 'features': {}}  # Initialize both
                node_metadata[node_id]['features'] = {
                    feature_names[i]: val 
                    for i, val in enumerate(row[1:])
                }
    
    # Make sure all nodes from edges are in metadata
    for edges in all_edges:
        for node in pd.concat([edges['source'], edges['target']]).unique():
            if node not in node_metadata:
                node_metadata[node] = {'circles': {}, 'features': {}}

    # Combine all edges
    combined_edges = pd.concat(all_edges, ignore_index=True)
    
    # Remove duplicate edges
    combined_edges = combined_edges.drop_duplicates(subset=['source', 'target'])
    
    # Create the processed data structure
    processed_data = {
        'nodes': [
            {
                'id': node_id,
                'metadata': metadata
            }
            for node_id, metadata in node_metadata.items()
        ],
        'edges': combined_edges.to_dict('records'),
        'metadata': {
            'num_nodes': len(node_metadata),
            'num_edges': len(combined_edges),
            'num_ego_networks': len(ego_networks),
            'ego_network_sizes': {
                ego_id: len(data['edges']) 
                for ego_id, data in ego_networks.items()
            }
        }
    }
    
    return processed_data

def clean_facebook_data(input_dir, output_file):
    """
    Clean and preprocess the Facebook ego networks dataset.
    """
    # Load all ego networks
    ego_networks = load_ego_networks(input_dir)
    
    # Process the networks into a combined structure
    processed_data = process_networks(ego_networks)
    
    # Save the processed data
    with open(output_file, 'w') as f:
        json.dump(processed_data, f, indent=2)
    
    print(f"Processed {processed_data['metadata']['num_nodes']} nodes and "
          f"{processed_data['metadata']['num_edges']} edges from "
          f"{processed_data['metadata']['num_ego_networks']} ego networks")
    print(f"Data saved to {output_file}")

if __name__ == "__main__":
    input_dir = Path(__file__).parent.parent / "facebook"
    output_file = Path(__file__).parent.parent / "processed_data.json"
    clean_facebook_data(input_dir, output_file) 