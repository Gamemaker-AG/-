import * as PIXI from 'pixi.js';
import ECS from 'yagl-ecs';
import { hasSprite } from 'components/Sprite';
import globals from 'globals';

export default class InfoPanel extends ECS.System {
  constructor () {
    super();
  }

  test (entity) {
    return hasSprite(entity) && entity.components.infoPanelUpdater;
  }

  update (entity) {
    let text_gold = childAt(entity, 0).text;
    let text_lifes = childAt(entity, 1).text;
    let text_score = childAt(entity, 2).text;


    if (text_gold != globals.player.gold) {
      childAt(entity, 0).text = globals.player.gold.toString();
    }

    if (text_lifes != globals.player.lifes) {
      childAt(entity, 1).text = globals.player.lifes.toString();
    }

    if (text_score != globals.player.score) {
      childAt(entity, 2).text = globals.player.score.toString();
    }
  }
};

function childAt (entity, pos) {
  return entity.components.sprite.pixiSprite.getChildAt(pos);
}
