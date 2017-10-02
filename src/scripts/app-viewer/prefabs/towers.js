// import config from '../../config.js';

const p = [
    [-0.225, -0.2],
    [-0.225 + 0.15, -0.2],
    [-0.225 + 0.3, -0.2],
    [-0.225 + 0.45, -0.2]
];

const e = [
    [-0.225, 0.2],
    [-0.225 + 0.15, 0.2],
    [-0.225 + 0.3, 0.2],
    [-0.225 + 0.45, 0.2]
];

class Towers {
    constructor(assets) {
        const root = new THREE.Object3D();
        root.name = 'towers_root';

        for (let i = 0; i < p.length; ++i) { // friendly
            const tower = this._createTower(assets.textures.towerTex);
            tower.position.x = p[i][0];
            tower.position.y = p[i][1];
            root.add(tower);
        }

        for (let i = 0; i < e.length; ++i) { // enemy
            const tower = this._createTower(assets.textures.towerTex);
            tower.position.x = e[i][0];
            tower.position.y = e[i][1];
            root.add(tower);
        }

        return root;
    }

    _createTower(tex) {
        const geom = new THREE.PlaneBufferGeometry(0.1, 0.1);
        const mat = new THREE.MeshBasicMaterial({map: tex, transparent: true});

        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.z = 1;
        return mesh;
    }

}

export default Towers;
