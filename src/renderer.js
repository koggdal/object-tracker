import Path from './Path';
import theme from './theme';

const DPI_VALUE = window.devicePixelRatio || 1;

let canvasElement = null;
let canvasContext = null;
let currentMap = null;
let tileSize = 1;
let viewWidth = 1;
let viewHeight = 1;
let viewX = 0;
let viewY = 0;
let sizeChangeCallback = function () {};

/**
 * Convert a pixel value to device pixels.
 *
 * @param {number} value The value in "CSS" pixels.
 *
 * @return {number} The value in "device" pixels.
 */
function dpi(value) {
  return DPI_VALUE * value;
}

/**
 * Convert a coordinate from being relative to the document to being relative
 * to the rendered view.
 *
 * @param {string} axis The axis, 'x' or 'y'.
 * @param {number} value The coordinate value.
 *
 * @return {number} The converted coordinate value.
 */
function convertToViewCoords(axis, value) {
  return dpi(value) - (axis === 'x' ? viewX : viewY);
}

/**
 * Set the element to use for rendering.
 *
 * @param {HTMLCanvasElement} canvas A canvas element.
 */
function setElement(element) {
  canvasElement = element;
  canvasContext = element.getContext('2d');

  setSizes();
  sizeChangeCallback(tileSize, viewWidth, viewHeight);
}

/**
 * Set the map to use.
 *
 * @param {Map} map A Map instance.
 */
function setMap(map) {
  currentMap = map;

  setSizes();
  sizeChangeCallback(tileSize, viewWidth, viewHeight);
}

/**
 * Set various sizes based on current canvas size and the current map.
 */
function setSizes() {
  if (!currentMap) return;

  const viewMaxWidth = canvasElement.width - dpi(40);
  const viewMaxHeight = canvasElement.height - dpi(40);
  const tileWidth = Math.floor(viewMaxWidth / currentMap.cols);
  const tileHeight = Math.floor(viewMaxHeight / currentMap.rows);

  tileSize = Math.min(tileWidth, tileHeight);
  viewWidth = tileSize * currentMap.cols;
  viewHeight = tileSize * currentMap.rows;
  viewX = (canvasElement.width - viewWidth) / 2;
  viewY = (canvasElement.height - viewHeight) / 2;
}

/**
 * Set the dimensions of the canvas.
 * This also takes device pixel ratio into account.
 *
 * @param {number} width The width of the canvas in "CSS" pixels.
 * @param {number} height The height of the canvas in "CSS" pixels.
 */
function setCanvasSize(width, height) {
  canvasElement.width = dpi(width);
  canvasElement.height = dpi(height);
  canvasElement.style.width = width + 'px';
  canvasElement.style.height = height + 'px';

  setSizes();
  sizeChangeCallback(tileSize, viewWidth, viewHeight);
}

/**
 * Set the dimensions of the canvas to the size of the window and keep it sized
 * accordingly when resizing the window.
 *
 * @param {Function} callback Function to call when the size has changed. This
 *     is also called for the initial setting of dimensions.
 */
function keepSizeToWindow(callback) {
  sizeChangeCallback = callback;

  setCanvasSize(window.innerWidth, window.innerHeight);

  window.addEventListener('resize', () => {
    setCanvasSize(window.innerWidth, window.innerHeight);
  });
}

/**
 * Clear the canvas.
 */
function clear() {
  canvasContext.restore();
  canvasContext.save();

  canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

  canvasContext.translate(viewX, viewY);
}

/**
 * Render the map to the canvas.
 */
function renderMap(path) {
  if (!path) path = new Path();

  canvasContext.save();

  const mapData = currentMap.data;

  for (let i = 0, l = mapData.length; i < l; i++) {
    const col = i % currentMap.cols;
    const row = Math.floor(i / currentMap.cols);
    const x = col * tileSize;
    const y = row * tileSize;
    const tileValue = mapData[i];
    const isObstacle = tileValue === 1;
    const isInPath = path.hasIndex(i);

    if (isObstacle || isInPath) {
      if (isObstacle) {
        canvasContext.fillStyle = theme.obstacleColor;
        canvasContext.lineWidth = dpi(theme.obstacleBorderThickness);
        canvasContext.strokeStyle = theme.obstacleBorderColor;
      } else if (isInPath) {
        canvasContext.fillStyle = theme.pathColor;
        canvasContext.lineWidth = dpi(theme.pathBorderThickness);
        canvasContext.strokeStyle = theme.pathBorderColor;
      }
      canvasContext.fillRect(x, y, tileSize, tileSize);
    } else {
      canvasContext.lineWidth = dpi(theme.tileBorderThickness);
      canvasContext.strokeStyle = theme.tileBorderColor;
    }

    canvasContext.strokeRect(x, y, tileSize, tileSize);
  }

  canvasContext.lineWidth = dpi(theme.viewBorderThickness);
  canvasContext.strokeStyle = theme.viewBorderColor;
  canvasContext.strokeRect(0, 0, viewWidth, viewHeight);

  canvasContext.restore();
}

/**
 * Render the object that will track a target.
 *
 * @param {Tracker} tracker A Tracker instance.
 */
function renderTracker(tracker) {
  const {x, y, radius} = tracker;

  canvasContext.save();

  canvasContext.fillStyle = tracker.fill;
  canvasContext.beginPath();
  canvasContext.arc(x, y, radius, 0, Math.PI * 2, false);
  canvasContext.closePath();
  canvasContext.fill();

  canvasContext.restore();
}

export default {
  dpi,
  convertToViewCoords,
  setElement,
  setMap,
  keepSizeToWindow,
  clear,
  renderMap,
  renderTracker
};
