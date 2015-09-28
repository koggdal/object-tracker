import Tracker from './Tracker';
import Mouse from './Mouse';
import Tile from './Tile';
import theme from './theme';
import getMap from './getMap';
import renderer from './renderer';
import pathfinder from './pathfinder';

document.body.style.backgroundColor = theme.backgroundColor;

const map = getMap();
const tracker = new Tracker();
const mouse = new Mouse();

let initialized = false;
let currentTileSize = 1;
let currentPath = null;

renderer.setElement(document.getElementById('canvas'));
renderer.setMap(map);

renderer.keepSizeToWindow((tileSize) => {
  currentTileSize = tileSize;

  tracker.radius = tileSize / 5;

  render();
});

mouse.setMoveHandler((x, y) => {
  update();
});

mouse.setClickHandler((x, y) => {
  const lockedX = renderer.convertToViewCoords('x', x);
  const lockedY = renderer.convertToViewCoords('y', y);
  const currentCol = Math.min(map.cols - 1, Math.floor(lockedX / currentTileSize));
  const currentRow = Math.min(map.rows - 1, Math.floor(lockedY / currentTileSize));

  const index = (currentRow * map.rows) + currentCol;
  const tileValue = map.data[index];

  if (map.locked) {
    // When clicking the locked title, unlock.
    if (map.lockedCol === currentCol && map.lockedRow === currentRow) {
      map.locked = false;
    }
    // Else toggle what's at the coordinate of the map.
    else {
      map.data[index] = 1 - map.data[index];
    }
  }
  else {
    if (tileValue === 0) {
      map.locked = true;
      map.lockedCol = currentCol;
      map.lockedRow = currentRow;
    }
  }

  update();
});

function update() {
  const trackerCol = Math.floor(tracker.x / currentTileSize);
  const trackerRow = Math.floor(tracker.y / currentTileSize);
  const mouseX = renderer.convertToViewCoords('x', mouse.x);
  const mouseY = renderer.convertToViewCoords('y', mouse.y);
  const mouseCol = Math.floor(mouseX / currentTileSize);
  const mouseRow = Math.floor(mouseY / currentTileSize);
  const mouseWithinX = mouseCol >= 0 && mouseCol < map.cols;
  const mouseWithinY = mouseRow >= 0 && mouseRow < map.rows;

  if (!mouseWithinX || !mouseWithinY) {
    currentPath = null;
    return;
  }

  const start = new Tile(trackerRow, trackerCol);
  let end;
  if (map.locked)
    end = new Tile(map.lockedRow, map.lockedCol);
  else
    end = new Tile(mouseRow, mouseCol);

  currentPath = pathfinder.findPath(map, start, end);
}

function moveTracker() {
  if (!currentPath) return;

  const differentPath = tracker.trackingPath !== currentPath;

  if (differentPath) {
    currentPath.removeFirstIndex();
  }

  if (currentPath.hasReachedEnd()) return;

  const nextIndex = currentPath.getFirstIndex();
  const nextTileCol = nextIndex % map.cols;
  const nextTileRow = Math.floor(nextIndex / map.cols);
  const nextTileX = nextTileCol * currentTileSize + currentTileSize / 2;
  const nextTileY = nextTileRow * currentTileSize + currentTileSize / 2;

  if (differentPath || !tracker.incrementX || !tracker.incrementY) {
    const diffX = nextTileX - tracker.x;
    const diffY = nextTileY - tracker.y;
    const diffDiag = Math.sqrt(diffX * diffX + diffY * diffY);
    const steps = diffDiag / tracker.speed;
    const stepDiffX = diffX / steps;
    const stepDiffY = diffY / steps;

    tracker.incrementX = stepDiffX;
    tracker.incrementY = stepDiffY;
    tracker.trackingPath = currentPath;
  }

  const {incrementX, incrementY, x, y} = tracker;

  tracker.x += incrementX;
  tracker.y += incrementY;

  const hasReachedX = incrementX > 0 ? (nextTileX <= x) : (nextTileX >= x);
  const hasReachedY = incrementY > 0 ? (nextTileY <= y) : (nextTileY >= y);

  if (hasReachedX && hasReachedY) {
    currentPath.removeFirstIndex();
    tracker.incrementX = 0;
    tracker.incrementY = 0;
  }
}

function render() {
  if (!initialized) return;

  moveTracker();

  renderer.clear();
  renderer.renderMap(currentPath);
  renderer.renderTracker(tracker);
}

function tick() {
  requestAnimationFrame(tick);

  render();
}

initialized = true;
tick();
