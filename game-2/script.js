// the name of the game is a reference to song 2 by blur. Because there is no song 1, by blur, there is also no game 1, by me

let game;

let gameOptions = {
}
 
window.onload = function() {

  let gameConfig = {
    type: Phaser.AUTO,
    scene: [ts, pg, ds],
    backgroundColor: 0x444444,

    physics: {
      default: "arcade",
        arcade: {
          gravity: { y: 1000 },
          debug: false
        }
    },

    scale: {
      parent: 'main',
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 450,
      height: 800
    }
  }

  game = new Phaser.Game(gameConfig);
}

class playGame extends Phaser.Scene{
  constructor(){
    super("playGame");
    this.xBounds = -20;
    this.yBounds = -4030;
    this.xSize = 490;
    this.ySize = 4830;
    
    //best is 11 but you can do better, i believe in you
    this.speed = 1;

    //never
    this.character = "matt";
  }

  preload(){
    this.load.image('ar', 'assets/ar.png');
    this.load.image('ar2', 'assets/ar2.png');
    this.load.image('matt', 'assets/matt.png');
    this.load.image('bar', 'assets/bluebar.png');
    this.load.image('brick', 'assets/brick.png');
    this.load.image('brickEdge', 'assets/brickEdge.png');
    this.load.image('bouncer', 'assets/bouncer.png');
    this.load.image('bouncerEdge', 'assets/edge.png');
    this.load.image('bouncerGuard', 'assets/guard.png');
    this.load.image('life', 'assets/life.png');
    this.load.image('lifeUp', 'assets/life.png');
    this.load.image('startLine', 'assets/startLine.png');
    this.load.image('killLine', 'assets/killLine.png');
    this.load.image('goalLine', 'assets/goalLine.png');
  }

  create(){
    //just a bunch of variables and like 90% are probably unnecessary
    this.arrowL;
    this.arrowR;
    this.leftDown = false;
    this.rightDown = false;
    this.bounce = false;
    this.cursors;
    this.lmv = false;
    this.rmv = false;
    this.player;
    this.playerHealth = 3;
    this.invTimer = 0;
    this.started = false;

    // i did it. I added pointer control. My baby is finally growing up ! :)
    // pleaseeee test on mobile devices fr dog, remember next time
    // tested on mobile devices and it don't work uh oh
    // vvvvvv it worked because of this line vvvvvvv
    this.input.addPointer(1);

    //WORLD
    this.physics.world.setBounds(this.xBounds, this.yBounds, this.xSize, this.ySize, false, false, true, true);

    this.currentLevel = this.add.text(10, 10, 1, { fontFamily: '"Verdana"' }).setScale(2);

    //PLAYER
    this.player = this.physics.add.sprite(225, 575, 'matt');
    this.player.setCollideWorldBounds(false);

    //BOUNCE PADS
    this.bouncers = this.physics.add.staticGroup();
    this.bouncerEdges = this.physics.add.staticGroup();
    this.firstBnce = this.bouncers.create(100, 630, 'bouncer');
    var i = 1
    for (i; i<20; i++){
      this.createBouncer(Phaser.Math.Between(70, 380), -(i*225)+630);
    }

    //DEATH
    // this.killStatics = this.physics.add.staticGroup();

    //STATICS
    this.statics = this.physics.add.staticGroup();
    // this.brickEdges = this.physics.add.staticGroup();
    // this.createBrick(10, 600);
    // this.createBrick(440, 600);
    // this.createBrick(225, 220);
    // this.createBrick(225, 155);
    // this.createBrick(225, 90);
    this.statics.create(225, 635, 'startLine');

    //POWER-UPS
    // this.healing = this.physics.add.staticGroup();
    // this.healing.create(100, -100, 'lifeUp');

    //KILL LINE
    this.killLine = this.physics.add.image(225, 700, 'killLine');
    this.killLine.body.allowGravity = false;

    //GOAL LINE
    this.goalLine = this.physics.add.image(225, this.yBounds+70, 'goalLine');
    this.goalLine.body.allowGravity = false;
    
    //CAMERA
    this.cam = this.cameras.main;
    this.cam.setBounds(0, this.yBounds, 450, this.ySize);
    this.cam.useBounds = true;
    this.cam.startFollow(pg.player, true);

    //UI
    // this.life = [];
    // var i = 0
    // while (i < 3) {
    //   this.life[i] = this.add.image(i*40+35, 35, 'life').setScrollFactor(0);
    //   i += 1;
    // }

    //CONTROLS
    this.arrowL = this.add.image(0, 730, 'ar').setOrigin(0,0).setScrollFactor(0).setInteractive();
    this.arrowR = this.add.image(225, 730, 'ar2').setOrigin(0,0).setScrollFactor(0).setInteractive();
    this.add.image(225, 720, 'bar').setScrollFactor(0).setInteractive();

    this.arrowL.on("pointerdown", function(){pg.leftDown = true;});
    this.arrowL.on("pointerout", function(){pg.leftDown = false;});
    this.arrowL.on("pointerup", function(){pg.leftDown = false;});
    this.arrowR.on("pointerdown", function(){pg.rightDown = true;});
    this.arrowR.on("pointerout", function(){pg.rightDown = false;});
    this.arrowR.on("pointerup", function(){pg.rightDown = false;});

    this.cursors = this.input.keyboard.createCursorKeys();
    this.pause = this.input.keyboard.addKey('p');
    this.pause.on('down', function(){
      if (pg.scene.isSleeping) {
        pg.scene.resume();
      } else {
        pg.scene.pause();
      }
    });

    //COLLIDERS
    this.physics.add.collider(this.player, this.statics);
    // this.physics.add.overlap(this.player, this.brickEdges, this.hurtPlayer);
    // this.physics.add.overlap(this.player, this.healing, this.healPlayer);
    this.physics.add.collider(this.player, this.bouncers, function(){
      pg.player.setVelocityY(-700);
      pg.started = true;
    });
    this.physics.add.collider(this.player, this.bouncerEdges);
    this.physics.add.overlap(this.player, this.killLine, this.killPlayer);
    this.physics.add.overlap(this.player, this.goalLine, this.nextLevel);
  }

  update(){
    this.arrowL.clearTint();
    this.arrowR.clearTint();
    pg.lmv = false;
    pg.rmv = false;
    pg.player.setVelocityX(0);

    this.currentLevel.text = this.speed

    this.invTimer -= 1
    if (this.invTimer > 0) {
      if (this.invTimer > 60) {
        pg.player.setTint(0x4444FF);
      } else if (this.invTimer > 30) {
        pg.player.setTint(0x7777FF);
      } else {
        pg.player.setTint(0xAAAAFF);
      }
    } else {
      pg.player.setTint(0xFFFFFF);
    }

    if (this.started == true){
      this.killLine.y -= this.speed/2;
    }

    if (!(this.killLine.y < this.cam.scrollY + 750)){
      this.killLine.y = this.cam.scrollY + 750
    }

    if (this.cursors.left.isDown || this.leftDown) {
      this.leftButton();
    }
    if (this.cursors.right.isDown || this.rightDown) {
      this.rightButton();
    }

    this.doMovement()

    this.physics.world.wrap(this.player);
  }

  leftButton(){
    pg.arrowL.setTint(0x444444);
    pg.lmv = true;
  }

  rightButton(){
    pg.arrowR.setTint(0x444444);
    pg.rmv = true;
  }

  doMovement(){
    if (pg.lmv && pg.rmv){
      pg.lmv = false;
      pg.rmv = false;
      pg.player.setVelocityX(0);
    }
    if (pg.lmv){
      pg.player.setVelocityX(-300);
    }
    if (pg.rmv){
      pg.player.setVelocityX(300);
    }
  }

  createBouncer(x,y){
    // pg.bouncerEdges.create(x-38, y, 'bouncerEdge')
    // pg.bouncerEdges.create(x+37, y, 'bouncerEdge')
    pg.bouncerEdges.create(x, y+5, 'bouncerGuard')
    pg.bouncers.create(x, y, 'bouncer');
  }

  createBrick(x,y){
    pg.brickEdges.create(x, y-34, 'brickEdge');
    pg.statics.create(x, y, 'brick');
  }

  hurtPlayer(){
    if (pg.invTimer <= 0) {
      if (pg.playerHealth <= 1) {
        pg.killPlayer()
      } else {
        pg.invTimer = 90;
        pg.life[pg.playerHealth - 1].visible = false;
        pg.playerHealth -= 1;
      }
    }
  }

  healPlayer(plyr, point){
    if (pg.playerHealth < 3){
      pg.playerHealth += 1;
      pg.life[pg.playerHealth - 1].visible = true;
    }
    point.destroy(); //destory life up
  }

  killPlayer(){
    pg.speed = 1;
    pg.scene.start(ds);
  }

  nextLevel(){
    pg.speed += 1;
    pg.scene.restart();
  }
};

class deathScreen extends Phaser.Scene{
  constructor(){
    super('deathScreen')
  }

  preload(){

  }

  create(){
    this.text = this.add.text(225, 100, 'you dead', { fontFamily: '"Verdana"' }).setScale(4).setOrigin(0.5, 0.5);
    this.textTween = this.tweens.add({
      targets: ds.text,
      x: 225, y: "+=50",
      ease: 'Linear', duration: 500,
      repeat: -1, yoyo: true
    })

    this.input.keyboard.on('keydown', function (){ ds.scene.start(ts); });
    this.input.on('pointerdown', function (){ ds.scene.start(ts); });
  }

  update(){
  }
}

class titleScreen extends Phaser.Scene{
  constructor(){
    super('titleScreen')
  }

  preload(){

  }

  create(){
    this.text = this.add.text(225, -100, 'Game 2', { fontFamily: '"Verdana"' }).setScale(4).setOrigin(0.5, 0.5);
    this.subText = this.add.text(225, -50, 'The Bouncing One', { fontFamily: '"Verdana"' }).setScale(2).setOrigin(0.5, 0.5);
    this.textTween = this.tweens.add({
      targets: [ts.text, ts.subText],
      x: 225, y: "+=300",
      ease: 'Bounce', duration: 1000,
      repeat: 0, yoyo: false
    })

    this.input.keyboard.on('keydown', function (){ ts.scene.start(pg); });
    this.input.on('pointerdown', function (){ ts.scene.start(pg); });
  }

  update(){
  }
}

var ts = new titleScreen();
var pg = new playGame();
var ds = new deathScreen();