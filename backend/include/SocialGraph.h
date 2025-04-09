#pragma once

#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>

class SocialGraph {
private:
    std::unordered_map<int, std::unordered_set<int>> adjacency_list;
    int num_edges;

public:
    SocialGraph() : num_edges(0) {}

    void build_from_file(const std::string& filename);
    int get_num_vertices() const;
    int get_num_edges() const;
    std::vector<int> get_neighbors(int vertex) const;
    std::vector<int> get_recommendations(int vertex, int num_recommendations = 5) const;
    std::vector<int> shortest_path(int start, int end) const;
    std::vector<std::vector<int>> detect_communities() const;
}; 