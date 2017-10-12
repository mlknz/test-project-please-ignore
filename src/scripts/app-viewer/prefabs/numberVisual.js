import vertexShader from './shaders/animatedSprite.vert';
import fragmentShader from './shaders/animatedSprite.frag';

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

        const isPositive = val > 0;
        const absVal = Math.abs(val);
        const isSingleDigit = absVal < 10;

        if (isSingleDigit) {
            const number = this._createVisual(absVal, isPositive);
            this.mesh.add(number);
        } else {
            const tens = Math.floor(absVal / 10);
            const units = absVal - tens * 10;

            const n1 = this._createVisual(tens, isPositive);
            n1.position.x = -0.5;
            this.mesh.add(n1);
            const n2 = this._createVisual(units, isPositive);
            n2.position.x = 0.5;
            this.mesh.add(n2);
        }

        return this;
    }

    _createVisual(absVal, isPositive) {
        const geom = new THREE.PlaneBufferGeometry(1, 1);
        const uniforms = {
            scaleX: {value: 5},
            scaleY: {value: 2},
            quadNumber: {value: absVal},
            isPositive: {value: isPositive ? 1 : 0},
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
