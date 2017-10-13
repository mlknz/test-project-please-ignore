// import config from '../../config.js';

class Env {
    constructor(assets) {
        this.mesh = new THREE.Object3D();
        this.mesh.name = 'env_root';
        this.mesh.add(this._createBack(assets.textures.backTex));
        this.mesh.add(this._createShuffleButton(assets.textures.randomButtonTex));
        this.mesh.add(this._createEndButton(assets.textures.endButtonTex));
    }

    _createBack(tex) {
        const geom = new THREE.PlaneBufferGeometry(0.666, 1);
        const mat = new THREE.MeshBasicMaterial({map: tex});

        const mesh = new THREE.Mesh(geom, mat);
        return mesh;
    }

    _createShuffleButton(tex) {
        const geom = new THREE.PlaneBufferGeometry(0.16, 0.05);
        const mat = new THREE.MeshBasicMaterial({map: tex, transparent: true});
        this.shuffleButton = new THREE.Mesh(geom, mat);
        this.shuffleButton.name = 'shuffle_button';
        this.shuffleButton.userData.defaultColor = new THREE.Color(0xffffff);
        this.shuffleButton.userData.selectedColor = new THREE.Color(0xcc0000);
        this.shuffleButton.userData.inactiveColor = new THREE.Color(0x666666);

        this.shuffleButton.position.x = -0.23;
        this.shuffleButton.position.y = -0.27;
        this.shuffleButton.position.z = 1.8;
        return this.shuffleButton;
    }

    _createEndButton(tex) {
        const geom = new THREE.PlaneBufferGeometry(0.16, 0.05);
        const mat = new THREE.MeshBasicMaterial({map: tex, transparent: true});
        this.endButton = new THREE.Mesh(geom, mat);
        this.endButton.name = 'end_button';
        this.endButton.userData.defaultColor = new THREE.Color(0xffffff);
        this.endButton.userData.selectedColor = new THREE.Color(0xcc0000);
        this.endButton.userData.inactiveColor = new THREE.Color(0x666666);

        this.endButton.position.x = 0.23;
        this.endButton.position.y = -0.27;
        this.endButton.position.z = 1.8;

        return this.endButton;
    }

}

export default Env;
