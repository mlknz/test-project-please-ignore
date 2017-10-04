import config from '../config.js';
import gamestate from '../gamestate.js';

import SceneManager from './sceneManager';
import Controls from '../controls';
import Env from './prefabs/env.js';
import Tracks from './prefabs/tracks.js';
import Towers from './prefabs/towers.js';
import Cards from './prefabs/cards.js';
import {generateCard} from './model/card.js';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let aspectRatio;

class AppViewer {
    constructor(renderer) {
        this.renderer = renderer;
        this.renderer.setClearColor(config.renderer.clearColor, config.renderer.clearAlpha);
        this.renderer.setPixelRatio(config.renderer.devicePixelRatio);

        this.sceneManager = new SceneManager();

        const gl = this.renderer.getContext();
        aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const w = config.camera.frustumSize * aspectRatio / 2;
        const h = config.camera.frustumSize / 2;
        this.camera = new THREE.OrthographicCamera(-w, w, h, -h, config.camera.near, config.camera.far);

        this.sceneReady = false;
        document.addEventListener('sceneReady', this.onSceneReady.bind(this));

        document.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    onSceneReady() {
        this.sceneReady = true;
        this.controls = new Controls(this.camera, this.renderer.domElement);
        this.controls.resetCameraOrbit();
        this.controls.setEnabled(false);

        gamestate.phasesSeq = [
            gamestate.phases.PLAYER_ATTACK,
            gamestate.phases.ENEMY_DEFENCE,
            gamestate.phases.APPLY,
            gamestate.phases.RESET,
            gamestate.phases.ENEMY_ATTACK,
            gamestate.phases.PLAYER_DEFENCE,
            gamestate.phases.APPLY,
            gamestate.phases.RESET
        ];
        gamestate.activePhaseIndex = 0;
        gamestate.activePhase = gamestate.phasesSeq[gamestate.activePhaseIndex];

        this.env = new Env(this.sceneManager.assetsLoader.assets);
        this.sceneManager.scene.add(this.env.mesh);

        this.tracks = new Tracks(this.sceneManager.assetsLoader.assets);
        this.sceneManager.scene.add(this.tracks.mesh);

        this.towers = new Towers(this.sceneManager.assetsLoader.assets);
        this.sceneManager.scene.add(this.towers);

        this.cards = new Cards(this.sceneManager.assetsLoader.assets);
        this.sceneManager.scene.add(this.cards.mesh);
        this._giveCardsToPlayer(true);
        this._giveCardsToPlayer(false);
    }

    update(dt) {
        if (!this.sceneReady) return;

        config.time += dt;

        this.controls.update(dt);
        raycaster.setFromCamera(mouse, this.camera);
        if (this._playerActive() && gamestate.activeCard) {
            gamestate.activeCard.position.x = mouse.x * aspectRatio * 0.5;
            gamestate.activeCard.position.y = mouse.y * 0.5;

            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.tracks.mesh.children);
            const obj = intersects[0] ? intersects[0].object : null; // todo: highlight cards on hover
            if (obj) {
                if (gamestate.activeTrack) {
                    if (gamestate.activeTrack.uuid !== obj.uuid) {
                        gamestate.activeTrack.material.color = gamestate.activeTrack.userData.defaultColor;
                        gamestate.activeTrack = obj;
                        gamestate.activeTrack.material.color = gamestate.activeTrack.userData.selectedColor;
                    }
                } else {
                    gamestate.activeTrack = obj;
                    gamestate.activeTrack.material.color = gamestate.activeTrack.userData.selectedColor;
                }
            } else {
                if (gamestate.activeTrack) {
                    gamestate.activeTrack.material.color = gamestate.activeTrack.userData.defaultColor;
                    gamestate.activeTrack = null;
                }
            }
        }

        if (this._playerActive()) {
            const intersects = raycaster.intersectObjects(this.env.mesh.children);
            const obj = intersects[0] ? intersects[0].object : null;
            if (!obj || obj.name !== 'shuffle_button') {
                this.env.shuffleButton.material.color = this.env.shuffleButton.userData.defaultColor;
            } else {
                this.env.shuffleButton.material.color = this.env.shuffleButton.userData.selectedColor;
            }
        }

        this.renderer.render(this.sceneManager.scene, this.camera);
    }

    nextPhase() {

    }

    _playerActive() {
        return gamestate.activePhase === gamestate.phases.PLAYER_ATTACK || gamestate.activePhase === gamestate.phases.PLAYER_DEFENCE;
    }

    _giveCardsToPlayer(isFriendly) {
        const hand = isFriendly ? gamestate.playerHand : gamestate.enemyHand;
        for (let i = 0; i < 4; ++i) {
            if (!hand[i]) this._giveCardToPlayer(isFriendly, i);
        }
    }
    _giveCardToPlayer(isFriendly, index) {
        const hand = isFriendly ? gamestate.playerHand : gamestate.enemyHand;
        hand[index] = generateCard();
        if (isFriendly) this.cards.updatePlayerCard(index, hand[index]);
    }

    _shuffleRemainingCards() { // todo: once per turn
        const hand = gamestate.playerHand;
        for (let i = 0; i < 4; ++i) {
            if (hand[i]) this._giveCardToPlayer(true, i);
        }
    }

    playCard(isFriendly, cardIndex, trackIndex) {
        if (isFriendly) this.cards.hideCard(cardIndex);
        const hand = isFriendly ? gamestate.playerHand : gamestate.enemyHand;
        this.tracks.spawnUnitOnTrack(isFriendly, trackIndex, hand[cardIndex]);
        // todo: tower dmg
        hand[cardIndex] = null;
    }

    onMouseDown() {
        gamestate.isMouseDown = true;
        let intersects = raycaster.intersectObjects(this.cards.mesh.children);
        gamestate.activeCard = intersects[0] && intersects[0].object.userData.friendly ? intersects[0].object : null;

        intersects = raycaster.intersectObjects(this.env.mesh.children);
        if (intersects[0] && intersects[0].object.name === 'shuffle_button') this._shuffleRemainingCards();
    }

    onMouseUp() {
        gamestate.isMouseDown = false;
        if (gamestate.activeCard) {
            gamestate.activeCard.position.x = gamestate.activeCard.userData.initPosX;
            gamestate.activeCard.position.y = gamestate.activeCard.userData.initPosY;
        }
        if (gamestate.activeTrack) {
            gamestate.activeTrack.material.color = gamestate.activeTrack.userData.defaultColor;
        }

        if (gamestate.activeCard && gamestate.activeTrack && !this.tracks.hasUnitOnTrack(true, gamestate.activeTrack.userData.index)) {
            this.playCard(true, gamestate.activeCard.userData.index, gamestate.activeTrack.userData.index);
        }
        gamestate.activeCard = undefined;
    }

    onMouseMove(e) {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
    }

    resize(width, height) {
        aspectRatio = width / height;

        if (this.camera.aspect !== aspectRatio) {
            this.camera.left = -config.camera.frustumSize * aspectRatio / 2;
            this.camera.right = config.camera.frustumSize * aspectRatio / 2;
            this.camera.top = config.camera.frustumSize / 2;
            this.camera.bottom = -config.camera.frustumSize / 2;
            this.camera.updateProjectionMatrix();
        }
    }

    dispose() {
        this.controls.dispose();
        // this.clearScene();
    }

}

export default AppViewer;
