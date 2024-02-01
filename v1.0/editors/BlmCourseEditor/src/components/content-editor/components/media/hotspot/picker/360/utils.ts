import { Vector3 } from "three";

export function getViewerPosition(viewer: any) {
  const intersects = viewer.raycaster.intersectObject(viewer.panorama, true);

  if (intersects.length > 0) {
    const point = intersects[0].point.clone();
    const world = viewer.panorama.getWorldPosition(new Vector3());
    point.sub(world);

    return {
      x: point.x,
      y: point.y,
      z: point.z,
    };
  }
}
