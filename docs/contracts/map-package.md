# Map Package Contract

```json
{
  "id": "map-warehouse-a-v1",
  "name": "Warehouse A",
  "frameId": "map",
  "resolution": 0.05,
  "origin": [0.0, 0.0, 0.0],
  "image": "occupancy.pgm",
  "yaml": "map.yaml",
  "pointCloud": "cloud.pcd",
  "routeGraph": "routes.json",
  "version": 1
}
```

The sample is illustrative. Production metadata must be supplied by the map server. PCD and raster parsers must enforce file-size and point-count limits, validate numeric ranges and run expensive parsing in Web Workers.
