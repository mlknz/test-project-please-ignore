import vertexShader from './shaders/animatedSprite.vert';
import fragmentShader from './shaders/animatedSprite.frag';

const redColor = new THREE.Vector3(0.8, 0.2, 0.2);
const blueColor = new THREE.Vector3(0.2, 0.2, 0.8);
const greyColor = new THREE.Vector3(0.9, 0.9, 0.9);

class NumberVisual {
    constructor(assets) {
        this._assets = assets;

        this.mesh = new THREE.Object3D();
        this.mesh.position.z = 0.3;
    }

    setSize(size) {
        this.mesh.scale.x = size;
        this.mesh.scale.y = size;
        return this;
    }

    setValue(val) {
        for (let i = this.mesh.children.length - 1; i >= 0; --i) {
            this.mesh.remove(this.mesh.children[i]);
        }

        const color = val > 0 ? redColor : val === 0 ? greyColor : blueColor;
        const absVal = Math.abs(val);
        const isSingleDigit = absVal < 10;

        if (isSingleDigit) {
            const number = this._createVisual(absVal, color);
            this.mesh.add(number);
        } else {
            const tens = Math.floor(absVal / 10);
            const units = absVal - tens * 10;

            const n1 = this._createVisual(tens, color);
            n1.position.x = -0.3;
            this.mesh.add(n1);
            const n2 = this._createVisual(units, color);
            n2.position.x = 0.3;
            this.mesh.add(n2);
        }

        return this;
    }

    _createVisual(absVal, color) {
        const geom = new THREE.PlaneBufferGeometry(1, 1);
        const uniforms = {
            scaleX: {value: 5},
            scaleY: {value: 2},
            quadNumber: {value: absVal},
            color: {value: color},
            map: {value: this._assets.textures.numbersTex}
        };
        const mat = new THREE.RawShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms,
            transparent: true
        });
        const mesh = new THREE.Mesh(geom, mat);
        return mesh;
    }
}

export default NumberVisual;
