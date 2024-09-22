import { wordList } from './wordList.js';
import { itemData } from './itemData.js';

let masterCount = 0;
let autoKpm = 0;
let rawKpm = 0;
let typedKeysCount = 0;
let typeText = '';
let order = [];
let shuffledOrder = [];
let itemBelongings = [0, 0, 0, 0, 0, 0, 0];

const typingArea = document.getElementById('typing_area');
const itemButtons = document.getElementsByClassName('items');

for (let i = 0; i < itemButtons.length; i++) {
    itemButtons[i].addEventListener('click', () => {
        buyItem(i);
    });
}

setWordEnglish(1000, typingArea);
loadData();
setItemName();
setItemBelongings();

const update = () => {
    autoKpm = calculateAutoKpm();
    masterCount += autoKpm / (60 * 10);
    document.getElementById('typed_count').innerText = String(masterCount.toFixed(0));
    const kps = ((autoKpm + rawKpm) / 60).toFixed(3);
    document.getElementById('kps').innerText = String(kps);
    saveData();
}

setInterval(() => {
    update();
}, 100);
setInterval(() => {
    createFallingKeyboard();
}, 300);
setInterval(() => {
    updateRawKpm();
}, 1000);

window.onload = adjustCanvasSize;
window.onresize = adjustCanvasSize;

renderItems();

const legacyButton = document.getElementById('legacy');
legacyButton.addEventListener('click', () => {
    resetData();
});

const ctx = document.getElementById('myChart');

const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'kps',
            data: [],
            backgroundColor: "#D2691E",
            borderColor: "#D2691E",
            borderWidth: 1,
            tension: 0.3
        },
        {
            label: 'raw-kps',
            data: [],
            backgroundColor: "#FF69B4",
            borderColor: "#FF69B4",
            borderWidth: 1,
            tension: 0.3
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

setInterval(() => {
    const autoKps = Math.floor(autoKpm / 60);
    const rawKps = Math.floor(rawKpm / 60);

    chart.data.datasets[0].data.push(autoKps);
    chart.data.datasets[1].data.push(rawKps);
    chart.data.labels.push('');
    if (chart.data.datasets[0].data.length > 20) {
        chart.data.datasets[0].data.shift();
        chart.data.datasets[1].data.shift();
        chart.data.labels.shift();
    }
    chart.update();
}, 1000);

function saveData() {
    const data = {
        c: Math.floor(masterCount),
        b: itemBelongings
    };
    localStorage.setItem('cookeyData', JSON.stringify(data));
}

function loadData() {
    const data = JSON.parse(localStorage.getItem('cookeyData'));
    if (!data) return;
    if (data.c) masterCount = data.c;
    if (data.b) itemBelongings = data.b;
}

function resetData() {
    localStorage.removeItem('cookeyData');
    if (! localStorage.getItem('cookeyData')) location.reload();
}

function updateRawKpm() {
    rawKpm = typedKeysCount * 60;
    const rawKps = typedKeysCount;
    document.getElementById('raw-kps').innerText = String(rawKps);
    typedKeysCount = 0;
}

function drawGlowEffect() {
    const canvas = document.getElementById('glowCanvas');
    const ctx = canvas.getContext('2d');

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) / 2;

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function adjustCanvasSize() {
    const img = document.getElementById('keyboard');
    const canvas = document.getElementById('glowCanvas');

    canvas.width = img.width + 300;
    canvas.height = img.height + 300;

    drawGlowEffect();
}

function renderItems() {
    const itemCounts = document.getElementsByName('item-cnt');
    const itemImages = document.getElementsByClassName('item-img');
    const itemPrices = document.getElementsByName('item-price');

    for (let i = 0; i < itemCounts.length; i++) {
        const cnt = itemBelongings[i];
        const itemPrice = calcPrice(itemData[i].price, cnt);
        if (i === 0 || itemBelongings[i-1] > 0) {
            itemImages[i].classList.remove('locked');
            itemPrices[i].innerText = itemPrice + ' keys[' + (i+1) + ']';
        }
    }
    setItemName();
}

function createFallingKeyboard() {
    const keyboardImg = document.createElement('img');
    keyboardImg.src = 'images/keyboard.png';
    keyboardImg.className = 'falling';

    const header = document.querySelector('header');
    header.appendChild(keyboardImg);

    const randomX = Math.random() * window.innerWidth;
    keyboardImg.style.left = `${randomX}px`;

    setTimeout(() => {
        keyboardImg.remove();
    }, 6000);
}

function calculateAutoKpm() {
    let newKpm = 0;
    for (let i = 0; i < itemData.length; i++) {
        const itemCount = itemBelongings[i];
        newKpm += itemData[i].power * itemCount;
    }
    return newKpm;
}

function setWordEnglish(keysCount, typingArea) {
    let shuffledWordList;
    shuffledWordList = fisherYatesShuffle(wordList);
    typeText = shuffledWordList.join(' ');
    typingArea.value = typeText.slice(0, keysCount);

    order = [];
    shuffledOrder = [];

    for (let i = 0; i < (keysCount * 2); i++) order.push(i);
    shuffledOrder = reorder(fisherYatesShuffle(order), keysCount);

    window.addEventListener('keydown', judgeKeys, false);

    return;
}

function judgeKeys(e) {
    e.preventDefault();
    let typedKey = e.key;
    let nextKey = typeText[0];

    const numberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

    if (typedKey === nextKey) {
        correctType(typedKey);
    } else {
        if (numberKeys.includes(typedKey)) {
            buyItem(typedKey);
        } else {
            incorrectType(typedKey);
        }
    }
}

function buyItem(typedKey) {
    const baseItemPrice = itemData[Number(typedKey) - 1].price;

    const itemCounts = document.getElementsByName('item-cnt');
    const itemImages = document.getElementsByClassName('item-img');
    
    const itemIndex = Number(typedKey) - 1;
    const currentCount = itemBelongings[itemIndex];

    const itemPrice = calcPrice(baseItemPrice, currentCount);

    if (masterCount >= itemPrice) {
        masterCount -= itemPrice;
        itemCounts[itemIndex].innerText = currentCount + 1;
        itemBelongings[itemIndex] += 1;
        renderItems();
    }
}

function calcPrice(basePrice, currentCount) {
    return Math.floor(basePrice * (1.15 ** currentCount));
}

function setItemName() {
    const itemNames = document.getElementsByName('item-name');
    for (let i = 0; i < itemNames.length; i++) {
        const name = i === 0 || itemBelongings[i-1] > 0 ? itemData[i].name : '???';
        itemNames[i].innerText = name;
    }
}
function setItemBelongings() {
    const itemCounts = document.getElementsByName('item-cnt');
    for (let i = 0; i < itemCounts.length; i++) {
        itemCounts[i].innerText = itemBelongings[i];
    }
}

function correctType(key) {
    typeText = typeText.slice(1);
    typingArea.value = typeText;
    const baseKps = autoKpm / 60;
    const addCount = Math.max(1, Math.floor(baseKps / 10));
    typedKeysCount += addCount;
    masterCount += addCount;
    renderPlusAnimation(addCount);
}

function incorrectType(key) {
    typingArea?.classList.add('missed');
    setTimeout(() => {
        typingArea?.classList.remove('missed');
    }, 1000);
}

function renderPlusAnimation(addCount) {
    const plus = document.createElement('div');
    plus.className = 'plus text-white fs-3 position-absolute fade-animation';
    plus.innerText = `+${addCount}`;

    const keyboardImg = document.getElementById('keyboard');
    const rect = keyboardImg.getBoundingClientRect();

    const parentRect = document.getElementById('keyboard-area').getBoundingClientRect();
    const randomXOffset = Math.random() * rect.width - rect.width / 2;
    const randomYOffset = Math.random() * rect.height - rect.height / 2;

    plus.style.left = `${rect.left - parentRect.left + rect.width / 2 + randomXOffset}px`;
    plus.style.top = `${rect.top - parentRect.top + rect.height / 2 + randomYOffset}px`;

    plus.style.zIndex = '100'; 

    const canvas = document.getElementById('keyboard-area');
    canvas.appendChild(plus);

    setTimeout(() => {
        plus.remove();
    }, 1000);
}

function fisherYatesShuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function reorder(array, cnt) {
    let result = [...array];
    let cnt2 = cnt * 2;
    for (let i = 0; i < array.length; i++) {
        let a = array[i];
        let b = (a + cnt) % cnt2;
        let aIndex = i;
        let bIndex = array.indexOf(b);
        if (a < b && aIndex > bIndex) {
            [result[aIndex], result[bIndex]] = [result[bIndex], result[aIndex]];
        }
    }
    return result;
}