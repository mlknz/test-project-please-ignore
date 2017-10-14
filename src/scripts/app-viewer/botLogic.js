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


        console.log('BotLogic');
        console.log('isAttack:', isAttack, ', hand:', botHand[0], botHand[1], botHand[2], botHand[3],
            'maxT', maxTemperature,
            'temperatures:', playerTemperature, botTemperature,
            'towers:', playerTowersTemperatures, enemyTowersTemperatures);

        // this.context.shuffleRemainingCards(false); // call to change remaining cards
        // this.context.tracks.getUnitOnTrack(true, trackIndex); // call to know what player played if you are defending
        // this.doSomething(enemyTowersTemperatures);

        const towerIX = this.sortedTowersIndexes(enemyTowersTemperatures);


        // console.log('towerIX',towerIX,enemyTowersTemperatures);

        for (let i = 0; i < 3; ++i) {

            const towerIndexToPlay = towerIX[i];

            setTimeout(() => { // eslint-disable-line
                const cardIndexToPlay = this.chooseCard(enemyTowersTemperatures[towerIndexToPlay], botHand);
                // console.log('cardIndexToPlay ',cardIndexToPlay, 'price of the card to play: ' ,botHand[cardIndexToPlay].price, 'tower temp: ', enemyTowersTemperatures[towerIndexToPlay])
                this.context.playCard(false, cardIndexToPlay, towerIndexToPlay);
                // console.log('botHand after played card ',i, ' ' ,botHand[i].price,botHand[i+1].price)

            }, 500 * (i + 1));
        }

        setTimeout(() => { this.context.nextPhase(); }, 2000);
    }


    sortedTowersIndexes(parameter) {

        const towers = parameter.slice();
        const EnemyTowers = [];

        towers.forEach((e, i) => {
            EnemyTowers[i] = {index: i, value: e};
        });

        EnemyTowers.sort((towerA, towerB) => {return Math.abs(towerB.value) - Math.abs(towerA.value);}); // sort towers sort descending

        return [EnemyTowers[0].index, EnemyTowers[1].index, EnemyTowers[2].index];

    }

    chooseCard(towerTemperature, botCards) {
        const allPrices = [];

        for (let i = 0; i < Object.keys(botCards).length; i++) {
            if (botCards[i] !== null) {
                allPrices[i] = Math.abs(towerTemperature + botCards[i].price);
            } else allPrices[i] = 1000;

            // console.log('towerTemperature,botCards[i].price',towerTemperature,botCards[i].price);

        }
    // console.log('prices, min, min index ', allPrices, Math.min.apply(Math, allPrices),allPrices.indexOf(Math.min.apply(Math, allPrices)));
        return allPrices.indexOf(Math.min.apply(Math, allPrices));

    }
}

export default BotLogic;
