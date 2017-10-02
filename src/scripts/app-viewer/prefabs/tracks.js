// import config from '../../config.js';

class Tracks {
    constructor() {
        const root = new THREE.Object3D();
        root.name = 'tracks_root';
        for (let i = 0; i < 4; ++i) {
            const track = this._createTrack();
            track.position.x = i * 0.15 - 0.225;
            root.add(track);
        }

        return root;
    }

    _createTrack() {
        const geom = new THREE.PlaneBufferGeometry(0.13, 0.5);
        const mat = new THREE.MeshBasicMaterial({color: 0x773355});

        const mesh = new THREE.Mesh(geom, mat);
        mesh.userData.defaultColor = new THREE.Color(0x773355);
        mesh.userData.selectedColor = new THREE.Color(0xcc5555);
        mesh.position.z = 0.1;
        return mesh;
    }

}

export default Tracks;
