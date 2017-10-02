window.THREE = window.THREE || THREE;

require('three/examples/js/controls/OrbitControls.js');

import config from '../config.js';

class Controls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;

        this.orbitControls = new THREE.OrbitControls(camera, domElement);
        this.orbitControls.enableDamping = true;
        this.orbitControls.minDistance = config.controls.minDistance;
        this.orbitControls.maxDistance = config.controls.maxDistance;
        this.orbitControls.rotateSpeed = config.controls.rotateSpeed;

        this.resetCameraOrbit();
    }

    setEnabled(v) {
        this.orbitControls.enabled = v;
    }

    resetCameraOrbit() {
        this.camera.position.fromArray(config.camera.pos);
        this.camera.lookAt((new THREE.Vector3()).fromArray(config.camera.target));
        this.camera.near = config.camera.near;
        this.camera.far = config.camera.far;
        this.camera.updateProjectionMatrix();
    }

    update(delta) {
        this.orbitControls.update(delta);
    }

    dispose() {
        this.orbitControls.dispose();
    }
}

export default Controls;
