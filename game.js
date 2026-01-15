if (!window.canvas) {
    window.canvas = document.getElementById("gameCanvas");
}
const canvas = window.canvas;
const ctx = canvas ? canvas.getContext("2d") : null;

if (!canvas || !ctx) console.error("Canvas ili kontekst nisu pronađeni!");

const lobbyScreen = document.getElementById('lobby-ekran');
const rulesScreen = document.getElementById('rules-screen');
const defeatScreen = document.getElementById('defeat-screen');


let blob; 
let foods = [];
let enemies = [];
let specialOrbs = [];
let randomOrbs = [];
let shieldOrbs = [];
let chargeOrbs = []; 

let boundary = 5000; 
let zoom = 1;
let gameRunning = false;
let flashAlpha = 0; 
let speedBoostDuration = 0;
let shieldDuration = 0;
let speedCharge = 0; 
let lastEatTime = Date.now(); 
let startTime = 0;
let controlMode = 'mouse';
let lastEatShrinkTimer = 0; 

let aetherZone = null;
let aetherTimer = 0;
let nextAetherTime = 600; 

let oblivionZone = null;
let oblivionTimer = 0;
let nextOblivionTime = 1200; 

window.isInAetherZone = false; 
window.difficultyMode = 'medium'; 
window.keyPressed = {}; 

let soundEat, soundBoost, soundDefeat, soundStart, soundShield; 
let soundOblivion, soundRandom; 

window.DIFFICULTY_SETTINGS = {
    easy: {
        npcAggression: 0.2,
        npcSpeedMultiplier: 0.8,
        fleeDistance: 400
    },
    medium: {
        npcAggression: 0.5,
        npcSpeedMultiplier: 1.0,
        fleeDistance: 500
    },
    hard: {
        npcAggression: 0.9,
        npcSpeedMultiplier: 1.2,
        fleeDistance: 650
    }
};


function resizeCanvas() {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}
window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", () => {
    setTimeout(resizeCanvas, 100);
});
resizeCanvas();

function createFood(count = 800) { 
    for (let i = foods.length; i < count; i++) {
        foods.push(
            new Blob(
                random(-boundary, boundary),
                random(-boundary, boundary),
                10,
                `rgb(${random(50,255)},${random(50,255)},${random(50,255)})`
            )
        );
    }

    while (specialOrbs.length < 30) {
        specialOrbs.push(
            new Blob(
                random(-boundary, boundary),
                random(-boundary, boundary),
                15,
                '#00FFFF',
                'Boost'
            )
        );
    }

    while (shieldOrbs.length < 5) {
        shieldOrbs.push(
            new Blob(
                random(-boundary, boundary),
                random(-boundary, boundary),
                25,
                '#FFD700', 
                'Shield'
            )
        );
    }

    while (randomOrbs.length < 8) {
        randomOrbs.push(
            new Blob(
                random(-boundary, boundary),
                random(-boundary, boundary),
                20,
                '#ff00ff',
                'Random'
            )
        );
    }

    while (chargeOrbs.length < 40) {
        chargeOrbs.push(
            new Blob(
                random(-boundary, boundary),
                random(-boundary, boundary),
                18,
                '#8B4513',
                'Charge'
            )
        );
    }
}


function createEnemies() {
    let count = 50;
    let smallRange = [15, 28];
    let largeRange = [35, 120];
    
    if (window.difficultyMode === 'easy') { 
        count = 35;
        smallRange = [15, 25];
        largeRange = [30, 80];
    }
    else if (window.difficultyMode === 'hard') { 
        count = 70;
        smallRange = [15, 30];
        largeRange = [40, 200];
    }

    const margin = 300;
    for (let i = 0; i < count; i++) {
        const isSmall = random(0, 1) < 0.75;
        const radius = isSmall ? random(smallRange[0], smallRange[1]) : random(largeRange[0], largeRange[1]);
        enemies.push(new Blob(random(-boundary + margin, boundary - margin), random(-boundary + margin, boundary - margin), radius, `rgb(${random(100,255)},${random(100,255)},${random(100,255)})`, getRandomAIName(), false));
    }
}

function spawnAetherZone() {
    aetherZone = {
        pos: new Vector(random(-boundary+500, boundary-500), random(-boundary+500, boundary-500)),
        r: random(250, 400),
        duration: 720 
    };
}

function spawnOblivionZone() {
    oblivionZone = {
        pos: new Vector(random(-boundary+800, boundary-800), random(-boundary+800, boundary-800)),
        r: random(450, 600), 
        duration: 600 
    };
    try { if(soundOblivion) soundOblivion.play(); } catch (e) {} 
}

function startGame(playerName, playerColor) {
    if (gameRunning) return;
    
    try {
        soundEat = new Audio('AUDIO/Eat_Own_Cell.mp3'); 
        soundDefeat = new Audio('AUDIO/game-over.mp3'); 
        soundStart = new Audio('AUDIO/game-start.mp3'); 
        soundBoost = new Audio('AUDIO/game-treasure.mp3'); 
        soundShield = new Audio('AUDIO/Shield_Activate.mp3');
        soundOblivion = new Audio('AUDIO/Oblivion_Appear.mp3'); 
        soundRandom = new Audio('AUDIO/Random_Effect.mp3'); 
        
        soundEat.volume = 0.5;
        if(soundStart) soundStart.play(); 
    } catch (e) {
        console.warn("Greška pri učitavanju zvuka. Provjerite putanje i foldere.");
    }

    foods = [];
    enemies = [];
    specialOrbs = [];
    randomOrbs = [];
    shieldOrbs = [];
    chargeOrbs = [];
    createFood();
    createEnemies();

    let startingRadius = 32;
    if (window.difficultyMode === 'hard') {
        startingRadius = 50;
    }
    blob = new Blob(0, 0, startingRadius, playerColor, playerName, true); 
    window.blob = blob;
    window.boundary = boundary;
    
    if (window.difficultyMode === 'hard') {
        speedCharge = 2;
        try { if(soundBoost)soundBoost.play(); } catch (e) {}
    } 

    zoom = 1;
    speedBoostDuration = 0;
    shieldDuration = 0;
    speedCharge = 0;
    isChargeBoost = false;
    startTime = Date.now();
    lastEatTime = Date.now();
    lastEatShrinkTimer = 0;
    gameRunning = true;
    if (window.setGameRunning) window.setGameRunning(true);
    aetherZone = null;
    aetherTimer = 0;
    oblivionZone = null;
    oblivionTimer = 0;
    
    requestAnimationFrame(animate);
}

function endGame(message) {
    gameRunning = false;
    if (window.setGameRunning) window.setGameRunning(false);
    
    try { 
        if (soundDefeat) { soundDefeat.currentTime = 0; soundDefeat.play(); }
    } catch (e) {}
    
    defeatScreen.style.display = 'flex';
    document.getElementById('defeat-message').innerText = message;
    document.getElementById('gameCanvas').style.display = 'none';
}


let lastTapTime = 0;
let lastTapX = 0;
let lastTapY = 0;

function checkDoubleTap(x, y) {
    if (!gameRunning || !blob || !canvas || canvas.style.display === 'none') return false;
    
    const currentTime = Date.now();
    const timeDiff = currentTime - lastTapTime;
    const xDiff = Math.abs(x - lastTapX);
    const yDiff = Math.abs(y - lastTapY);
    
    if (timeDiff < 400 && xDiff < 50 && yDiff < 50) {
        const canvasRect = canvas.getBoundingClientRect();
        const canvasX = x - canvasRect.left;
        const canvasY = y - canvasRect.top;
        
        const worldX = (canvasX - canvas.width / 2) / zoom + blob.pos.x;
        const worldY = (canvasY - canvas.height / 2) / zoom + blob.pos.y;
        
        const dist = Math.sqrt(
            Math.pow(worldX - blob.pos.x, 2) + 
            Math.pow(worldY - blob.pos.y, 2)
        );
        
        if (dist < blob.r * 1.5 && speedCharge > 0 && speedBoostDuration <= 0) {
            speedBoostDuration = 300;
            isChargeBoost = true;
            speedCharge--;
            try { if(soundBoost)soundBoost.play(); } catch (e) {}
            lastTapTime = 0;
            return true;
        }
    }
    
    lastTapTime = currentTime;
    lastTapX = x;
    lastTapY = y;
    return false;
}

canvas.addEventListener('dblclick', (e) => {
    checkDoubleTap(e.clientX, e.clientY);
});

let touchStartTime = 0;
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
        touchStartTime = Date.now();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
});

canvas.addEventListener('touchend', (e) => {
    if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const touchDuration = Date.now() - touchStartTime;
        
        if (touchDuration < 300) {
            checkDoubleTap(touch.clientX, touch.clientY);
        }
    }
});

function animate() {
    if (!gameRunning || !ctx || !blob) { 
        if (gameRunning) {
            requestAnimationFrame(animate);
        }
        return; 
    }

    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    const gridSize = 50;
    const offsetX = (Math.round(blob.pos.x * zoom)) % gridSize; 
    const offsetY = (Math.round(blob.pos.y * zoom)) % gridSize;

    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1/zoom;
    ctx.beginPath();
    ctx.translate(canvas.width/2, canvas.height/2);
    for(let x=-canvas.width;x<canvas.width;x+=gridSize){
        ctx.moveTo(x*zoom - offsetX, -canvas.height);
        ctx.lineTo(x*zoom - offsetX, canvas.height);
    }
    for(let y=-canvas.height;y<canvas.height;y+=gridSize){
        ctx.moveTo(-canvas.width, y*zoom - offsetY);
        ctx.lineTo(canvas.width, y*zoom - offsetY);
    }
    ctx.stroke();
    ctx.setTransform(1,0,0,1,0,0);

    const targetZoom = 64/blob.r; 
    zoom += (targetZoom - zoom)*0.05; 
    ctx.scale(zoom,zoom);
    ctx.translate(-blob.pos.x + canvas.width/2/zoom, -blob.pos.y + canvas.height/2/zoom);

    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 20/zoom;
    ctx.strokeRect(-boundary,-boundary,boundary*2,boundary*2);


    let isInOblivionZone = false;
    oblivionTimer++;
    if (!oblivionZone && oblivionTimer > nextOblivionTime) {
        spawnOblivionZone();
        oblivionTimer = 0;
        nextOblivionTime = 1800 + random(0, 1200); 
    }

    if (oblivionZone) {
        const zoneRadius = oblivionZone.r;

        ctx.beginPath();
        ctx.arc(oblivionZone.pos.x, oblivionZone.pos.y, zoneRadius, 0, Math.PI * 2);
        const alpha = 0.3 + Math.sin(Date.now() / 150) * 0.1;
        ctx.fillStyle = `rgba(180, 50, 255, ${alpha})`;
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 100, 255, 0.9)";
        ctx.lineWidth = 15;
        ctx.stroke();


        if (Vector.dist(blob.pos, oblivionZone.pos) < zoneRadius) {
            isInOblivionZone = true;
            speedBoostDuration = Math.max(speedBoostDuration, 3);
        }

        oblivionZone.duration--;
        if (oblivionZone.duration <= 0) oblivionZone = null;
    }


    const isInsideOblivion = (obj) => {
        return oblivionZone && Vector.dist(obj.pos, oblivionZone.pos) < oblivionZone.r;
    };
    
    for(let i=foods.length-1;i>=0;i--){
        const food = foods[i];
        const isFoodInOblivion = isInsideOblivion(food);
        
        if (!isFoodInOblivion) {
            food.draw(ctx);
        }
        if(blob.eats(food)){
            foods.splice(i,1);
            lastEatTime = Date.now(); 
            try { if(soundEat)soundEat.play(); } catch (e) {} 
            flashAlpha = 0.3;
            foods.push(new Blob(random(-boundary,boundary), random(-boundary,boundary), 10, `rgb(${random(50,255)},${random(50,255)},${random(50,255)})`));
        }
    }

    if(speedBoostDuration>0) speedBoostDuration--;
    for(let i=specialOrbs.length-1;i>=0;i--){
        const orb = specialOrbs[i];
        if (!isInsideOblivion(orb)) orb.draw(ctx);
        if(blob.eats(orb)){
            specialOrbs.splice(i,1);
            lastEatTime = Date.now();
            try { if(soundBoost)soundBoost.play(); } catch (e) {} 
            speedBoostDuration = 180; 
            flashAlpha = 0.5;
            createFood(1);
        }
    }
    
    if(shieldDuration>0) shieldDuration--;
    for(let i=shieldOrbs.length-1;i>=0;i--){
        const orb = shieldOrbs[i];
        if (!isInsideOblivion(orb)) orb.draw(ctx);
        if(blob.eats(orb)){
            shieldOrbs.splice(i,1);
            lastEatTime = Date.now();
            try { if(soundShield)soundShield.play(); } catch (e) {} 
            
            shieldDuration = 300; 
            flashAlpha = 0.7;
            createFood(1);
        }
    }

    for(let i=randomOrbs.length-1;i>=0;i--){
        const orb = randomOrbs[i];
        if (!isInsideOblivion(orb)) orb.draw(ctx);
        if(blob.eats(orb)){
            randomOrbs.splice(i,1);
            lastEatTime = Date.now();
            
            try { if(soundRandom) soundRandom.play(); } catch (e) {} 
            
            const change = random(-blob.r/2, blob.r); 
            blob.r = Math.max(30, blob.r+change + (change > 0 ? 20 : 0)); 
            flashAlpha = change>0?0.8:0.5;
            
            try {
                if(change>0 && soundBoost)soundBoost.play();
                if(change<=0 && soundDefeat)soundDefeat.play(); 
            } catch (e) {}
            
            createFood(1);
        }
    }

    for(let i=chargeOrbs.length-1;i>=0;i--){
        const orb = chargeOrbs[i];
        if (!isInsideOblivion(orb)) orb.draw(ctx);
        if(blob.eats(orb)){
            chargeOrbs.splice(i,1);
            lastEatTime = Date.now();
            try { if(soundBoost)soundBoost.play(); } catch (e) {} 
            speedCharge++;
            flashAlpha = 0.4;
            createFood(1);
        }
    }

    if(window.keyPressed['Enter'] && speedCharge > 0 && speedBoostDuration <= 0){
        speedBoostDuration = 300;
        isChargeBoost = true;
        speedCharge--;
        try { if(soundBoost)soundBoost.play(); } catch (e) {}
    }
    if(speedBoostDuration <= 0){
        isChargeBoost = false;
    }

    for(let i=enemies.length-1;i>=0;i--){
        const enemy = enemies[i];
        const isEnemyInOblivion = isInsideOblivion(enemy);
        
        enemy.update(window.mouse, canvas, 0, controlMode, window.keyPressed, shieldDuration > 0, isEnemyInOblivion); 
        
        if (!isEnemyInOblivion) {
            enemy.draw(ctx);
        }
        
        if (!isEnemyInOblivion) {
            for(let j=foods.length-1;j>=0;j--){
                if(enemy.eats(foods[j])) foods.splice(j,1);
            }
            for(let j=specialOrbs.length-1;j>=0;j--){
                if(enemy.eats(specialOrbs[j])) specialOrbs.splice(j,1);
            }
            for(let j=shieldOrbs.length-1;j>=0;j--){
                if(enemy.eats(shieldOrbs[j])) shieldOrbs.splice(j,1);
            }

            for(let k=enemies.length-1;k>=0;k--){
                const otherEnemy = enemies[k];
                if (i !== k && enemy.eats(otherEnemy)) { 
                    enemies.splice(k, 1);
                    const margin = 300;
                    enemies.push(new Blob(random(-boundary + margin, boundary - margin), random(-boundary + margin, boundary - margin), random(20, 100), otherEnemy.color, getRandomAIName(), false));
                }
            }
        }

        const distance = Vector.dist(blob.pos, enemy.pos);
        const touchDistance = blob.r + enemy.r; 

        if (shieldDuration > 0) {
            if (distance < touchDistance) {
                flashAlpha = 0.1;
            }
        } 
        else {
            if (enemy.r > blob.r && distance < touchDistance) { 
                endGame(`AI pobjeda! Pojeo vas je ${enemy.name}. Finalni radijus: ${Math.floor(blob.r)}`);
                return;
            } 
            else if (blob.r > enemy.r && distance < touchDistance) { 
                
                const oldRadius = blob.r;
                const sumArea =
                    Math.PI * blob.r * blob.r +
                    Math.PI * enemy.r * enemy.r;

                blob.r = Math.sqrt(sumArea / Math.PI);
                lastEatTime = Date.now(); 
                
                enemies.splice(i,1);
                flashAlpha = 0.4;
                
                const margin = 300;
                enemies.push(new Blob(random(-boundary + margin, boundary - margin), random(-boundary + margin, boundary - margin), random(20, 100), enemy.color, getRandomAIName(), false));
                
                try { if(soundEat)soundEat.play(); } catch (e) {}
            }
        }
    }

    aetherTimer++;
    if(!aetherZone && aetherTimer>nextAetherTime){ 
        spawnAetherZone(); 
        aetherTimer=0; 
        nextAetherTime = 300 + random(0, 600); 
    }
    
    window.isInAetherZone = false;
    
    if(aetherZone){
        const zoneRadius = aetherZone.r + Math.max(50, blob.r * 0.5); 
        ctx.beginPath();
        ctx.arc(aetherZone.pos.x, aetherZone.pos.y, zoneRadius, 0, Math.PI * 2);
        ctx.fillStyle="rgba(0, 180, 255, 0.15)";
        ctx.fill();
        ctx.strokeStyle="rgba(0, 255, 255, 0.6)";
        ctx.lineWidth=8;
        ctx.stroke();

        if(Vector.dist(blob.pos, aetherZone.pos) < zoneRadius){ 
            blob.r -= 0.15; 
            flashAlpha = 0.08;
            window.isInAetherZone = true;
        }
        for(const enemy of enemies){
            if(enemy.r > 50 && Vector.dist(enemy.pos, aetherZone.pos) < aetherZone.r){
                enemy.r -= 0.5; 
                enemy.r = Math.max(30, enemy.r); 
            }
        }

        aetherZone.duration--;
        if(aetherZone.duration<=0) aetherZone=null;
    }

    window.isChargeBoost = isChargeBoost;
    blob.update(window.mouse, canvas, speedBoostDuration > 0 ? speedBoostDuration : 0, controlMode, window.keyPressed, shieldDuration > 0, isInOblivionZone);

    if(blob.r>30) blob.r-=0.01/60;
    else if(blob.r>10) blob.r-=0.03/60;
    else { endGame(`Izgubili ste masu! Radijus: ${Math.floor(blob.r)}`); return; }
    
    if (Date.now() - lastEatTime > 10000 && blob.r > 35) {
        lastEatShrinkTimer++;
        if (lastEatShrinkTimer > 60) { 
            blob.r -= 2;
            lastEatShrinkTimer = 0;
            flashAlpha = 0.2;
        }
    }


    blob.draw(ctx, shieldDuration > 0); 

    ctx.setTransform(1,0,0,1,0,0);
    ctx.fillStyle="#fff";
    ctx.font="24px Poppins, sans-serif";
    ctx.textAlign="left";
    ctx.fillText(`Radijus: ${Math.floor(blob.r)}`,20,30);
    
    const elapsed = Math.floor((Date.now()-startTime)/1000);
    ctx.fillText(`Vrijeme: ${elapsed}s`,20,60); 
    
    let hudY = 90;
    if(speedBoostDuration>0){
        ctx.fillStyle="#00FFFF";
        ctx.fillText(`BOOST: ${Math.ceil(speedBoostDuration/60)}s`,20,hudY);
        hudY += 30;
    }
    if(shieldDuration>0){
        ctx.fillStyle="#FFD700";
        ctx.fillText(`ŠTIT: ${Math.ceil(shieldDuration/60)}s`,20,hudY);
        hudY += 30;
    }
    if(speedCharge>0){
        ctx.fillStyle="#FF6B35";
        ctx.fillText(`⚡ ${speedCharge}`,20,hudY);
        hudY += 30;
    }
    
    if(oblivionZone){
        ctx.fillStyle="#a052ff";
        ctx.fillText(`ZONA ZABORAVA: ${Math.ceil(oblivionZone.duration/60)}s`,20,hudY);
        hudY += 30;
    }
    
    if (window.isInAetherZone) {
        ctx.fillStyle="#FF00FF";
        ctx.fillText(`AETHER ZONA: GUBITAK MASE!`, 20, hudY); 
        hudY += 30;
    }
    
    if (Date.now() - lastEatTime > 7000) {
        ctx.fillStyle="#FF4D4D";
        ctx.fillText(`GLAD: SMANJUJETE SE!`, 20, hudY);
    }

    if(flashAlpha>0){
        ctx.setTransform(1,0,0,1,0,0);
        ctx.fillStyle=`rgba(255,255,255,${flashAlpha})`;
        ctx.fillRect(0,0,canvas.width,canvas.height);
        flashAlpha -= 0.05;
    }

    requestAnimationFrame(animate);
}

document.getElementById('pokreni-igru').addEventListener('click', ()=>{
    const name = document.getElementById('unos-imena').value.trim();
    const color = document.getElementById('odabir-boje').value;
    controlMode = document.getElementById('control-mode').value;
    window.difficultyMode = document.getElementById('difficulty-mode').value;
    
    if(name.length<3){ alert("Ime mora imati barem 3 znaka!"); return; }

    lobbyScreen.style.opacity='0';
    defeatScreen.style.display='none';
    setTimeout(()=>{
        lobbyScreen.style.display='none';
        canvas.style.display='block';
        startGame(name, color);
    }, 1000); 
});

document.getElementById('restart-game-button').addEventListener('click', ()=>{
    gameRunning = false;
    if (window.setGameRunning) window.setGameRunning(false);
    defeatScreen.style.display='none';
    lobbyScreen.style.display='flex';
    lobbyScreen.opacity='1';
}); 

document.getElementById('prikazi-pravila').addEventListener('click', () => {
    lobbyScreen.style.display = 'none';
    rulesScreen.style.display = 'flex';
});

document.getElementById('vrati-u-lobi').addEventListener('click', () => {
    rulesScreen.style.display = 'none';
    lobbyScreen.style.display = 'flex';
    lobbyScreen.style.opacity = '1';
});