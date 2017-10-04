// import config from '../../config.js';

const f = 0.02;
const g = 0.04;

const p = [
    [[0, 0]],
    [[-f, 0], [f, 0]],
    [[-f, -f], [f, -f], [0, f]],
    [[-f, -f], [f, -f], [-f, f], [f, f]],
    [[-g, -f], [0, -f], [g, -f], [-f, f], [f, f]],
    [[-g, -f], [0, -f], [g, -f], [-g, f], [0, f], [g, f]],
    [[-g, -g], [0, -g], [g, -g], [-g, 0], [0, 0], [g, 0], [0, g]],
    [[-g, -g], [0, -g], [g, -g], [-g, 0], [0, 0], [g, 0], [-f, g], [f, g]]
];

class Tracks {
    constructor(assets) {
        this.mesh = new THREE.Object3D();
        this.mesh.name = 'tracks_root';
        for (let i = 0; i < 3; ++i) {
            const track = this._createTrack();
            track.position.x = i * 0.15 - 0.15;
            track.userData.index = i;
            this.mesh.add(track);
        }

        this._assets = assets;
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

    _createUnitSoldier(color) {
        const texName = color === 'red' ? 'redUnitTex' : 'blueUnitTex';
        const tex = this._assets.textures[texName];
        const geom = new THREE.PlaneBufferGeometry(0.04, 0.04);
        const mat = new THREE.MeshBasicMaterial({map: tex, transparent: true});

        return new THREE.Mesh(geom, mat);
    }

    _createUnit(damage, color) {
        const unitRoot = new THREE.Object3D();
        for (let i = 0; i < damage; ++i) {
            const soldier = this._createUnitSoldier(color);
            soldier.position.x = p[damage - 1][i][0];
            soldier.position.y = p[damage - 1][i][1];
            unitRoot.add(soldier);
        }
        return unitRoot;
    }

    spawnUnitOnTrack(isFriendly, trackIndex, cardInfo) {
        const track = this.mesh.children[trackIndex];
        const unit = this._createUnit(cardInfo.damage, cardInfo.color);
        unit.userData.friendly = isFriendly;

        unit.position.y = unit.userData.friendly ? -0.07 : 0.07;
        track.add(unit);
    }

    hasUnitOnTrack(isFriendly, trackIndex) {
        const track = this.mesh.children[trackIndex];
        for (let i = 0; i < track.children.length; ++i) {
            if (track.children[i].userData.friendly === isFriendly) return true;
        }
        return false;
    }

}

export default Tracks;
