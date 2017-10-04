
const cards = [
    {id: 0, color: 'red', damage: 2, price: 1, texName: 'card0Tex'},
    {id: 1, color: 'red', damage: 4, price: 2, texName: 'card1Tex'},
    {id: 2, color: 'red', damage: 6, price: 3, texName: 'card2Tex'},
    {id: 3, color: 'red', damage: 8, price: 4, texName: 'card3Tex'},
    {id: 4, color: 'blue', damage: 2, price: 1, texName: 'card4Tex'},
    {id: 5, color: 'blue', damage: 4, price: 2, texName: 'card5Tex'},
    {id: 6, color: 'blue', damage: 6, price: 3, texName: 'card6Tex'},
    {id: 7, color: 'blue', damage: 8, price: 4, texName: 'card7Tex'}
];

export function generateCard() {
    return cards[Math.floor(Math.random() * cards.length)];
}
