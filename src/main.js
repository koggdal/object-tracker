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

function update() {
  const trackerCol = Math.floor(tracker.x / currentTileSize);
  const trackerRow = Math.floor(tracker.y / currentTileSize);
  const mouseX = renderer.convertToViewCoords('x', mouse.x);
  const mouseY = renderer.convertToViewCoords('y', mouse.y);
  const mouseCol = Math.min(map.cols - 1, Math.floor(mouseX / currentTileSize));
  const mouseRow = Math.min(map.rows - 1, Math.floor(mouseY / currentTileSize));

  const start = new Tile(trackerRow, trackerCol);
  const end = new Tile(mouseRow, mouseCol);

  currentPath = pathfinder.findPath(map, start, end);
}

function moveTracker() {
  if (!currentPath) return;

  if (currentPath.hasReachedEnd()) return;

  const differentPath = tracker.trackingPath !== currentPath;

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

  tracker.x += tracker.incrementX;
  tracker.y += tracker.incrementY;

  const hasReachedX = (tracker.x >= nextTileX - 1) && (tracker.x <= nextTileX + 1);
  const hasReachedY = (tracker.y >= nextTileY - 1) && (tracker.y <= nextTileY + 1);

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
