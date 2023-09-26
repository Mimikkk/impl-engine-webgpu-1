import { Plane } from '../math/Plane.js';
import { Intersection, Raycaster } from '../core/Raycaster.js';
import { Vector2 } from '../math/Vector2.js';
import { Vector3 } from '../math/Vector3.js';
import { Matrix4 } from '../math/Matrix4.js';
import { EventDispatcher } from '../core/EventDispatcher.js';
import { AnimationMixer } from '../animation/AnimationMixer.js';
import { Object3D } from '../core/Object3D.js';
import { PerspectiveCamera } from '../cameras/PerspectiveCamera.js';
import { OrthographicCamera } from '../cameras/OrthographicCamera.js';

const plane = new Plane();
const raycaster = new Raycaster();

const pointer = new Vector2();
const offset = new Vector3();
const intersection = new Vector3();
const worldPosition = new Vector3();
const inverseMatrix = new Matrix4();

export class DragControls extends EventDispatcher<DragControls.Event['type'], DragControls.Event> {
  selected: Object3D | null = null;
  hovered: Object3D | null = null;
  objects: Object3D[];
  enabled: boolean;
  transformGroup: boolean;

  constructor(objects: Object3D[], camera: PerspectiveCamera | OrthographicCamera, canvas: HTMLCanvasElement) {
    super();

    this.objects = objects;
    // disable touch scroll
    canvas.style.touchAction = 'none';

    const intersections: Intersection[] = [];

    const updatePointer = ({ clientY, clientX }: PointerEvent) => {
      const { left, top, width, height } = canvas.getBoundingClientRect();

      pointer.x = ((clientX - left) / width) * 2 - 1;
      pointer.y = (-(clientY - top) / height) * 2 + 1;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!this.enabled) return;

      updatePointer(event);
      raycaster.setFromCamera(pointer, camera);

      if (this.selected) {
        if (raycaster.ray.intersectPlane(plane, intersection)) {
          this.selected.position.copy(intersection.sub(offset).applyMatrix4(inverseMatrix));
        }

        this.dispatchEvent({ type: 'drag', object: this.selected });

        return;
      }

      if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
        intersections.length = 0;

        raycaster.setFromCamera(pointer, camera);
        raycaster.intersectObjects(objects, true, intersections);

        if (intersections.length > 0) {
          const object = intersections[0].object;

          plane.setFromNormalAndCoplanarPoint(
            camera.getWorldDirection(plane.normal),
            worldPosition.setFromMatrixPosition(object.matrixWorld),
          );

          if (this.hovered !== object && this.hovered !== null) {
            this.dispatchEvent({ type: 'hoveroff', object: this.hovered });

            canvas.style.cursor = 'auto';
            this.hovered = null;
          }

          if (this.hovered !== object) {
            this.dispatchEvent({ type: 'hoveron', object: object });

            canvas.style.cursor = 'pointer';
            this.hovered = object;
          }
        } else {
          if (this.hovered !== null) {
            this.dispatchEvent({ type: 'hoveroff', object: this.hovered });

            canvas.style.cursor = 'auto';
            this.hovered = null;
          }
        }
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!this.enabled) return;

      updatePointer(event);

      intersections.length = 0;

      raycaster.setFromCamera(pointer, camera);
      raycaster.intersectObjects(objects, true, intersections);

      if (intersections.length > 0) {
        this.selected = this.transformGroup ? objects[0] : intersections[0].object;

        plane.setFromNormalAndCoplanarPoint(
          camera.getWorldDirection(plane.normal),
          worldPosition.setFromMatrixPosition(this.selected.matrixWorld),
        );

        if (raycaster.ray.intersectPlane(plane, intersection)) {
          inverseMatrix.copy(this.selected.parent!.matrixWorld).invert();
          offset.copy(intersection).sub(worldPosition.setFromMatrixPosition(this.selected.matrixWorld));
        }

        canvas.style.cursor = 'move';

        this.dispatchEvent({ type: 'dragstart', object: this.selected });
      }
    };

    const onPointerCancel = () => {
      if (!this.enabled) return;

      if (this.selected) {
        this.dispatchEvent({ type: 'dragend', object: this.selected });
        this.selected = null;
      }

      canvas.style.cursor = this.hovered ? 'pointer' : 'auto';
    };

    this.activate = () => {
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointerup', onPointerCancel);
      canvas.addEventListener('pointerleave', onPointerCancel);
    };
    this.activate();

    // API

    this.enabled = true;
    this.transformGroup = false;

    this.deactivate = () => {
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerCancel);
      canvas.removeEventListener('pointerleave', onPointerCancel);

      canvas.style.cursor = '';
    };
  }

  activate: () => void;
  deactivate: () => void;
  dispose(): void {
    this.deactivate();
  }
  get raycaster(): Raycaster {
    return raycaster;
  }
}

export namespace DragControls {
  export interface HoverOnEvent extends EventDispatcher.Event<'hoveron', AnimationMixer> {
    object: Object3D;
  }
  export interface HoverOffEvent extends EventDispatcher.Event<'hoveroff', AnimationMixer> {
    object: Object3D;
  }
  export interface DragEvent extends EventDispatcher.Event<'drag', AnimationMixer> {
    object: Object3D;
  }
  export interface DragStartEvent extends EventDispatcher.Event<'dragstart', AnimationMixer> {
    object: Object3D;
  }
  export interface DragEndEvent extends EventDispatcher.Event<'dragend', AnimationMixer> {
    object: Object3D;
  }

  export type Event = HoverOnEvent | HoverOffEvent | DragEvent | DragStartEvent | DragEndEvent;
}
