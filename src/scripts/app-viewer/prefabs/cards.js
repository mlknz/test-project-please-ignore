// import config from '../../config.js';

const p = [
    [-0.225, -0.375],
    [-0.225 + 0.15, -0.375],
    [-0.225 + 0.3, -0.375],
    [-0.225 + 0.45, -0.375]
];

const e = [
    [-0.225, 0.375],
    [-0.225 + 0.15, 0.375],
    [-0.225 + 0.3, 0.375],
    [-0.225 + 0.45, 0.375]
];

class Cards {
    constructor(assets) {
        const root = new THREE.Object3D();
        root.name = 'cards_root';
        for (let i = 0; i < p.length; ++i) { // friendly
            const card = this._createCard(assets.textures.cardTex);
            card.position.x = p[i][0];
            card.position.y = p[i][1];

            card.userData.friendly = true;
            card.userData.initPosX = card.position.x;
            card.userData.initPosY = card.position.y;
            card.position.z = 2;
            root.add(card);
        }

        for (let i = 0; i < e.length; ++i) { // enemy
            const card = this._createCard(assets.textures.unknownCardTex);
            card.position.x = e[i][0];
            card.position.y = e[i][1];
            card.position.z = 1.5;
            root.add(card);
        }

        return root;
    }

    _createCard(tex) {
        const geom = new THREE.PlaneBufferGeometry(0.13, 0.2);
        const mat = new THREE.MeshBasicMaterial({map: tex, transparent: true});

        const mesh = new THREE.Mesh(geom, mat);
        return mesh;
    }

}

export default Cards;
