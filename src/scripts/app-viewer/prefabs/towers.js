import gamestate from '../../gamestate.js';
import config from '../../config.js';
import NumberVisual from './numberVisual.js';

import vertexShader from './shaders/animatedSprite.vert';
import fragmentShader from './shaders/animatedSprite.frag';

const p = [
    [-0.188, -0.12],
    [0.0, -0.12],
    [0.188, -0.12]
];

const e = [
    [-0.188, 0.35],
    [0.0, 0.35],
    [0.188, 0.35]
];

const termometerWidth = 0.32;
const termometerHeight = 0.032;
const redFrameDuration = 0.1;
const blueFrameDuration = 0.2;

class Towers {
    constructor(assets) {
        this._assets = assets;
        assets.textures.towerTex.minFilter = THREE.NearestFilter;
        assets.textures.towerTex.magFilter = THREE.NearestFilter;
        assets.textures.towerRedTex.minFilter = THREE.NearestFilter;
        assets.textures.towerRedTex.magFilter = THREE.NearestFilter;
        assets.textures.towerBlueTex.minFilter = THREE.NearestFilter;
        assets.textures.towerBlueTex.magFilter = THREE.NearestFilter;

        this.mesh = new THREE.Object3D();
        this.mesh.name = 'towers_root';

        this._friendlyTemperatures = [];
        this._enemyTemperatures = [];
        this._friendlyTowers = [];
        this._enemyTowers = [];
        this._fadingDamageArr = [];

        for (let i = 0; i < p.length; ++i) { // friendly
            const tower = this._createTower();
            tower.position.x = p[i][0];
            tower.position.y = p[i][1];
            this.mesh.add(tower);
            this._friendlyTowers.push(tower);

            this._friendlyTemperatures[i] = (new NumberVisual(this._assets)).setSize(0.05).setValue(0);
            this._friendlyTemperatures[i].mesh.position.x = -0.002;
            this._friendlyTemperatures[i].mesh.position.y = -0.044;
            tower.add(this._friendlyTemperatures[i].mesh);
        }

        for (let i = 0; i < e.length; ++i) { // enemy
            const tower = this._createTower();
            tower.position.x = e[i][0];
            tower.position.y = e[i][1];
            this.mesh.add(tower);
            this._enemyTowers.push(tower);

            this._enemyTemperatures[i] = (new NumberVisual(this._assets)).setSize(0.05).setValue(0);
            this._enemyTemperatures[i].mesh.position.x = -0.002;
            this._enemyTemperatures[i].mesh.position.y = -0.044;
            tower.add(this._enemyTemperatures[i].mesh);
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
        const towersT = isFriendly ? this._friendlyTemperatures : this._enemyTemperatures;
        towersT[index].setValue(value);

        const towers = isFriendly ? this._friendlyTowers : this._enemyTowers;
        const tower = towers[index];
        let burnStage = 0;
        for (let i = 0; i < config.game.burn.length; ++i) {
            if (Math.abs(value) > config.game.burn[i].t) {
                burnStage = i + 1;
            }
        }
        burnStage *= Math.sign(value);
        if (burnStage === tower.userData.lastBurnStage) {
            return;
        }
        this._setTowerBurnStage(tower, burnStage);
    }

    _setTowerBurnStage(tower, burnStage) {
        if (burnStage === 0) {
            tower.material.uniforms.map.value = this._assets.textures.towerTex;
            tower.material.uniforms.scaleX.value = 1;
            tower.material.uniforms.scaleY.value = 1;
            tower.material.uniforms.quadNumber.value = 0;
        } else {
            tower.material.uniforms.map.value = burnStage > 0 ? this._assets.textures.towerRedTex : this._assets.textures.towerBlueTex;
            tower.material.uniforms.scaleX.value = 3;
            tower.material.uniforms.scaleY.value = 3;
            tower.userData.startQuadNumber = (Math.abs(burnStage) - 1) * 3;
            tower.userData.quadOffset = 0;
            tower.userData.lastAnimUpdateTime = config.time;
            tower.material.uniforms.quadNumber.value = tower.userData.startQuadNumber + tower.userData.quadOffset;
        }
        tower.userData.lastBurnStage = burnStage;
    }

    updatePlayerTemperatures() {
        this._friendlyT.position.x = (gamestate.playerT / config.game.maxT) * termometerWidth / 2;
        this._enemyT.position.x = (gamestate.enemyT / config.game.maxT) * termometerWidth / 2;
    }

    showFadingDamage(isFriendly, trackIndex, value) {
        const fading = (new NumberVisual(this._assets)).setSize(0.03).setUseBrightColor(true).setValue(value);
        const towers = isFriendly ? this._friendlyTemperatures : this._enemyTemperatures;
        fading.mesh.userData.startTime = config.time;
        fading.mesh.userData.endTime = config.time + config.fadeDuration;
        fading.mesh.userData.startY = 0.004;
        fading.mesh.userData.endY = 0.06;
        fading.mesh.position.x = 0.072;
        fading.mesh.position.y = fading.mesh.userData.startY;

        towers[trackIndex].mesh.parent.add(fading.mesh);
        this._fadingDamageArr.push(fading);
    }

    update() {
        for (let i = this._fadingDamageArr.length - 1; i >= 0; --i) {
            const f = this._fadingDamageArr[i];
            if (config.time > f.mesh.userData.endTime) {
                f.mesh.parent.remove(f.mesh);
                this._fadingDamageArr.splice(i, 1);
            } else {
                const t = (config.time - f.mesh.userData.startTime) / (f.mesh.userData.endTime - f.mesh.userData.startTime);
                f.setOpacity(1 - t * t * t);
                f.mesh.position.y = f.mesh.userData.startY + t * (f.mesh.userData.endY - f.mesh.userData.startY);
            }
        }
        for (let i = 0; i < 3; ++i) {
            this._updateBurnAnim(this._friendlyTowers[i]);
            this._updateBurnAnim(this._enemyTowers[i]);
        }
    }

    _updateBurnAnim(tower) {
        if (tower.userData.lastBurnStage === 0) {
            return;
        }
        const duration = tower.userData.lastBurnStage > 0 ? redFrameDuration : blueFrameDuration;
        if (config.time - tower.userData.lastAnimUpdateTime < duration) {
            return;
        }

        tower.userData.quadOffset += 1;
        if (tower.userData.quadOffset > 2) tower.userData.quadOffset = 0;
        tower.material.uniforms.quadNumber.value = tower.userData.startQuadNumber + tower.userData.quadOffset;
        tower.userData.lastAnimUpdateTime = config.time;
    }

    _createTower() {
        const uniforms = {
            scaleX: {value: 1},
            scaleY: {value: 1},
            quadNumber: {value: 0},
            color: {value: new THREE.Vector3(1, 1, 1)},
            opacity: {value: 1},
            map: {value: this._assets.textures.towerTex}
        };
        const mat = new THREE.RawShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms,
            transparent: true
        });
        const mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(0.188, 0.188),
            mat
        );
        mesh.position.z = 1;
        mesh.userData.lastBurnStage = 0;

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
