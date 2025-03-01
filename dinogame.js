const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const image_names = ['bird', 'cactus', 'dino'];
const SPEED_SETTING = {
  unit: 500,
  speed: 10,
  playbackRate: 0.1,
}
let additionalMoveSpeed = 0;

const game = {
  counter: 0,
  backGrounds: [],
  bgm1: new Audio('bgm/USAnthem.wav'),
  bgm2: new Audio('bgm/jump.mp3'),
  enemies: [],
  enemyCountdown:0,
  image: {},
  isGameOver: true,
  score: 0,
  state: 'loading',
  timer: null
};
game.bgm1.loop = true;

let imageLoaderCounter = 0;
for (const imageName of image_names) {
  const imagePath = `images/${imageName}.png`;
  game.image[imageName] = new Image();
  game.image[imageName].src = imagePath;
  game.image[imageName].onload = () => {
    imageLoaderCounter += 1;
    if (imageLoaderCounter === image_names.length) {
      console.log('Finished proccessing images');
      init();
    }
  }
}

function init() {
  game.counter = 0;
  game.enemies = [];
  game.enemyCountdown=0;
  game.score = 0;
  game.state = 'init';
  game.bgm1.playbackRate=1
  additionalMoveSpeed=0
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  createDino();
  drawDino();
  createBackGround();
  drawBackGrounds();
  ctx.fillStyle = 'black';
  ctx.font = 'bold 60px serif';
  ctx.fillText(`Press Space key`, 60, 150);
  ctx.fillText(`to start.`, 150, 230);
}

function start() {
  game.state = 'gaming';
  game.bgm1.play();
  game.timer = setInterval(ticker, 30);
}

function ticker() {
  if (game.score > 0 && game.score % SPEED_SETTING.unit === 0) {
    additionalMoveSpeed += SPEED_SETTING.speed;
    game.bgm1.playbackRate += SPEED_SETTING.playbackRate;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if(game.counter%10===0){
    createBackGround();
  }

  createEnemies();

  moveBackGrounds();
  moveDino();
  moveEnemies();

  drawBackGrounds();
  drawDino();
  drawEnemies();
  drawScore();

  hitCheck();

  game.score+=1
  game.counter = (game.counter + 1) % 1000000;
  game.enemyCountdown-=1;
}

function createDino() {
  game.dino = {
    x: game.image.dino.width / 2,
    y: canvas.height - game.image.dino.height,
    moveY: 0,
    width: game.image.dino.width,
    height: game.image.dino.height,
    image: game.image.dino
  }
}

function createBackGround(){
  game.backGrounds=[];
  for(let x=0; x<=canvas.width; x+=200){
    game.backGrounds.push({
      x: x,
      y: canvas.height,
      width: 200,
      moveX: -20,
    });
  }
}

function createCactus(createX) {
  game.enemies.push({
    x: createX,
    y: canvas.height - game.image.cactus.height / 2,
    width: game.image.cactus.width,
    height: game.image.cactus.height,
    moveX: -10,
    image: game.image.cactus
  });
}

function createBird() {
  const birdY = Math.random() * (300 - game.image.bird.height) + 150;
  game.enemies.push({
    x: canvas.width + game.image.bird.width / 2,
    y: birdY,
    width: game.image.bird.width,
    height: game.image.bird.height,
    moveX: -15,
    image: game.image.bird
  });
}

function createEnemies(){
  if(game.enemyCountdown===0){
    game.enemyCountdown=60-Math.floor(game.score/100);
    if (game.enemyCountdown<=30) game.enemyCountdown=30;
    switch(Math.floor(Math.random()*3)){
      case 0:
        createCactus(canvas.width+game.image.cactus.width/2);
        break;
      case 1:
        createCactus(canvas.width+game.image.cactus.width/2);
        createCactus(canvas.width+game.image.cactus.width*3/2);
        break;
      case 2:
        createBird();
        break;
    }
  }
}

function moveBackGrounds(){
  for(const backGrounds of game.backGrounds){
    backGrounds.x += backGrounds.moveX - additionalMoveSpeed;
  }
}

function drawBackGrounds(){
  ctx.fillStyle='sienna';
  for (const backGrounds of game.backGrounds){
    ctx.fillRect(backGrounds.x, backGrounds.y-5, backGrounds.width, 5);
    ctx.fillRect(backGrounds.x+20, backGrounds.y-10, backGrounds.width-40, 5);
    ctx.fillRect(backGrounds.x+50, backGrounds.y-15, backGrounds.width-100, 5);
  }
}

function moveDino() {
  game.dino.y += game.dino.moveY;
  if (game.dino.y >= canvas.height - game.dino.height / 2) {
    game.dino.y = canvas.height - game.dino.height / 2;
    game.dino.moveY = 0;
  } else {
    game.dino.moveY += 3;
  }
}

function moveEnemies() {
  for (const enemy of game.enemies) {
    enemy.x += enemy.moveX  - additionalMoveSpeed;
  }
  game.enemies = game.enemies.filter(enemy => enemy.x > -enemy.width);
}

function drawDino() {
  ctx.drawImage(game.image.dino, game.dino.x - game.dino.width / 2, game.dino.y - game.dino.height / 2, 110, 120);
}

function drawEnemies() {
  for (const enemy of game.enemies) {
    ctx.drawImage(enemy.image, enemy.x - enemy.width / 2, enemy.y - enemy.height / 2);
  }
}

function drawScore(){
  ctx.fillStyle='black';
  ctx.font='24px serif';
  ctx.fillText(`score: ${game.score}`, 0, 30);
}

function hitCheck(){
  for (const enemy of game.enemies){
    if(
      Math.abs(game.dino.x - enemy.x) < game.dino.width * 0.8 / 2 + enemy.width * 0.9 / 2 &&
      Math.abs(game.dino.y - enemy.y) < game.dino.height * 0.5 / 2 + enemy.height * 0.9 / 2
    ){
      game.state = 'gameover';
      game.bgm1.pause();
      ctx.fillStyle='black';
      ctx.font='bold 100px serif';
      ctx.fillText(`Game Over!`, 150, 200);
      clearInterval(game.timer);
    }
  }
}

document.onkeydown = (e) => {
  if(e.code === 'Space' && game.state === 'init') {
    start();
  }
  if (e.code === 'Space' && game.dino.moveY === 0) {
    game.dino.moveY = -41;
    game.bgm2.play();
  }
  if (e.code === 'Enter' && game.state === 'gameover') {
    init();
  }
};

// const dinoImage = new Image();
// dinoImage.src = `images/dino.png`
// dinoImage.onload = () => {
//   ctx.drawImage(dinoImage, 0, 320, 108, 108);
// };