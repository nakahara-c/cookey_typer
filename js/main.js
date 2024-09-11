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

window.onload = adjustCanvasSize;
window.onresize = adjustCanvasSize;