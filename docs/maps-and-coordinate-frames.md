# Maps & Coordinate Frames

## Map asset package

A navigation map should be stored as a versioned package: metadata JSON + occupancy image (`.pgm` or PNG) + YAML metadata + route graph + optional PCD/PCD metadata + calibration transform.

Do not infer `resolution`, `origin`, frame ID or orientation from image dimensions. They must come from authoritative YAML/backend metadata.

## Supported render pipeline

- PGM P2/P5 -> grayscale occupancy texture.
- YAML -> resolution, origin `[x,y,yaw]`, negate, occupied/free thresholds, frame id.
- PCD ASCII/binary/binary_compressed -> Worker parsing, downsample/LOD, `THREE.Points` buffers.
- GLB/glTF/URDF -> robot model adapter; URDF joints require a kinematics loader and explicit mesh path resolver.
- Route graph -> nodes and edges with frame id, directionality, speed limit and semantic labels.

## Coordinate contract

Canonical world frame: meters, right-handed, `map` frame, yaw in radians. Store image pixel coordinates separately. Convert using YAML origin transform and image row inversion. Never silently mix ROS `map`, `odom`, `base_link`, image pixels or Three.js render coordinates.

The current map workspace requires a paired ROS YAML file before rendering PGM. The YAML parser intentionally supports the scalar subset (`resolution`, `origin`, `negate`, `occupied_thresh`, `free_thresh`, optional `frame_id`, and `image`) used by ROS map_server; it is not a general-purpose YAML parser.
