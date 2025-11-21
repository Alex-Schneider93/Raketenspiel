
const app = new PIXI.Application();
document.body.appendChild(app.view);
const rocket = PIXI.Sprite.from('assets/rocket.png');
rocket.x=350
rocket.y =520
rocket.scale.y=0.05;
rocket.scale.x=0.05;
app.stage.addChild(rocket);



gameInterval(function(){
    const ufo = PIXI.Sprite.from('assets/ufo1.png');
    ufo.x=random(0,700);
    ufo.y =-25
    ufo.scale.y=0.1;
    ufo.scale.x=0.1;
    app.stage.addChild(ufo);
    flyDown(ufo,1)
},1000)

function leftKeyPressed() {
    rocket.x -= 5;
}

function rightKeyPressed() {
    rocket.x += 5;
}

