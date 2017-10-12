import gamestate from '../gamestate.js';
import config from '../config.js';

class BotLogic {
    constructor(context) {
        this.context = context;
    }

    makeTurn(isAttack) {
        const maxTemperature = config.game.maxT;
        const botHand = gamestate.enemyHand; // available cards, look at model/card.js.
        const playerTemperature = gamestate.playerT;
        const botTemperature = gamestate.enemyT;
        const playerTowersTemperatures = gamestate.towersT[0];
        const enemyTowersTemperatures = gamestate.towersT[1];

        console.log('isAttack:', isAttack, ', hand:', botHand[0], botHand[1], botHand[2], botHand[3],
            'maxT', maxTemperature,
            'temperatures:', playerTemperature, botTemperature,
            'towers:', playerTowersTemperatures, enemyTowersTemperatures);
        // this.context.shuffleRemainingCards(false); // call to change remaining cards
        // this.context.tracks.getUnitOnTrack(true, trackIndex); // call to know what player played if you are defending
        this.doSomething('ok');

        for (let i = 0; i < 3; ++i) {
            const cardIndexToPlay = i; // value to modify
            setTimeout(() => {
                this.context.playCard(false, cardIndexToPlay, i);
            }, 500 * (i + 1));
        }
        setTimeout(() => { this.context.nextPhase(); }, 2000);
    }

    doSomething(parameter) {
        console.log('doing somthing', parameter);
    }
}

export default BotLogic;
