// import config from '../../config.js';

class Env {
    constructor(assets) {
        const root = new THREE.Object3D();
        root.name = 'env_root';
        root.add(this._createBack(assets.textures.backTex));

        return root;
    }

    _createBack(tex) {
        const geom = new THREE.PlaneBufferGeometry(0.6, 1);
        const mat = new THREE.MeshBasicMaterial({map: tex});

        const mesh = new THREE.Mesh(geom, mat);
        return mesh;
    }

}

export default Env;
