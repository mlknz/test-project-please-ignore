import gamestate from '../../gamestate.js';
import config from '../../config.js';
import NumberVisual from './numberVisual.js';

const p = [
    [-0.19, -0.13],
    [0.0, -0.13],
    [0.19, -0.13]
];

const e = [
    [-0.19, 0.37],
    [0.0, 0.37],
    [0.19, 0.37]
];

const termometerWidth = 0.26;
const termometerHeight = 0.014;

class Towers {
    constructor(assets) {
        this._assets = assets;
        this.mesh = new THREE.Object3D();
        this.mesh.name = 'towers_root';

        this._friendlyTowersT = [];
        this._enemyTowersT = [];

        for (let i = 0; i < p.length; ++i) { // friendly
            const tower = this._createTower(assets.textures.towerFriendlyTex);
            tower.position.x = p[i][0];
            tower.position.y = p[i][1];
            this.mesh.add(tower);

            this._friendlyTowersT[i] = (new NumberVisual(this._assets)).setSize(0.1).setValue(0);
            tower.add(this._friendlyTowersT[i].mesh);
        }

        for (let i = 0; i < e.length; ++i) { // enemy
            const tower = this._createTower(assets.textures.towerEnemyTex);
            tower.position.x = e[i][0];
            tower.position.y = e[i][1];
            this.mesh.add(tower);

            this._enemyTowersT[i] = (new NumberVisual(this._assets)).setSize(0.1).setValue(0);
            tower.add(this._enemyTowersT[i].mesh);
        }

        const friendlyCastle = this._createCastle(assets.textures.castleFriendlyTex);
        friendlyCastle.position.y = -0.174;
        this.mesh.add(friendlyCastle);

        const enemyCastle = this._createCastle(assets.textures.castleEnemyTex);
        enemyCastle.position.y = 0.32;
        this.mesh.add(enemyCastle);

        const friendlyTermometer = this._createTermometer(assets.textures.castleProgressTex, termometerWidth, termometerHeight);
        friendlyTermometer.position.y = -0.26;
        this.mesh.add(friendlyTermometer);
        this._friendlyT = this._createTermometerHandler();
        this._friendlyT.position.y = -0.26;
        this.mesh.add(this._friendlyT);

        const enemyTermometer = this._createTermometer(assets.textures.castleProgressTex, termometerWidth, termometerHeight);
        enemyTermometer.position.y = 0.47;
        this.mesh.add(enemyTermometer);
        this._enemyT = this._createTermometerHandler();
        this._enemyT.position.y = 0.47;
        this.mesh.add(this._enemyT);
    }

    setTowerTemperature(isFriendly, index, value) {
        const numberVisual = isFriendly ? this._friendlyTowersT[index] : this._enemyTowersT[index];
        numberVisual.setValue(value);
    }

    updatePlayerTemperatures() {
        this._friendlyT.position.x = (gamestate.playerT / config.game.maxT) * termometerWidth / 2;
        this._enemyT.position.x = (gamestate.enemyT / config.game.maxT) * termometerWidth / 2;
    }

    _createTower(tex) {
        const mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(0.16, 0.16),
            new THREE.MeshBasicMaterial({map: tex, transparent: true})
        );
        mesh.position.z = 1;

        return mesh;
    }

    _createTermometer(tex, width, height) {
        const mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(width, height),
            new THREE.MeshBasicMaterial({map: tex, transparent: true})
        );
        mesh.position.z = 0.2;

        return mesh;
    }

    _createTermometerHandler() {
        const mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(0.024, 0.024),
            new THREE.MeshBasicMaterial({map: this._assets.textures.castleProgressHandlerTex, transparent: true})
        );
        mesh.position.z = 0.3;

        return mesh;
    }

    _createCastle(tex) {
        const mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(0.62, 0.1),
            new THREE.MeshBasicMaterial({map: tex, transparent: true})
        );
        mesh.position.z = 1.1;

        return mesh;
    }
}

export default Towers;
