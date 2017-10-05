const gamestate = {
    isMouseDown: false,
    activeCard: undefined,
    activeTrack: undefined,
    phases: {
        RESET: 0,
        PLAYER_ATTACK: 1,
        ENEMY_ATTACK: 2,
        PLAYER_DEFENCE: 3,
        ENEMY_DEFENCE: 4,
        APPLY: 5
    },
    phasesSeq: [],
    activePhaseIndex: 0,
    activePhase: null,
    usedShuffleThisTurn: false,
    playerHand: {
        0: null,
        1: null,
        2: null,
        3: null
    },
    enemyHand: {
        0: null,
        1: null,
        2: null,
        3: null
    }
};

export default gamestate;
