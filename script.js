document.getElementById("addBorderBtn").addEventListener("click", preparing);

const input = document.getElementById('imageInput');

const wInput = document.getElementById('widthInput');
const hInput = document.getElementById('heightInput');
const rInput = document.getElementById('radiusInput');

const minDots = document.getElementById('minDots');
const maxDots = document.getElementById('maxDots');

const minDist = document.getElementById('minDist');
const brightness = document.getElementById('brightness');



function preparing() {
    
    if (!input.files.length) {
        alert('Выберите изображение');
        return;
    }

    if (document.querySelector('img')){
        document.querySelector('img').remove();
    }

    const file = input.files[0];
    const img = new Image();
    const reader = new FileReader();

    reader.onload = function(event) {
        img.src = event.target.result;
        img.onload = function() {
            const imgW = img.width;
            const imgH = img.height;

            const canvas = document.createElement('canvas');
            canvas.width = imgW
            canvas.height = imgH
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, imgW, imgH);
            const pixels = imgData.data;

            generateBorder(imgW, imgH, imgW + Number(wInput.value), imgH + Number(hInput.value), pixels);
            
            imgEl = document.body.appendChild(img);
            imgEl.style.bottom = imgH + Number(hInput.value) / 2 +'px';

            const kf = ((imgW / (imgW + Number(wInput.value))) + (imgH / (imgH + Number(hInput.value)))) / 2;
            
            document.getElementById('outputCanvas').style['border-radius'] = rInput.value + 'px';
            imgEl.style['border-radius'] = Math.round(Number(rInput.value) * kf) + 'px';
        }
    }
    reader.readAsDataURL(file);
}

function generateBorder(imgW, imgH, borderW, borderH, pixels){

    const newCanvas = document.getElementById('outputCanvas');
    newCanvas.width = borderW;
    newCanvas.height = borderH;
    const newCtx = newCanvas.getContext('2d');
    const newImgData = newCtx.createImageData(newCanvas.width, newCanvas.height);
    const newPixels = newImgData.data;

    const medR = [];
    const medG = [];
    const medB = [];

    for (let i = 0; i * 10 < 255; i++){
        medR.push([]);
        medG.push([]);
        medB.push([]);
    }

    for (let y = 0; y < imgH; y++) {
        for (let x = 0; x < imgW; x++) {
            const i = (y * imgW + x) * 4;

            for (let ii = 0; ii * 10 < 255; ii++){
                if (pixels[i] > ii * 10 && pixels[i] < (ii+1) * 10)
                    medR[ii].push(i);
                if (pixels[i + 1] > ii * 10 && pixels[i + 1] < (ii+1) * 10)
                    medG[ii].push(i + 1);
                if (pixels[i + 2] > ii * 10 && pixels[i + 2] < (ii+1) * 10)
                    medB[ii].push(i + 2);
            }
        }
    }

    var mostRIndex = 0;
    var mostGIndex = 0;
    var mostBIndex = 0;

    for (let i = 0; i < medR.length; i++)
        if (medR[i].length > medR[mostRIndex].length)
            mostRIndex = i;
    
    for (let i = 0; i < medG.length; i++)
        if (medG[i].length > medG[mostGIndex].length)
            mostGIndex = i;
    
    for (let i = 0; i < medB.length; i++)
        if (medB[i].length > medB[mostBIndex].length)
            mostBIndex = i;
    
    const noise = [];
    for (let i = 0; i < borderW; i++){
        noise.push([]);
        for (let j = 0; j < borderH; j++){
            noise[i].push(0);
        }
    }

    const dots = [];
    const dotsNumber = Math.round(Math.random() * (Number(maxDots.value) - Number(minDots.value)) + Number(minDots.value));

    for (let i = 0; i < dotsNumber; i++) {
        dots.push([]);
        dots[i].push(0);
    }

    for (let i = 0; i < dotsNumber; i++) {
        dots[i][0] = Math.round(Math.random() * borderW);
        dots[i][1] = Math.round(Math.random() * borderH);

        if (i > 0)
            if (distance(dots[i][0], dots[i][1], dots[i - 1][0], dots[i - 1][1]) < Number(minDist.value)) {
                i--;
                continue;
            }

    }

    for (let y = 0; y < borderH; y++) {
        for (let x = 0; x < borderW; x++) {
            for (let i = 0; i < dots.length; i++) {
                noise[x][y] += Number(brightness.value) / distance(x, y, dots[i][0], dots[i][1]);
                if (noise[x][y] > 1)
                    noise[x][y] = 1;
            }
        }
    }

    for (let y = 0; y < borderH; y++) {
        for (let x = 0; x < borderW; x++) {
            const newI = (y * borderW + x) * 4;
            newPixels[newI] = mostRIndex * 10 * noise[x][y];
            newPixels[newI + 1] = mostGIndex * 10 * noise[x][y];
            newPixels[newI + 2] = mostBIndex * 10 * noise[x][y];
            newPixels[newI + 3] = 255;
        }
    }
    
/*
    for (let y = 0; y < imgH; y++) {
        for (let x = 0; x < imgW; x++) {
            const i = (y * imgW + x) * 4;
            const newI = ((y + (borderH - imgH) / 2) * borderW + x + (borderW - imgW) / 2) * 4;
            newPixels[newI] = pixels[i];
            newPixels[newI + 1] = pixels[i + 1];
            newPixels[newI + 2] = pixels[i + 2];
            newPixels[newI + 3] = 255;
        }
    }*/

    newCtx.putImageData(newImgData, 0, 0);
}

function distance(x1, y1, x2, y2) {
    return (((x2 -x1) ** 2) + ((y2 - y1) ** 2)) ** 0.5;
}