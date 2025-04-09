#include "SocialGraph.h"
#include <fstream>
#include <sstream>
#include <queue>
#include <algorithm>

void SocialGraph::build_from_file(const std::string& filename) {
    std::ifstream file(filename);
    if (!file.is_open()) {
        throw std::runtime_error("Could not open file: " + filename);
    }

    std::string line;
    while (std::getline(file, line)) {
        std::istringstream iss(line);
        int from, to;
        if (iss >> from >> to) {
            adjacency_list[from].insert(to);
            adjacency_list[to].insert(from);
            num_edges++;
        }
    }
}

int SocialGraph::get_num_vertices() const {
    return adjacency_list.size();
}

int SocialGraph::get_num_edges() const {
    return num_edges;
}

std::vector<int> SocialGraph::get_neighbors(int vertex) const {
    auto it = adjacency_list.find(vertex);
    if (it == adjacency_list.end()) {
        return {};
    }
    return std::vector<int>(it->second.begin(), it->second.end());
}

std::vector<int> SocialGraph::get_recommendations(int vertex, int num_recommendations) const {
    std::unordered_map<int, int> common_neighbors;
    auto neighbors = get_neighbors(vertex);
    
    for (int neighbor : neighbors) {
        for (int friend_of_friend : get_neighbors(neighbor)) {
            if (friend_of_friend != vertex && 
                adjacency_list.at(vertex).find(friend_of_friend) == adjacency_list.at(vertex).end()) {
                common_neighbors[friend_of_friend]++;
            }
        }
    }
    
    std::vector<std::pair<int, int>> sorted_recommendations(
        common_neighbors.begin(), common_neighbors.end());
    std::sort(sorted_recommendations.begin(), sorted_recommendations.end(),
              [](const auto& a, const auto& b) { return a.second > b.second; });
    
    std::vector<int> result;
    for (int i = 0; i < std::min(num_recommendations, (int)sorted_recommendations.size()); ++i) {
        result.push_back(sorted_recommendations[i].first);
    }
    return result;
}

std::vector<int> SocialGraph::shortest_path(int start, int end) const {
    if (adjacency_list.find(start) == adjacency_list.end() || 
        adjacency_list.find(end) == adjacency_list.end()) {
        return {};
    }

    std::queue<int> q;
    std::unordered_map<int, int> parent;
    std::unordered_set<int> visited;

    q.push(start);
    visited.insert(start);
    parent[start] = -1;

    while (!q.empty()) {
        int current = q.front();
        q.pop();

        if (current == end) {
            std::vector<int> path;
            while (current != -1) {
                path.push_back(current);
                current = parent[current];
            }
            std::reverse(path.begin(), path.end());
            return path;
        }

        for (int neighbor : get_neighbors(current)) {
            if (visited.find(neighbor) == visited.end()) {
                visited.insert(neighbor);
                parent[neighbor] = current;
                q.push(neighbor);
            }
        }
    }

    return {};
}

std::vector<std::vector<int>> SocialGraph::detect_communities() const {
    std::unordered_set<int> visited;
    std::vector<std::vector<int>> communities;

    for (const auto& [vertex, _] : adjacency_list) {
        if (visited.find(vertex) == visited.end()) {
            std::vector<int> community;
            std::queue<int> q;
            q.push(vertex);
            visited.insert(vertex);

            while (!q.empty()) {
                int current = q.front();
                q.pop();
                community.push_back(current);

                for (int neighbor : get_neighbors(current)) {
                    if (visited.find(neighbor) == visited.end()) {
                        visited.insert(neighbor);
                        q.push(neighbor);
                    }
                }
            }
            communities.push_back(community);
        }
    }

    return communities;
} 