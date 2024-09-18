import { wordList } from './wordList.js';

let count = 1000;
let kpm = 777;
let rawKpm = 0;
let typeText = '';
let order = [];
let shuffledOrder = [];

const typingArea = document.getElementById('typing_area');
setWordEnglish(500, typingArea);

const update = () => {
    count += Math.floor((kpm + rawKpm) / 10);
    document.getElementById('typed_count').innerText = String(count);
    document.getElementById('kpm').innerText = String(kpm + rawKpm);
    // document.getElementById('rawKpm').innerText = String(rawKpm);
}

setInterval(() => {
    update();
}, 100);
setInterval(() => {
    createFallingKeyboard();
}, 300);

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
    chart.data.datasets[0].data.push(kpm);
    chart.data.datasets[1].data.push(Math.floor(Math.random() * 1000));
    chart.data.labels.push('');
    if (chart.data.datasets[0].data.length > 20) {
        chart.data.datasets[0].data.shift();
        chart.data.datasets[1].data.shift();
        chart.data.labels.shift();
    }
    chart.update();
}, 1000);

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
        const cnt = Math.max(0, 3 - i);
        itemCounts[i].innerText = cnt;
        if (cnt > 0) {
            itemImages[i].classList.remove('locked');
        }
    }
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

    typedKey === nextKey ? correctType(typedKey) : incorrectType(typedKey);        
}

function correctType(key) {
    typeText = typeText.slice(1);
    let typingArea = document.getElementById('typing_area');
    typingArea.value = typeText;
    deleteBlock();
}

function incorrectType(key) {
    let typingArea = document.getElementById('typing_area');
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