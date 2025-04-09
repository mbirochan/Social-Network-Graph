#ifndef ALGORITHMS_H
#define ALGORITHMS_H

#include "Graph.h"
#include <vector>
#include <queue>
#include <unordered_set>

namespace GraphAlgorithms
{
    // Breadth-First Search
    std::vector<int> bfs(const Graph &graph, int startVertex);

    // Depth-First Search
    std::vector<int> dfs(const Graph &graph, int startVertex);

    // Shortest Path (Dijkstra's algorithm)
    std::vector<int> shortestPath(const Graph &graph, int startVertex, int endVertex);

    // Friend Recommendations
    std::vector<int> getRecommendations(const Graph &graph, int userId, int numRecommendations = 5);

    // Community Detection (Basic implementation)
    std::vector<std::vector<int>> detectCommunities(const Graph &graph);

    // Centrality Measures
    std::vector<double> calculateDegreeCentrality(const Graph &graph);
    std::vector<double> calculateBetweennessCentrality(const Graph &graph);
}

#endif // ALGORITHMS_H