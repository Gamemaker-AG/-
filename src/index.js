import * as PIXI from 'pixi.js';
import ECS from 'yagl-ecs';
import Vector from 'vigur';

import Render from './systems/Render.js';
import Movement from './systems/Movement.js';
import Sprite from './components/Sprite.js';
import ButtonSystem from 'systems/Button';
import Button from 'components/Button';
import createGameEntities from 'createGameEntities';
import globals from 'globals';

const game = newGameState();
const menu = newGameState();
let current_state = game;
let ticker, renderer;

function newGameState () {
  return {
    stage: new PIXI.Container(),
    ecs: new ECS()
  };
}

function gameLoop () {
  window.dt = ticker.deltaTime;
  current_state.ecs.update();
  renderer.render(current_state.stage);
}

function startGame () {
  renderer = PIXI.autoDetectRenderer(globals.width, globals.height, {
    resolution: window.devicePixelRatio || 1
  });
  renderer.backgroundColor = 0xFFFFFF;
  document.body.appendChild(renderer.view);
  document.body.style.margin = '0';

  menu.ecs.addSystem(new Render(renderer, menu.stage, globals.width, globals.height));
  menu.ecs.addSystem(new ButtonSystem());

  game.ecs.addSystem(new Render(renderer, game.stage, globals.width, globals.height));
  game.ecs.addSystem(new ButtonSystem());
  game.ecs.addSystem(new Movement());

  // let entity = new ECS.Entity(null, [Sprite, Button]);
  // let redSquare = entity.components.sprite;
  // redSquare.pixiSprite = new PIXI.Sprite.fromImage('red_square');
  // redSquare.pixiSprite.position.set(100, 0);
  // menu.ecs.addEntity(entity);

  // let entity2 = new ECS.Entity(null, [Sprite]);
  // let newGame = entity2.components.sprite;
  // newGame.pixiSprite = new PIXI.Text('New Game',
  //   {fontFamily: 'Arial', fontSize: 32, fill: 'blue'});
  // newGame.pixiSprite.position.set(100, 100);
  // newGame.interactive = true;
  // menu.ecs.addEntity(entity2);

  createGameEntities().forEach(e => game.ecs.addEntity(e));

  ticker = new PIXI.ticker.Ticker();
  ticker.add(gameLoop);
  ticker.start();
}

PIXI.loader
  .add('red_square', '/img/red_square.png')
  .add('tower_weak', '/img/tower_weak.png')
  .add('tower_strong', '/img/tower_strong.png')
  .add('tower_long', '/img/tower_long.png')
  .add('slot', '/img/slot.png')
  .load(startGame);
