import ECS from 'yagl-ecs';
import globals from 'globals';
import lineShot from 'entities/lineShot';
import PixiVector from 'PixiVector';

export default class Attack extends ECS.System {
  constructor (ecs, freq) {
    super(freq);
    this.ecs = ecs;
    this.enemies = {};
  }

  test (entity) {
    return (entity.components.enemy && entity.components.sprite) ||
      (entity.components.range && entity.components.attack && entity.components.sprite);
  }

  enter (entity) {
    if (entity.components.enemy) this.enemies[entity.id] = entity;
  }

  exit (entity) {
    if (entity.components.enemy) delete this.enemies[entity.id];
  }

  update (entity) {
    let { range, attack, sprite } = entity.components;
    if (range && attack) {
      let {position: pos} = sprite.pixiSprite;
      for (let enemy of Object.values(this.enemies)) {
        let {position: enemyPos} = enemy.components.sprite.pixiSprite;
        if (pos.distance(enemyPos) <= range.range * globals.slotSize) {
          let posVec = new PixiVector(pos.x, pos.y);
          let enemyPosVec = new PixiVector(enemyPos.x, enemyPos.y);
          sprite.pixiSprite.rotation = ((enemyPosVec.subtract(posVec)).horizontalAngle);

          if (attack.timeSinceLastAttack >= (1 / attack.rate)) {
            this.attack(entity, enemy);
            attack.timeSinceLastAttack = 0;
          }
        }
      }

      attack.timeSinceLastAttack += window.dt;
    }
  }

  attack(tower, enemy) {
    let {position: origin} = tower.components.sprite.pixiSprite;
    let {position: target} = enemy.components.sprite.pixiSprite;
    this.ecs.addEntity(lineShot(origin, target));
    enemy.components.health.health -= tower.components.attack.damage;
  }
};
