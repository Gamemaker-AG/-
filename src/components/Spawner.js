import PixiVector from 'PixiVector';
import globals from 'globals';

const { slotCount } = globals;

export default {
  name: 'spawner',
  defaults: {
    timeSinceSpawn: 0,
    enemyImageName: 'tower_strong',
    enemyComponents: (x, y) => {
      return {
        'enemy': {},
        'gridPosition': {x, y},
        'movement': {
          velocity: new PixiVector(0, 0),
          angularVelocity: 0,
          maxSpeed: 100
        },
        'goal': {x: Math.floor(slotCount / 2), y: slotCount - 1},
        'autoUpdateGridPosition': {},
        'followPath': {},
        'health': {health: 50}
      };
    },
    count: 0,
    interval: 1
  }
};
