import config from '../config.js';
import gamestate from '../gamestate.js';

import SceneManager from './sceneManager';
import Env from './prefabs/env.js';
import Tracks from './prefabs/tracks.js';
import Towers from './prefabs/towers.js';
import Cards from './prefabs/cards.js';
import BotLogic from './botLogic.js';
import {generateCard} from './model/card.js';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let aspectRatio;
let fitScreenMultHack = 1;

const clampT = (v) => {
    return Math.min(config.game.maxT, Math.max(-config.game.maxT, v));
};

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
        this.camera.position.fromArray(config.camera.pos);
        this.camera.lookAt((new THREE.Vector3()).fromArray(config.camera.target));
        this.camera.near = config.camera.near;
        this.camera.far = config.camera.far;
        this.camera.updateProjectionMatrix();

        this.sceneReady = false;
        document.addEventListener('sceneReady', this.onSceneReady.bind(this));

        if (config.isMobile) {
            document.addEventListener('touchstart', this.onMouseDownTouchStart.bind(this));
            document.addEventListener('touchmove', this.onMouseMoveTouchMove.bind(this));
            document.addEventListener('touchend', this.onMouseUpTouchEnd.bind(this));
            document.addEventListener('touchcancel', this.onMouseUpTouchEnd.bind(this));
        } else {
            document.addEventListener('mousedown', this.onMouseDownTouchStart.bind(this));
            document.addEventListener('mouseup', this.onMouseUpTouchEnd.bind(this));
            document.addEventListener('mousemove', this.onMouseMoveTouchMove.bind(this));
        }
    }

    onSceneReady() {
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
        gamestate.activePhaseIndex = 6;
        gamestate.activePhase = gamestate.phasesSeq[gamestate.activePhaseIndex];

        this.env = new Env(this.sceneManager.assetsLoader.assets);
        this.sceneManager.scene.add(this.env.mesh);

        this.tracks = new Tracks(this.sceneManager.assetsLoader.assets);
        this.sceneManager.scene.add(this.tracks.mesh);

        this.towers = new Towers(this.sceneManager.assetsLoader.assets);
        this.sceneManager.scene.add(this.towers.mesh);

        this.cards = new Cards(this.tracks, this.sceneManager.assetsLoader.assets);
        this.sceneManager.scene.add(this.cards.mesh);

        this.botLogic = new BotLogic(this);

        this.sceneReady = true;
        this.nextPhase();
    }

    update(dt) {
        if (!this.sceneReady) return;

        config.time += dt;
        this.towers.update();
        this.renderer.render(this.sceneManager.scene, this.camera);
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

    shuffleRemainingCards(isFriendly) {
        const hand = isFriendly ? gamestate.playerHand : gamestate.enemyHand;
        for (let i = 0; i < 4; ++i) {
            if (hand[i]) this._giveCardToPlayer(isFriendly, i);
        }
    }

    playCard(isFriendly, cardIndex, trackIndex) {
        if (isFriendly) this.cards.hideCard(cardIndex);
        const hand = isFriendly ? gamestate.playerHand : gamestate.enemyHand;
        this.tracks.spawnUnitOnTrack(isFriendly, trackIndex, hand[cardIndex]);
        const ind = isFriendly ? 0 : 1;
        gamestate.towersT[ind][trackIndex] = gamestate.towersT[ind][trackIndex] + hand[cardIndex].price;
        this.towers.setTowerTemperature(isFriendly, trackIndex, gamestate.towersT[ind][trackIndex]);
        this.updateTemperatures();
        hand[cardIndex] = null;
    }

    nextPhase() {
        gamestate.activePhaseIndex += 1;
        if (gamestate.activePhaseIndex === gamestate.phasesSeq.length) gamestate.activePhaseIndex = 0;

        gamestate.activePhase = gamestate.phasesSeq[gamestate.activePhaseIndex];

        if (gamestate.activePhase === gamestate.phases.ENEMY_ATTACK || gamestate.activePhase === gamestate.phases.ENEMY_DEFENCE) {
            this.botLogic.makeTurn(gamestate.activePhase === gamestate.phases.ENEMY_ATTACK);
        } else if (gamestate.activePhase === gamestate.phases.RESET) {
            this.tracks.clearTracks();
            this._giveCardsToPlayer(true);
            this._giveCardsToPlayer(false);
            // setTimeout(() => {this.nextPhase();}, 300);
            this.nextPhase();
        } else if (gamestate.activePhase === gamestate.phases.APPLY) {
            this._applyUnitsDamage(); // 0, 500, 1500
            setTimeout(() => {
                this._applyTowersBurn();
            }, 1700);
            setTimeout(() => {
                if (!this._checkWinLose()) this.nextPhase();
            }, 2000);
        } else if (this._playerActive()) {
            gamestate.usedShuffleThisTurn = false;
            this.env.endButton.material.color = this.env.endButton.userData.defaultColor;
            this.env.shuffleButton.material.color = this.env.endButton.userData.defaultColor;
        }
    }

    _applyUnitsDamage() {
        for (let i = 0; i < 3; ++i) {
            setTimeout(() => { this._applyUnitsDamageOnTrack(i); }, i * 500);
        }
    }
    _applyUnitsDamageOnTrack(trackIndex) {
        const result = this.tracks.applyDamageOnTrack(trackIndex);
        if (!result) return;
        const ind = result.playerWon ? 1 : 0;
        gamestate.towersT[ind][trackIndex] = gamestate.towersT[ind][trackIndex] + result.damage;
        this.towers.setTowerTemperature(!result.playerWon, trackIndex, gamestate.towersT[ind][trackIndex]);
        this.towers.showFadingDamage(!result.playerWon, trackIndex, result.damage);
        this.updateTemperatures();
    }
    _applyTowersBurn() {
        for (let i = 0; i < 3; ++i) {
            const p = Math.abs(gamestate.towersT[0][i]);
            const e = Math.abs(gamestate.towersT[1][i]);
            let pBurn = 0;
            let eBurn = 0;
            for (let j = 0; j < config.game.burn.length; ++j) {
                if (p > config.game.burn[j].t) pBurn = config.game.burn[j].damage * Math.sign(gamestate.towersT[0][i]);
                if (e > config.game.burn[j].t) eBurn = config.game.burn[j].damage * Math.sign(gamestate.towersT[1][i]);
            }
            if (pBurn !== 0) this.towers.showFadingDamage(true, i, pBurn);
            if (eBurn !== 0) this.towers.showFadingDamage(false, i, eBurn);

            gamestate.playerAdditiveT += pBurn;
            gamestate.enemyAdditiveT += eBurn;
            this.updateTemperatures();
        }
    }

    _createGameOverScreen(text) { // todo: use css
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.backgroundColor = 'white';
        div.style.opacity = 0.8;
        div.style.left = 0;
        div.style.right = 0;
        div.style.top = 0;
        div.style.bottom = 0;
        div.style.fontSize = '140px';
        div.style.textAlign = 'center';
        const textNode = document.createTextNode(text);
        div.appendChild(textNode);
        document.body.appendChild(div);
    }

    _checkWinLose() {
        const isWin = Math.abs(gamestate.enemyT) >= config.game.maxT;
        const isLose = Math.abs(gamestate.playerT) >= config.game.maxT;

        if (isWin) {
            this._createGameOverScreen('WIN!');
            return true;
        } else if (isLose) {
            this._createGameOverScreen('LOSE!');
            return true;
        }
        return false;
    }

    updateTemperatures() {
        const t = gamestate.towersT;
        gamestate.playerT = clampT((t[0][0] + t[0][1] + t[0][2]) / 3 + gamestate.playerAdditiveT);
        gamestate.enemyT = clampT((t[1][0] + t[1][1] + t[1][2]) / 3 + gamestate.enemyAdditiveT);

        this.towers.updatePlayerTemperatures();
    }

    onMouseDownTouchStart(e) {
        e.preventDefault();
        let x = e.clientX;
        let y = e.clientY;
        if (e.changedTouches && e.changedTouches[0]) {
            x = e.changedTouches[0].clientX;
            y = e.changedTouches[0].clientY;
        }
        mouse.x = (x / window.innerWidth) * 2 - 1;
        mouse.y = - (y / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, this.camera);
        gamestate.isMouseDown = true;
        let intersects = raycaster.intersectObjects(this.cards.mesh.children);
        gamestate.activeCard = intersects[0] ? intersects[0].object : null;

        intersects = raycaster.intersectObjects(this.env.mesh.children);
        if (intersects[0] && this._playerActive()) {
            if (intersects[0].object.name === 'shuffle_button' && !gamestate.usedShuffleThisTurn) {
                gamestate.usedShuffleThisTurn = true;
                this.env.shuffleButton.material.color = this.env.endButton.userData.inactiveColor;
                this.shuffleRemainingCards(true);
            } else if (intersects[0].object.name === 'end_button') {
                this.env.endButton.material.color = this.env.endButton.userData.inactiveColor;
                this.env.shuffleButton.material.color = this.env.endButton.userData.inactiveColor;
                this.nextPhase();
            }
        }
    }

    onMouseUpTouchEnd(e) {
        e.preventDefault();
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

    onMouseMoveTouchMove(e) {
        e.preventDefault();
        let x = e.clientX;
        let y = e.clientY;
        if (e.changedTouches && e.changedTouches[0]) {
            x = e.changedTouches[0].clientX;
            y = e.changedTouches[0].clientY;
        }
        mouse.x = (x / window.innerWidth) * 2 - 1;
        mouse.y = - (y / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, this.camera);
        if (this._playerActive()) this._updatePlayerControls();
    }

    _updatePlayerControls() {
        this._processCardMovementIfNeeded();

        const intersects = raycaster.intersectObjects(this.env.mesh.children);
        const obj = intersects[0] ? intersects[0].object : null;
        if (!gamestate.usedShuffleThisTurn) {
            if (!obj || obj.name !== 'shuffle_button') {
                this.env.shuffleButton.material.color = this.env.shuffleButton.userData.defaultColor;
            } else {
                this.env.shuffleButton.material.color = this.env.shuffleButton.userData.selectedColor;
            }
        }
        if (!obj || obj.name !== 'end_button') {
            this.env.endButton.material.color = this.env.endButton.userData.defaultColor;
        } else {
            this.env.endButton.material.color = this.env.endButton.userData.selectedColor;
        }
    }

    _processCardMovementIfNeeded() {
        if (!gamestate.activeCard) return;
        gamestate.activeCard.position.x = mouse.x * fitScreenMultHack * aspectRatio * 0.5;
        gamestate.activeCard.position.y = mouse.y * fitScreenMultHack * 0.5;

        const intersects = raycaster.intersectObjects(this.tracks.mesh.children);
        const obj = intersects[0] ? intersects[0].object : null;
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

    resize(width, height) {
        aspectRatio = width / height;

        if (aspectRatio < 0.563) {
            fitScreenMultHack = 0.563 / aspectRatio;
        }
        if (this.camera.aspect !== aspectRatio) {
            this.camera.left = - fitScreenMultHack * config.camera.frustumSize * aspectRatio / 2;
            this.camera.right = fitScreenMultHack * config.camera.frustumSize * aspectRatio / 2;
            this.camera.top = fitScreenMultHack * config.camera.frustumSize / 2;
            this.camera.bottom = -fitScreenMultHack * config.camera.frustumSize / 2;
            this.camera.updateProjectionMatrix();
        }
    }

    dispose() {}
}

export default AppViewer;
