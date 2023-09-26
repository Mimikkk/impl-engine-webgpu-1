import { Vector3 } from '../math/Vector3.js';
import { Spherical } from '../math/Spherical.js';
import { Object3D } from '../core/Object3D.js';
import { MathUtils } from '../math/MathUtils.js';

const _lookDirection = new Vector3();
const _spherical = new Spherical();
const _target = new Vector3();

export class FirstPersonControls {
  object: Object3D;
  canvas: HTMLElement;
  enabled: boolean;
  movementSpeed: number;
  lookSpeed: number;
  lookVertical: boolean;
  autoForward: boolean;
  activeLook: boolean;
  heightSpeed: boolean;
  heightCoef: number;
  heightMin: number;
  heightMax: number;
  constrainVertical: boolean;
  verticalMin: number;
  verticalMax: number;
  mouseDragOn: boolean;
  autoSpeedFactor: number;
  pointerX: number;
  pointerY: number;
  moveForward: boolean;
  moveBackward: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  viewHalfX: number;
  viewHalfY: number;
  moveUp: boolean;
  moveDown: boolean;
  handleResize: () => void;
  onPointerDown: (event: PointerEvent) => void;
  onPointerUp: (event: PointerEvent) => void;
  onPointerMove: (event: PointerEvent) => void;
  onKeyDown: (event: KeyboardEvent) => void;
  onKeyUp: (event: KeyboardEvent) => void;
  lookAt: (x: number | Vector3, y?: number, z?: number) => FirstPersonControls;
  update: (delta: number) => void;
  dispose: () => void;

  constructor(object: Object3D, canvas: HTMLElement) {
    this.object = object;
    this.canvas = canvas;
    this.enabled = true;
    this.movementSpeed = 1.0;
    this.lookSpeed = 0.005;
    this.lookVertical = true;
    this.autoForward = false;
    this.activeLook = true;
    this.heightSpeed = false;
    this.heightCoef = 1.0;
    this.heightMin = 0.0;
    this.heightMax = 1.0;
    this.constrainVertical = false;
    this.verticalMin = 0;
    this.verticalMax = Math.PI;
    this.mouseDragOn = false;
    this.autoSpeedFactor = 0.0;
    this.pointerX = 0;
    this.pointerY = 0;
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.viewHalfX = 0;
    this.viewHalfY = 0;

    let lat = 0;
    let lon = 0;

    this.handleResize = function () {
      if (this.canvas === document) {
        this.viewHalfX = window.innerWidth / 2;
        this.viewHalfY = window.innerHeight / 2;
      } else {
        this.viewHalfX = this.canvas.offsetWidth / 2;
        this.viewHalfY = this.canvas.offsetHeight / 2;
      }
    };

    this.onPointerDown = function (event) {
      if (this.canvas !== document) {
        this.canvas.focus();
      }

      if (this.activeLook) {
        switch (event.button) {
          case 0:
            this.moveForward = true;
            break;
          case 2:
            this.moveBackward = true;
            break;
        }
      }

      this.mouseDragOn = true;
    };

    this.onPointerUp = function (event) {
      if (this.activeLook) {
        switch (event.button) {
          case 0:
            this.moveForward = false;
            break;
          case 2:
            this.moveBackward = false;
            break;
        }
      }

      this.mouseDragOn = false;
    };

    this.onPointerMove = function (event) {
      if (this.canvas === document) {
        this.pointerX = event.pageX - this.viewHalfX;
        this.pointerY = event.pageY - this.viewHalfY;
      } else {
        this.pointerX = event.pageX - this.canvas.offsetLeft - this.viewHalfX;
        this.pointerY = event.pageY - this.canvas.offsetTop - this.viewHalfY;
      }
    };

    this.onKeyDown = function (event) {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = true;
          break;

        case 'ArrowLeft':
        case 'KeyA':
          this.moveLeft = true;
          break;

        case 'ArrowDown':
        case 'KeyS':
          this.moveBackward = true;
          break;

        case 'ArrowRight':
        case 'KeyD':
          this.moveRight = true;
          break;

        case 'KeyR':
          this.moveUp = true;
          break;
        case 'KeyF':
          this.moveDown = true;
          break;
      }
    };

    this.onKeyUp = function (event) {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = false;
          break;

        case 'ArrowLeft':
        case 'KeyA':
          this.moveLeft = false;
          break;

        case 'ArrowDown':
        case 'KeyS':
          this.moveBackward = false;
          break;

        case 'ArrowRight':
        case 'KeyD':
          this.moveRight = false;
          break;

        case 'KeyR':
          this.moveUp = false;
          break;
        case 'KeyF':
          this.moveDown = false;
          break;
      }
    };

    this.lookAt = function (x, y, z) {
      if (Vector3.is(x)) {
        _target.copy(x);
      } else {
        _target.set(x, y, z);
      }

      this.object.lookAt(_target);

      setOrientation(this);

      return this;
    };

    const targetPosition = new Vector3();
    this.update = function update(delta) {
      if (!this.enabled) return;

      if (this.heightSpeed) {
        const y = MathUtils.clamp(this.object.position.y, this.heightMin, this.heightMax);
        const heightDelta = y - this.heightMin;

        this.autoSpeedFactor = delta * (heightDelta * this.heightCoef);
      } else {
        this.autoSpeedFactor = 0.0;
      }

      const actualMoveSpeed = delta * this.movementSpeed;

      if (this.moveForward || (this.autoForward && !this.moveBackward))
        this.object.translateZ(-(actualMoveSpeed + this.autoSpeedFactor));
      if (this.moveBackward) this.object.translateZ(actualMoveSpeed);

      if (this.moveLeft) this.object.translateX(-actualMoveSpeed);
      if (this.moveRight) this.object.translateX(actualMoveSpeed);

      if (this.moveUp) this.object.translateY(actualMoveSpeed);
      if (this.moveDown) this.object.translateY(-actualMoveSpeed);

      let actualLookSpeed = delta * this.lookSpeed;

      if (!this.activeLook) {
        actualLookSpeed = 0;
      }

      let verticalLookRatio = 1;

      if (this.constrainVertical) {
        verticalLookRatio = Math.PI / (this.verticalMax - this.verticalMin);
      }

      lon -= this.pointerX * actualLookSpeed;
      if (this.lookVertical) lat -= this.pointerY * actualLookSpeed * verticalLookRatio;

      lat = Math.max(-85, Math.min(85, lat));

      let phi = MathUtils.degToRad(90 - lat);
      const theta = MathUtils.degToRad(lon);

      if (this.constrainVertical) {
        phi = MathUtils.mapLinear(phi, 0, Math.PI, this.verticalMin, this.verticalMax);
      }

      const position = this.object.position;

      targetPosition.setFromSphericalCoords(1, phi, theta).add(position);

      this.object.lookAt(targetPosition);
    };

    this.dispose = function () {
      this.canvas.removeEventListener('contextmenu', contextmenu);
      this.canvas.removeEventListener('pointerdown', _onPointerDown);
      this.canvas.removeEventListener('pointermove', _onPointerMove);
      this.canvas.removeEventListener('pointerup', _onPointerUp);

      window.removeEventListener('keydown', _onKeyDown);
      window.removeEventListener('keyup', _onKeyUp);
    };

    const _onPointerMove = this.onPointerMove.bind(this);
    const _onPointerDown = this.onPointerDown.bind(this);
    const _onPointerUp = this.onPointerUp.bind(this);
    const _onKeyDown = this.onKeyDown.bind(this);
    const _onKeyUp = this.onKeyUp.bind(this);

    this.canvas.addEventListener('contextmenu', contextmenu);
    this.canvas.addEventListener('pointerdown', _onPointerDown);
    this.canvas.addEventListener('pointermove', _onPointerMove);
    this.canvas.addEventListener('pointerup', _onPointerUp);

    window.addEventListener('keydown', _onKeyDown);
    window.addEventListener('keyup', _onKeyUp);

    function setOrientation(controls: FirstPersonControls) {
      const quaternion = controls.object.quaternion;

      _lookDirection.set(0, 0, -1).applyQuaternion(quaternion);
      _spherical.setFromVector3(_lookDirection);

      lat = 90 - MathUtils.radToDeg(_spherical.phi);
      lon = MathUtils.radToDeg(_spherical.theta);
    }

    this.handleResize();

    setOrientation(this);
  }
}

function contextmenu(event: MouseEvent) {
  event.preventDefault();
}
