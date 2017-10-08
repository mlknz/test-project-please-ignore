
const cards = [
    {id: 0, color: 'red', damage: 2, price: -1, texName: 'cardRed2Tex'},
    {id: 1, color: 'red', damage: 4, price: -2, texName: 'cardRed4Tex'},
    {id: 2, color: 'red', damage: 6, price: -3, texName: 'cardRed6Tex'},
    {id: 3, color: 'red', damage: 8, price: -4, texName: 'cardRed8Tex'},
    {id: 4, color: 'red', damage: 10, price: -5, texName: 'cardRed10Tex'},
    {id: 5, color: 'blue', damage: 2, price: 1, texName: 'cardBlue2Tex'},
    {id: 6, color: 'blue', damage: 4, price: 2, texName: 'cardBlue4Tex'},
    {id: 7, color: 'blue', damage: 6, price: 3, texName: 'cardBlue6Tex'},
    {id: 8, color: 'blue', damage: 8, price: 4, texName: 'cardBlue8Tex'},
    {id: 9, color: 'blue', damage: 10, price: 5, texName: 'cardBlue10Tex'}
];

export function generateCard() {
    return cards[Math.floor(Math.random() * cards.length)];
}
