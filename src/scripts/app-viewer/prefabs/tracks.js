// import config from '../../config.js';

const f = 0.02;
const g = 0.04;
const h = 0.06;

const p = [
    [[0, 0]],
    [[-f, 0], [f, 0]],
    [[-f, -f], [f, -f], [0, f]],
    [[-f, -f], [f, -f], [-f, f], [f, f]],
    [[-g, -f], [0, -f], [g, -f], [-f, f], [f, f]],
    [[-g, -f], [0, -f], [g, -f], [-g, f], [0, f], [g, f]],
    [[-g, -g], [0, -g], [g, -g], [-g, 0], [0, 0], [g, 0], [0, g]],
    [[-g, -g], [0, -g], [g, -g], [-g, 0], [0, 0], [g, 0], [-f, g], [f, g]],
    [[-g, -g], [0, -g], [g, -g], [-g, 0], [0, 0], [g, 0], [-g, g], [0, g], [g, g]],
    [[-h, -g], [-f, -g], [f, -g], [h, -g], [-h, 0], [-f, 0], [f, 0], [h, 0], [-f, g], [f, g]]
];

class Tracks {
    constructor(assets) {
        this.mesh = new THREE.Object3D();
        this.mesh.name = 'tracks_root';
        for (let i = 0; i < 3; ++i) {
            const track = this._createTrack(assets.textures.trackTex);
            track.position.x = i * 0.19 - 0.19;
            track.position.y = 0.1;
            track.userData.index = i;
            this.mesh.add(track);
        }

        this._assets = assets;
    }

    _createTrack(tex) {
        const geom = new THREE.PlaneBufferGeometry(0.175, 0.5);
        const mat = new THREE.MeshBasicMaterial({map: tex});

        const mesh = new THREE.Mesh(geom, mat);
        mesh.userData.defaultColor = new THREE.Color(0xffffff);
        mesh.userData.selectedColor = new THREE.Color(0xcc5555);
        mesh.position.z = 0.1;
        return mesh;
    }

    clearTracks() {
        this.mesh.children.forEach(track => {
            for (let i = track.children.length - 1; i >= 0; --i) {
                track.remove(track.children[i]);
            }
        });
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
        const damageSign = cardInfo.color === 'red' ? 1 : -1; // todo: remove color field
        unit.userData.damage = cardInfo.damage * damageSign;

        unit.position.y = unit.userData.friendly ? -0.07 : 0.07;
        track.add(unit);
    }

    hasUnitOnTrack(isFriendly, trackIndex) {
        return this.getUnitOnTrack(isFriendly, trackIndex) ? true : false;
    }

    getUnitOnTrack(isFriendly, trackIndex) {
        const track = this.mesh.children[trackIndex];
        for (let i = 0; i < track.children.length; ++i) {
            if (track.children[i].userData.friendly === isFriendly) return track.children[i];
        }
        return null;
    }

    _spawnResolvedUnit(isFriendly, trackIndex, damage) {
        const color = damage > 0 ? 'red' : 'blue';
        const unit = this._createUnit(Math.abs(damage), color);
        unit.userData.friendly = isFriendly;
        unit.position.y = unit.userData.friendly ? 0.09 : -0.09;
        this.mesh.children[trackIndex].add(unit);
    }

    applyDamageOnTrack(trackIndex) {
        const friendly = this.getUnitOnTrack(true, trackIndex);
        const enemy = this.getUnitOnTrack(false, trackIndex);

        const playerDamage = friendly ? friendly.userData.damage : 0;
        const enemyDamage = enemy ? enemy.userData.damage : 0;

        if (friendly) friendly.parent.remove(friendly);
        if (enemy) enemy.parent.remove(enemy);

        let result = null;
        const diff = Math.abs(playerDamage) - Math.abs(enemyDamage);
        if (diff !== 0) {
            if (diff > 0) {
                const damage = diff * Math.sign(playerDamage);
                this._spawnResolvedUnit(true, trackIndex, damage);
                result = {
                    playerWon: true,
                    damage
                };
            } else {
                const damage = -diff * Math.sign(enemyDamage);
                this._spawnResolvedUnit(false, trackIndex, damage);
                result = {
                    playerWon: false,
                    damage
                };
            }
        }
        return result;
    }

}

export default Tracks;
