import { EventDispatcher, Matrix4, Raycaster, Sphere, Vector2, Vector3 } from "three";

const _sphere = new Sphere();
const _raycaster = new Raycaster();
const _pointer = new Vector2();
const _offset = new Vector3();
const _intersection = new Vector3();
const _worldPosition = new Vector3();
const _inverseMatrix = new Matrix4();

class DragControls extends EventDispatcher {
  constructor(_viewer: any, _container: HTMLElement) {
    super();

    let _selected: any = null;
    let _objects: any[] = [];

    const scope = this;

    function add(object: any) {
      if (object) {
        object.element.addEventListener("pointerdown", onPointerDown);
        _objects.push(object);
      }
    }

    function remove(object: any) {
      const ind = _objects.indexOf(object);

      if (ind !== -1) {
        object.element.removeEventListener("pointerdown", onPointerDown);
        _objects.splice(ind, 1);
      }
    }

    function activate() {
      _container.addEventListener("pointermove", onPointerMove);
      _container.addEventListener("pointerup", onPointerCancel);
      _container.addEventListener("pointerleave", onPointerCancel);
    }

    function deactivate() {
      _container.removeEventListener("pointermove", onPointerMove);
      _container.removeEventListener("pointerup", onPointerCancel);
      _container.removeEventListener("pointerleave", onPointerCancel);
    }

    function dispose() {
      _objects.forEach((obj) => remove(obj));
      _objects = [];
    }

    function getRaycaster() {
      return _raycaster;
    }

    function onPointerDown(event: any) {
      const object = _objects.find((obj) => obj.element === event.target);

      if (scope.enabled === false || !object) return;

      event.preventDefault();
      updatePointer(event);

      _raycaster.setFromCamera(_pointer, _viewer.camera);

      _selected = object;

      if (_sphere.isEmpty()) {
        _viewer.panorama.geometry.computeBoundingSphere();
        _sphere.copy(_viewer.panorama.geometry.boundingSphere);
      }

      if (_raycaster.ray.intersectSphere(_sphere, _intersection)) {
        _inverseMatrix.copy(_selected.parent.matrixWorld).invert();
        _offset
          .copy(_intersection)
          .sub(_worldPosition.setFromMatrixPosition(_selected.matrixWorld));
      }

      scope.dispatchEvent({ type: "dragstart", object: _selected });
      activate();
    }

    function onPointerMove(event: any) {
      if (scope.enabled === false) return;

      updatePointer(event);

      _raycaster.setFromCamera(_pointer, _viewer.camera);

      if (_selected) {
        if (_raycaster.ray.intersectSphere(_sphere, _intersection)) {
          _selected.position.copy(_intersection.sub(_offset).applyMatrix4(_inverseMatrix));
        }

        scope.dispatchEvent({ type: "drag", object: _selected });
      }
    }

    function onPointerCancel() {
      if (scope.enabled === false) return;

      if (_selected) {
        scope.dispatchEvent({ type: "dragend", object: _selected });

        _selected = null;
      }

      deactivate();
    }

    function updatePointer(event: any) {
      const rect = _container.getBoundingClientRect();

      _pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      _pointer.y = (-(event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    // API
    this.enabled = true;

    this.add = add;
    this.remove = remove;
    this.dispose = dispose;
    this.getRaycaster = getRaycaster;
  }
}

export { DragControls };
