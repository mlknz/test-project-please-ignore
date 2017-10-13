// import config from '../../config.js';
import NumberVisual from './numberVisual.js';


const p = [
    [-0.21, -0.395],
    [-0.21 + 0.14, -0.395],
    [-0.21 + 0.28, -0.395],
    [-0.21 + 0.42, -0.395]
];

class Cards {
    constructor(tracks, assets) {
        this.mesh = new THREE.Object3D();
        this.mesh.name = 'cards_root';
        for (let i = 0; i < p.length; ++i) { // friendly
            const card = this._createCard(assets.textures.cardBackTex);
            card.position.x = p[i][0];
            card.position.y = p[i][1];

            card.userData.friendly = true;
            card.userData.index = i;
            card.userData.initPosX = card.position.x;
            card.userData.initPosY = card.position.y;
            card.position.z = 2;
            this.mesh.add(card);
        }

        this._tracks = tracks;
        this._assets = assets;
    }

    _createCard(tex) {
        const geom = new THREE.PlaneBufferGeometry(0.124, 0.17);
        const mat = new THREE.MeshBasicMaterial({map: tex, transparent: true});

        const mesh = new THREE.Mesh(geom, mat);
        return mesh;
    }

    _createIcon(tex) {
        const geom = new THREE.PlaneBufferGeometry(0.02, 0.02);
        const mat = new THREE.MeshBasicMaterial({map: tex, transparent: true});

        const mesh = new THREE.Mesh(geom, mat);
        return mesh;
    }

    updatePlayerCard(index, cardInfo) {
        this.mesh.children.forEach(cardMesh => {
            if (cardMesh.userData.index === index) {
                for (let i = cardMesh.children.length - 1; i >= 0; --i) {
                    cardMesh.remove(cardMesh.children[i]);
                }
                // const soldiers = this._tracks.createUnit(cardInfo.damage, cardInfo.color);
                // soldiers.scale.x *= 0.7;
                // soldiers.scale.y *= 0.7;
                // soldiers.position.y = 0.02;
                // cardMesh.add(soldiers);

                // const attackIcon = this._createIcon(this._assets.textures.iconAttackTex);
                // attackIcon.position.x = -0.04;
                // attackIcon.position.y = -0.058;
                // cardMesh.add(attackIcon);

                const sign = cardInfo.color === 'red' ? 1 : -1;
                const attackValue = (new NumberVisual(this._assets)).setSize(0.07).setValue(cardInfo.damage * sign);
                attackValue.mesh.position.y = 0.015;
                cardMesh.add(attackValue.mesh);

                const colorIcon = this._createIcon(cardInfo.color === 'red' ? this._assets.textures.iconRedTex : this._assets.textures.iconBlueTex);
                colorIcon.position.x = -0.016;
                colorIcon.position.y = -0.058;
                cardMesh.add(colorIcon);

                const costValue = (new NumberVisual(this._assets)).setSize(0.023).setValue(cardInfo.price);
                costValue.mesh.position.x = 0.014;
                costValue.mesh.position.y = -0.058;
                cardMesh.add(costValue.mesh);

                cardMesh.visible = true;
            }
        });
    }

    hideCard(index) {
        this.mesh.children.forEach(cardMesh => {
            if (cardMesh.userData.index === index) {
                cardMesh.visible = false;
            }
        });
    }

}

export default Cards;
