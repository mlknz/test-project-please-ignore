// import config from '../../config.js';

const p = [
    [-0.21, -0.395],
    [-0.21 + 0.14, -0.395],
    [-0.21 + 0.28, -0.395],
    [-0.21 + 0.42, -0.395]
];

class Cards {
    constructor(assets) {
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

        this._assets = assets;
    }

    _createCard(tex) {
        const geom = new THREE.PlaneBufferGeometry(0.124, 0.17);
        const mat = new THREE.MeshBasicMaterial({map: tex, transparent: true});

        const mesh = new THREE.Mesh(geom, mat);
        return mesh;
    }

    _createContent(tex) {
        const geom = new THREE.PlaneBufferGeometry(0.1, 0.1);
        const mat = new THREE.MeshBasicMaterial({map: tex, transparent: true});

        const mesh = new THREE.Mesh(geom, mat);
        return mesh;
    }

    updatePlayerCard(index, info) {
        this.mesh.children.forEach(cardMesh => {
            if (cardMesh.userData.index === index) {
                for (let i = cardMesh.children.length - 1; i >= 0; --i) {
                    cardMesh.remove(cardMesh.children[i]);
                }
                const content = this._createContent(this._assets.textures[info.texName]);
                cardMesh.add(content);
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
