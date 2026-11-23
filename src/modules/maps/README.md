## Maps module

Import a PGM image and its paired ROS map_server YAML. The parser validates resolution, origin, polarity and thresholds; PGM rendering is intentionally blocked until authoritative YAML metadata is present. Coordinate conversion uses meters, radians and the declared map frame.

PCD preview currently uses Three.js PCDLoader on the main thread with a file-size guard. Worker parsing, LOD, URDF models and interactive route editing are roadmap items.
