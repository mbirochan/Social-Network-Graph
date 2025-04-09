import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { fetchGraphData } from '../services/api';

cytoscape.use(coseBilkent);

const GraphVisualization = () => {
  const cyRef = useRef(null);

  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cytoscape({
      container: cyRef.current,
      elements: {
        nodes: [],
        edges: []
      },
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#666',
            'label': 'data(id)',
            'width': 30,
            'height': 30,
            'font-size': '10px'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 1,
            'line-color': '#ccc',
            'curve-style': 'straight'
          }
        }
      ],
      layout: {
        name: 'cose-bilkent',
        animate: true,
        animationDuration: 1000,
        randomize: true,
        componentSpacing: 100,
        nodeRepulsion: 400000,
        nodeDimensionsIncludeLabels: true
      }
    });

    // Fetch and load graph data
    const loadGraphData = async () => {
      try {
        const data = await fetchGraphData();
        cy.elements().remove();
        cy.add(data);
      } catch (error) {
        console.error('Error loading graph data:', error);
      }
    };

    loadGraphData();

    // Cleanup
    return () => {
      cy.destroy();
    };
  }, []);

  return (
    <div className="graph-container">
      <div ref={cyRef} style={{ width: '100%', height: '600px' }} />
    </div>
  );
};

export default GraphVisualization; 