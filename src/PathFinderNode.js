const IS_DIAGONAL_ALLOWED = true;
const COST_DIAGONAL = 14;
const COST_AXIS_ALIGNED = 10;

export default class PathFinderNode {

  constructor(index = 0, parent = null) {
    this.index = index;
    this.parent = parent;
    this.gCost = 0;
    this.hCost = 0;
    this.fCost = 0;
  }

  calcGCost(map, parent = null) {
    parent = parent || this.parent;

    const parentCost = parent ? parent.gCost : 0;
    const valueFactor = map.data[this.index] || 1;

    let isDiagonal = false;
    if (parent) {
      const col = this.index % map.cols;
      const row = Math.floor(this.index / map.cols);
      const parentCol = parent.index % map.cols;
      const parentRow = Math.floor(parent.index / map.cols);
      if (col !== parentCol && row !== parentRow) {
        isDiagonal = true;
      }
    }

    const diagonalCost = IS_DIAGONAL_ALLOWED ? COST_DIAGONAL : Infinity;
    const gCost = (isDiagonal ? diagonalCost : COST_AXIS_ALIGNED) * valueFactor;

    return parentCost + gCost;
  }

  calcHCost(map, endTile) {
    const col = this.index % map.cols;
    const row = Math.floor(this.index / map.cols);
    const endIndex = endTile.row * map.cols + endTile.col;
    const endCol = endIndex % map.cols;
    const endRow = Math.floor(endIndex / map.cols);

    const diffCols = Math.abs(endCol - col);
    const diffRows = Math.abs(endRow - row);

    return diffCols + diffRows;
  }

  setGCost(map) {
    this.gCost = this.calcGCost(map);
    this.setFCost();
  }

  setHCost(map, endTile) {
    this.hCost = this.calcHCost(map, endTile);
    this.setFCost();
  }

  setFCost() {
    this.fCost = this.gCost + this.hCost;
  }

  calcFCostWithParent(map, endTile, parentNode) {
    const gCost = this.calcGCost(map, parentNode);
    const hCost = this.calcHCost(map, endTile);
    return gCost + hCost;
  }

}