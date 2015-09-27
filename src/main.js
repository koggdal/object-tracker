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
  const mouseCol = Math.floor(mouseX / currentTileSize);
  const mouseRow = Math.floor(mouseY / currentTileSize);
  const mouseWithinX = mouseCol >= 0 && mouseCol < map.cols;
  const mouseWithinY = mouseRow >= 0 && mouseRow < map.rows;

  if (!mouseWithinX || !mouseWithinY) {
    currentPath = null;
    return;
  }

  const start = new Tile(trackerRow, trackerCol);
  const end = new Tile(mouseRow, mouseCol);

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
