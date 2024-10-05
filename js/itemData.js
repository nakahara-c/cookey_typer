export const itemData  = [
    {name: 'Finger', power: 0.1, price: 15, trigger: '1'},
    {name: 'Thunder', power: 1, price: 100, trigger: '2'},
    {name: 'Ninja', power: 8, price: 1100, trigger: '3'},
    {name: 'Comet', power: 47, price: 12000, trigger: '4'},
    {name: 'Professor', power: 260, price: 130000, trigger: '5'},
    {name: 'LaserBeam', power: 1400, price: 1400000, trigger: '6'},
    {name: 'EddieVH', power: 7800, price: 20000000, trigger: '7'},
    {name: 'Meijin', power: 44000, price: 330000000, trigger: '8'},
    {name: 'Rocket', power: 260000, price: 5100000000, trigger: '9'},
    {name: 'Tatsujin', power: 1600000, price: 75000000000, trigger: '0'},
    {name: 'Jedi', power: 10000000, price: 1000000000000, trigger: '-'},
    {name: 'Godhand', power: 65000000, price: 14000000000000, trigger: '^'},
    {name: 'Joker', power: 430000000, price: 170000000000000, trigger: '@'},
    {name: 'JavaScript', power: 2900000000, price: 2100000000000000, trigger: '['},
];


const getTriggerKeys = () => {
    return itemData.map(item => item.trigger);
}
export const triggerKeys = getTriggerKeys();