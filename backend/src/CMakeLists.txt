add_library(graph_lib STATIC
    social_graph.cpp
)

target_include_directories(graph_lib PUBLIC
    ${PROJECT_SOURCE_DIR}/include
)

target_compile_definitions(graph_lib PRIVATE
    -DBUILDING_GRAPH_LIB
) 