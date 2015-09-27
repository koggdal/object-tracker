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
  const mouseCol = Math.min(map.cols - 1, Math.floor(mouseX / currentTileSize));
  const mouseRow = Math.min(map.rows - 1, Math.floor(mouseY / currentTileSize));

  const start = new Tile(trackerRow, trackerCol);
  let end;
  if (map.locked)
    end = new Tile(map.lockedRow, map.lockedCol);
  else
    end = new Tile(mouseRow, mouseCol);

  currentPath = pathfinder.findPath(map, start, end);
}

function render() {
  if (!initialized) return;

  renderer.clear();
  renderer.renderMap(currentPath);
  renderer.renderTracker(tracker);
}

function tick() {
  requestAnimationFrame(tick);

  // tracker.y += 2;
  update();

  render();
}

initialized = true;
tick();
