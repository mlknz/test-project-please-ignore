const device = require('device.js')();

const config = {
    isMobile: !device.desktop(),
    isDebug: window.location.hash.substr(1) === 'debug',
    useDDSTextures: true,
    usePVRTextures: true,

    time: 0,
    fadeDuration: 1.3,

    renderer: {
        clearColor: 0x141424,
        clearAlpha: true,
        devicePixelRatio: window.devicePixelRatio || 1
    },

    camera: {
        pos: [0, 0, 5],
        target: [0, 0, 0],
        frustumSize: 1,
        near: 0.5,
        far: 10
    },

    game: {
        maxT: 10,
        burn: [
            {'t': 5, 'damage': 2},
            {'t': 11, 'damage': 3},
            {'t': 17, 'damage': 5}
        ]
    }
};

export default config;
