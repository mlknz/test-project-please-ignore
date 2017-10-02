import config from '../config.js';

import StatsUi from './stats-ui.js';

const localParams = {altTex: false};

class AppUi {
    constructor(renderer) {
        this.statsUi = new StatsUi(renderer);

        const gui = new dat.GUI({width: 300}); // eslint-disable-line

        const grassFolder = gui.addFolder('Grass');
        grassFolder.add(config.grass.swayFrequency, 'value').min(0).max(10).step(0.05).name('Frequency');
        grassFolder.add(config.grass.swayAmplitude, 'value').min(0).max(2).step(0.05).name('Amplitude');
        grassFolder.add(config.grass.vertexSwayAmplitude, 'value').min(0).max(2).step(0.05).name('VertAmp');
        grassFolder.add(config.grass.vertexSwayAmplitudeNormal, 'value').min(0).max(2).step(0.05).name('VertAmp Normal');

        const waterFolder = gui.addFolder('Water');

        waterFolder.add(localParams, 'altTex').name('Another Texture').onChange(() => { this.changeWaterTex(); });
        waterFolder.add(config.water.opacity, 'value').min(0).max(1).step(0.05).name('Opacity');
        waterFolder.add(config.water.speed, 'value').min(0).max(15).step(0.05).name('Speed');
        waterFolder.add(config.water.scale, 'value').min(0).max(2).step(0.05).name('Scale');

        waterFolder.add(config.water.detail1, 'value').min(0).max(1).step(0.05).name('Detail1');
        waterFolder.add(config.water.detail2, 'value').min(0).max(1).step(0.05).name('Detail2');
        waterFolder.add(config.water.detail3, 'value').min(0).max(1).step(0.05).name('Detail3');

        gui.open();
        grassFolder.open();
        waterFolder.open();
    }

    changeWaterTex() {
        const ind = localParams.altTex ? 1 : 0;
        config.water.normalMap.value = config.water.normalMaps[ind];
    }

    update() {
        if (this.statsUi) this.statsUi.update();
    }
}

export default AppUi;
