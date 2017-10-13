import gamestate from '../../gamestate.js';
import config from '../../config.js';
import NumberVisual from './numberVisual.js';

const p = [
    [-0.188, -0.12],
    [0.0, -0.12],
    [0.188, -0.12]
];

const e = [
    [-0.188, 0.37],
    [0.0, 0.37],
    [0.188, 0.37]
];

const termometerWidth = 0.32;
const termometerHeight = 0.032;

class Towers {
    constructor(assets) {
        this._assets = assets;
        assets.textures.towerTex.minFilter = THREE.NearestFilter;
        assets.textures.towerTex.magFilter = THREE.NearestFilter;

        this.mesh = new THREE.Object3D();
        this.mesh.name = 'towers_root';

        this._friendlyTowersT = [];
        this._enemyTowersT = [];
        this._fadingDamage = [];

        for (let i = 0; i < p.length; ++i) { // friendly
            const tower = this._createTower(assets.textures.towerTex);
            tower.position.x = p[i][0];
            tower.position.y = p[i][1];
            this.mesh.add(tower);

            this._friendlyTowersT[i] = (new NumberVisual(this._assets)).setSize(0.05).setValue(0);
            this._friendlyTowersT[i].mesh.position.x = -0.002;
            this._friendlyTowersT[i].mesh.position.y = -0.044;
            tower.add(this._friendlyTowersT[i].mesh);
        }

        for (let i = 0; i < e.length; ++i) { // enemy
            const tower = this._createTower(assets.textures.towerTex);
            tower.position.x = e[i][0];
            tower.position.y = e[i][1];
            this.mesh.add(tower);

            this._enemyTowersT[i] = (new NumberVisual(this._assets)).setSize(0.05).setValue(0);
            this._enemyTowersT[i].mesh.position.x = -0.002;
            this._enemyTowersT[i].mesh.position.y = -0.044;
            tower.add(this._enemyTowersT[i].mesh);
        }

        const friendlyTermometer = this._createTermometer(assets.textures.castleProgressTex, termometerWidth, termometerHeight);
        friendlyTermometer.position.y = -0.26;
        this.mesh.add(friendlyTermometer);
        this._friendlyT = this._createTermometerHandler();
        this._friendlyT.position.y = -0.245;
        this.mesh.add(this._friendlyT);

        const enemyTermometer = this._createTermometer(assets.textures.castleProgressTex, termometerWidth, termometerHeight);
        enemyTermometer.position.y = 0.45;
        this.mesh.add(enemyTermometer);
        this._enemyT = this._createTermometerHandler();
        this._enemyT.position.y = 0.465;
        this.mesh.add(this._enemyT);
    }

    setTowerTemperature(isFriendly, index, value) {
        const towers = isFriendly ? this._friendlyTowersT : this._enemyTowersT;
        towers[index].setValue(value);
    }

    updatePlayerTemperatures() {
        this._friendlyT.position.x = (gamestate.playerT / config.game.maxT) * termometerWidth / 2;
        this._enemyT.position.x = (gamestate.enemyT / config.game.maxT) * termometerWidth / 2;
    }

    showFadingDamage(isFriendly, trackIndex, value) {
        const fading = (new NumberVisual(this._assets)).setSize(0.15).setValue(value);
        const towers = isFriendly ? this._friendlyTowersT : this._enemyTowersT;
        // towers[trackIndex].mesh.parent.add(fading.mesh); // todo: fading damage
        this._fadingDamage.push(fading);
    }

    update() {

    }

    _createTower(tex) {
        const mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(0.188, 0.188),
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
            new THREE.PlaneBufferGeometry(0.04, 0.04),
            new THREE.MeshBasicMaterial({map: this._assets.textures.castleProgressHandlerTex, transparent: true})
        );
        mesh.position.z = 0.3;

        return mesh;
    }
}

export default Towers;
