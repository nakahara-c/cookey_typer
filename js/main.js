import { wordList } from './wordList.js';
import { itemData } from './itemData.js';

let masterCount = 0;
let kpm = 0;
let autoKpm = 0;
let rawKpm = 0;
let typedKeysCount = 0;
let typeText = '';
let order = [];
let shuffledOrder = [];
let itemBelongings = [0, 0, 0, 0, 0, 0, 0];

const typingArea = document.getElementById('typing_area');

setWordEnglish(1000, typingArea);
loadData();
setItemName();
setItemBelongings();

const update = () => {
    autoKpm = calculateAutoKpm();
    masterCount += Math.floor(autoKpm / 10);
    document.getElementById('typed_count').innerText = String(masterCount);
    document.getElementById('kpm').innerText = String(autoKpm + rawKpm);
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

const ctx = document.getElementById('myChart');

const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'kpm',
            data: [],
            backgroundColor: "#D2691E",
            borderColor: "#D2691E",
            borderWidth: 1,
            tension: 0.3
        },
        {
            label: 'raw-kpm',
            data: [],
            //桃色
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
    chart.data.datasets[0].data.push(autoKpm);
    chart.data.datasets[1].data.push(rawKpm);
    chart.data.labels.push('');
    if (chart.data.datasets[0].data.length > 20) {
        chart.data.datasets[0].data.shift();
        chart.data.datasets[1].data.shift();
        chart.data.labels.shift();
    }
    chart.update();
}, 1000);

function saveData() {
    console.log(itemBelongings);
    const data = {
        masterCount: masterCount,
        itemBelongings: itemBelongings
    };
    localStorage.setItem('cookeyData', JSON.stringify(data));
}

function loadData() {
    const data = JSON.parse(localStorage.getItem('cookeyData'));
    if (!data) return;
    console.log(data);
    if (data.masterCount) masterCount = data.masterCount;
    if (data.itemBelongings) itemBelongings = data.itemBelongings;
}

function resetData() {
    localStorage.removeItem('cookeyData');
    location.reload();
}

function updateRawKpm() {
    rawKpm = typedKeysCount * 60;
    document.getElementById('raw-kpm').innerText = String(rawKpm);
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

    canvas.width = img.width + 200;
    canvas.height = img.height + 200;

    drawGlowEffect();
}

function renderItems() {
    const itemCounts = document.getElementsByName('item-cnt');
    const itemImages = document.getElementsByClassName('item-img');

    for (let i = 0; i < itemCounts.length; i++) {
        const cnt = Number(itemCounts[i].innerText);
        if (cnt > 0) {
            itemImages[i].classList.remove('locked');
        }
    }

    setItemName();
}

function createFallingKeyboard() {
    const keyboardImg = document.createElement('img');
    keyboardImg.src = 'images/ety.png';
    keyboardImg.className = 'falling';
    keyboardImg.style.width = '50px';

    const header = document.querySelector('header');
    header.appendChild(keyboardImg);

    const randomX = Math.random() * window.innerWidth;
    keyboardImg.style.left = `${randomX}px`;

    setTimeout(() => {
        keyboardImg.remove();
    }, 5000);
}

function calculateAutoKpm() {
    let newKpm = 0;
    for (let i = 0; i < itemData.length; i++) {
        const itemCount = Number(document.getElementsByName('item-cnt')[i].innerText);
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
    const itemPrice = itemData[Number(typedKey) - 1].price;

    const itemCounts = document.getElementsByName('item-cnt');
    const itemImages = document.getElementsByClassName('item-img');

    const itemIndex = Number(typedKey) - 1;
    const currentCount = Number(itemCounts[itemIndex].innerText);

    if (masterCount > itemPrice) {
        masterCount -= itemPrice;
        itemCounts[itemIndex].innerText = currentCount + 1;
        itemBelongings[itemIndex] += 1;
        renderItems();
    }
}

function setItemName() {
    const itemNames = document.getElementsByName('item-name');
    for (let i = 0; i < itemNames.length; i++) {
        itemNames[i].innerText = itemData[i].name;
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
    masterCount += 1;
    typedKeysCount += 1;
}

function incorrectType(key) {
    typingArea?.classList.add('missed');
    setTimeout(() => {
        typingArea?.classList.remove('missed');
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