// todo: support sign at damage, remove color
const cards = [
    {id: 0, color: 'red', damage: 2, price: 1},
    {id: 1, color: 'red', damage: 4, price: 2},
    {id: 2, color: 'red', damage: 6, price: 3},
    {id: 3, color: 'red', damage: 8, price: 4},
    {id: 4, color: 'red', damage: 10, price: 5},
    {id: 5, color: 'blue', damage: 2, price: -1},
    {id: 6, color: 'blue', damage: 4, price: -2},
    {id: 7, color: 'blue', damage: 6, price: -3},
    {id: 8, color: 'blue', damage: 8, price: -4},
    {id: 9, color: 'blue', damage: 10, price: -5}
];

export function generateCard() {
    return cards[Math.floor(Math.random() * cards.length)];
}
