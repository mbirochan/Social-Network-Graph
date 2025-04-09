#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include "SocialGraph.h"

namespace py = pybind11;

PYBIND11_MODULE(graph_api, m) {
    m.doc() = "Social Network Graph API"; // Optional module docstring
    
    py::class_<SocialGraph>(m, "Graph")
        .def(py::init<>())
        .def("build_from_file", &SocialGraph::build_from_file)
        .def("get_num_vertices", &SocialGraph::get_num_vertices)
        .def("get_num_edges", &SocialGraph::get_num_edges)
        .def("get_neighbors", &SocialGraph::get_neighbors)
        .def("get_recommendations", &SocialGraph::get_recommendations)
        .def("shortest_path", &SocialGraph::shortest_path)
        .def("detect_communities", &SocialGraph::detect_communities);
} 