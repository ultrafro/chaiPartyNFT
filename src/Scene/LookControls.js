import * as THREE from "three";
class LookControls {
  constructor(camera, element) {
    this.camera = camera;
    this.element = element;
    this.target = new THREE.Vector3();
    this.radius = 1;

    this.fovX = 120;
    this.fovY = 120;
    this.lastTouch = new THREE.Vector2();

    this.euler = new THREE.Euler(0, 0, 0, "YXZ");
    this.PI_2 = Math.PI / 2;

    this.locked = false;
    this.disabled = false;

    // element.addEventListener('mousedown', onTouchStart, false);
    // element.addEventListener('touchstart', onTouchStart, false);
    // element.addEventListener('mouseup', onTouchEnd, false);
    // element.addEventListener('touchend', onTouchEnd, false);

    this.element.requestPointerLock =
      this.element.requestPointerLock || this.element.mozRequestPointerLock;

    document.exitPointerLock =
      document.exitPointerLock || document.mozExitPointerLock;

    this.element.addEventListener("click", () => {
      if (this.disabled) {
        return;
      }
      if (!this.locked) {
        console.log("requesting pointer lock!");
        this.element.requestPointerLock();
      }
    });

    document.addEventListener(
      "pointerlockchange",
      () => {
        console.log("POINTER LOCK CHANGE");
      },
      false
    );
    document.addEventListener(
      "mozpointerlockchange",
      () => {
        console.log("MOZ POINTER LOCK CHANGE");
      },
      false
    );
    document.addEventListener(
      "pointerlockerror",
      (e) => {
        console.log("POINTER LOCK ERROR");
        console.log(e);
      },
      false
    );
    document.addEventListener(
      "mozpointerlockerror",
      (e) => {
        console.log("MOZ POINTER LOCK ERROR");
        console.log(e);
      },
      false
    );

    document.addEventListener(
      "pointerlockchange",
      this.lockChangeAlert.bind(this),
      false
    );
    document.addEventListener(
      "mozpointerlockchange",
      this.lockChangeAlert,
      false
    );

    this.element.requestPointerLock();

    // this.element.addEventListener();

    // this.element.addEventListener(
    //   "mousemove",
    //   this.OnTouchMove.bind(this),
    //   false
    // );
    // this.element.addEventListener(
    //   "touchmove",
    //   this.OnTouchMove.bind(this),
    //   false
    // );
  }

  lockChangeAlert() {
    if (
      document.pointerLockElement === this.element ||
      document.mozPointerLockElement === this.element
    ) {
      console.log("The pointer lock status is now locked");
      document.addEventListener(
        "mousemove",
        this.updatePosition.bind(this),
        false
      );
      this.locked = true;
    } else {
      console.log("The pointer lock status is now unlocked");
      document.removeEventListener(
        "mousemove",
        this.updatePosition.bind(this),
        false
      );
      this.locked = false;
    }
  }

  updatePosition(e) {
    if (this.disabled) {
      return;
    }
    if (this.locked) {
      this.euler.setFromQuaternion(this.camera.quaternion);

      this.euler.y -= e.movementX * 0.0002;
      this.euler.x -= e.movementY * 0.0002;

      this.euler.x = Math.max(-this.PI_2, Math.min(this.PI_2, this.euler.x));

      this.camera.quaternion.setFromEuler(this.euler);
    }

    // let factor = 0.005;

    // if (this.locked) {
    //   this.camera.rotation.y = this.camera.rotation.y - e.movementX * factor;
    //   this.camera.rotation.x = this.camera.rotation.x + e.movementY * factor;
    // }
  }

  OnTouchMove(event) {
    if (this.disabled) {
      return;
    }

    let currentTouch = new THREE.Vector2(event.clientX, event.clientY);
    let delta = new THREE.Vector2();
    delta.copy(currentTouch);
    delta.sub(this.lastTouch);
    this.lastTouch.copy(currentTouch);
    console.log(delta);
    delta.multiplyScalar(0.005);

    this.camera.rotation.y = this.camera.rotation.y - delta.x;
    this.camera.rotation.x = this.camera.rotation.x + delta.y;

    // let px = event.clientX / this.element.clientWidth - 0.5;
    // let py = event.clientY / this.element.clientHeight - 0.5;

    // let theta = (((px * this.fovX) / 2) * Math.PI) / 180;
    // let phi = (((py * this.fovY) / 2) * Math.PI) / 180;

    // let nx = this.radius * Math.cos(theta);
    // let ny = this.radius * Math.cos(phi);

    // console.log(this.target);
    // let newCameraPosition = new THREE.Vector3();
    // newCameraPosition.copy(this.target);
    // newCameraPosition.add(new THREE.Vector3(nx, ny, -this.radius));

    // this.camera.position.copy(newCameraPosition);
  }

  OnTouchStart(event) {}

  OnTouchEnd(event) {}
}
export default LookControls;
