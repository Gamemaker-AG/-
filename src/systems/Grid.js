import * as PIXI from 'pixi.js';
import globals from 'globals';
import ECS from 'yagl-ecs';
import PixiVector from 'PixiVector';
import PriorityQueue from '@raymond-lam/priority-queue';

export default class Grid extends ECS.System {
  constructor (freq) {
    super(freq);
    this.new_costs = this.initializedArray(globals.slotCount, globals.slotCount, 1.0);
  }

  initializedArray(xSize, ySize, value, edgeValue = Infinity) {
    let len = 0;
    let result = [];
    for (let y = 0; y < ySize; y++) {
      let row = [];
      let fieldValue = value;
      if (y === ySize - 1 || y === 0) {
        fieldValue = edgeValue;
      }
      for (let x = 0; x < xSize; x++) {
        if (x === xSize - 1 || x === 0) {
          row.push(edgeValue);
        } else {
          row.push(fieldValue);
        }
      }
      result.push(row);
    }
    return result;
  }

  preUpdate () {
    this.calculatePaths = [];
    this.costs = this.new_costs;
    this.new_costs = this.initializedArray(globals.slotCount, globals.slotCount, 1.0);
  }

  test (entity) {
    return Boolean(entity.components.gridPosition);
  }

  update (entity) {
    let avoidAttacks = true;
    if (entity.components.obstacle) {
      if (avoidAttacks) {
        if (entity.components.range) {
          for (let x = 0; x < globals.slotCount; x++) {
            for (let y = 0; y < globals.slotCount; y++) {
              let slot_pos = new PixiVector(x, y);
              let tower_pos = entity.components.sprite.pixiSprite.position.toGrid();
              let distance = slot_pos.distance(tower_pos);
              console.log(distance);
              if (distance <= entity.components.range.range) {
                this.new_costs[x][y] += entity.components.attack.damage * entity.components.attack.rate * 10000;
              }
            }
          }
        }
      }
      this.new_costs[entity.components.gridPosition.x][entity.components.gridPosition.y] += entity.components.obstacle.cost;
      return;
    }
    if (!entity.components.enemy) {
      return;
    }
    if (entity.components.goal) {
      let {x, y} = entity.components.goal;
      let path = this.findPath(entity, x, y);
      if (entity.components.goalPath === undefined) {
        entity.addComponent('goalPath', {
          path: path
        });
      } else {
        entity.path_updated = true;
        entity.components.goalPath.path = path;
      }
      entity.pathUpdated = true;
    }
  }

  findPath (entity, goalX, goalY) {
    let frontier = new PriorityQueue([], (self, other) => {
      if (self[1] > other[1]) {
        return 1;
      }
      if (self[1] < other[1]) {
        return -1;
      } else {
        return 0;
      }
    });
    let visited = [];
    let startX = entity.components.gridPosition.x;
    let startY = entity.components.gridPosition.y;

    frontier.enqueue([[[startX, startY]], 1 + heuristic([startX, startY], [goalX, goalY])]);

    let current = undefined;
    let i = 0;
    while (current = frontier.dequeue()) {
      i++;
      if (current === undefined) {
        return undefined;
      } else {
        let path = current[0];
        let [x, y] = path[path.length - 1];
        for (let pos of neighbors(x, y)) {
          if (!alreadyVisited(pos, visited)) {
            if (pos[0] === goalX && pos[1] === goalY) {
              let cost = 0;
              for (let el of path) {
                cost += this.costs[el[0]][el[1]];
              }
              return path.concat([[goalX, goalY]]);
            };
            let cost = 0;
            let newPath = path.concat([pos]);
            for (let el of newPath) {
              cost += this.costs[el[0]][el[1]];
            }
            visited.push(pos);
            frontier.enqueue([newPath, cost + heuristic(pos, [goalX, goalY])]);
          }
        }
      }
    }
  }

  postUpdate () {
    this.costs = this.new_costs;
  }
}

function alreadyVisited (pos, visited) {
  return typeof visited.find((visitedPosition) => {
    return pos[0] == visitedPosition[0] &&
      pos[1] == visitedPosition[1];
  }) !== 'undefined';
}

function heuristic (current, goal) {
  let [x, y] = current;
  let [goalX, goalY] = goal;
  return Math.abs(x - goalX) + Math.abs(y - goalY);
}

function neighbors (x, y) {
  let xs = [x - 1, x + 1].filter((x) => { return x >= 0 && x < globals.slotCount; });
  let ys = [y - 1, y + 1].filter((y) => { return y >= 0 && y < globals.slotCount; });
  let positions = [];
  for (let newX of xs) {
    positions.push([newX, y]);
  }
  for (let newY of ys) {
    positions.push([x, newY]);
  }
  return positions;
}
