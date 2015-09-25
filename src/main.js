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
  const trackerCol = Math.floor(tracker.x / currentTileSize);
  const trackerRow = Math.floor(tracker.y / currentTileSize);
  const mouseX = renderer.convertToViewCoords('x', mouse.x);
  const mouseY = renderer.convertToViewCoords('y', mouse.y);
  const mouseCol = Math.min(map.cols - 1, Math.floor(mouseX / currentTileSize));
  const mouseRow = Math.min(map.rows - 1, Math.floor(mouseY / currentTileSize));

  const start = new Tile(trackerRow, trackerCol);
  const end = new Tile(mouseRow, mouseCol);

  currentPath = pathfinder.findPath(map, start, end);
});

function render() {
  if (!initialized) return;

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
