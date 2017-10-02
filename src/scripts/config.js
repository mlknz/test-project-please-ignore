const device = require('device.js')();

const config = {
    isDesktop: device.desktop(),
    isDebug: window.location.hash.substr(1) === 'debug',
    useDDSTextures: true,
    usePVRTextures: true,

    time: 0,

    renderer: {
        clearColor: 0x141424,
        clearAlpha: true,
        devicePixelRatio: window.devicePixelRatio || 1
    },

    camera: {
        pos: [0, 0, 3],
        target: [0, 0, 0],
        frustumSize: 1,
        near: 0.5,
        far: 10
    },

    controls: {
        minDistance: 1,
        maxDistance: 500,
        rotateSpeed: 0.18
    }
};

export default config;
