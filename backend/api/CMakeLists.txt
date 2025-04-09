pybind11_add_module(graph_api
    graph_api.cpp
)

target_include_directories(graph_api PRIVATE
    ${PROJECT_SOURCE_DIR}/include
)

target_link_libraries(graph_api PRIVATE
    graph_lib
)

# Set the output name to match what Python expects
set_target_properties(graph_api PROPERTIES
    PREFIX ""
    SUFFIX "${PYTHON_MODULE_EXTENSION}"
) 