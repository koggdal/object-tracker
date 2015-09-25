import Path from './Path';
import PathFinderNode from './PathFinderNode';

/**
 * Finds the best path from start to end in the provided map.
 *
 * @param {Map} map A Map instane.
 * @param {Tile} start The tile to start from.
 * @param {Tile} end The tile to end at.
 *
 * @return {Path} A Path instance.
 */
function findPath(map, start, end) {
  const path = new Path();
  const openList = [];
  const closedList = [];
  const nodeCache = {};
  const mapData = map.data;
  const startIndex = start.row * map.cols + start.col;
  const endIndex = end.row * map.cols + end.col;

  nodeCache[startIndex] = createNode(map, end, startIndex);

  openList.push(nodeCache[startIndex]);

  while (true) {

    // Find node in Open list with lowest F cost
    const currentNode = openList.reduce((lowestNode, node) => {
      if (!lowestNode || lowestNode.fCost > node.fCost) {
        return node;
      }
      return lowestNode;
    }, null);

    if (!currentNode) {
      break;
    }

    // Remove from Open list
    openList.splice(openList.indexOf(currentNode), 1);

    // Add to Closed list
    closedList.push(currentNode);

    if (currentNode.index === endIndex) {
      let nodeInPath = currentNode;
      while (nodeInPath) {
        if (nodeInPath.index !== startIndex && nodeInPath.index !== endIndex) {
          path.addIndex(nodeInPath.index);
        }
        nodeInPath = nodeInPath.parent;
      }
      break;
    }

    const neighbors = getNeighbors(map, end, nodeCache, currentNode);

    neighbors.forEach((neighbor) => {
      if (closedList.indexOf(neighbor) > -1) {
        return; // Skip to next neighbor
      }

      const fCostWithCurrent = neighbor.calcFCostWithParent(
        map, end, currentNode
      );
      const isShorter = fCostWithCurrent < neighbor.fCost;
      const isInOpenList = openList.indexOf(neighbor) > -1;

      if (isShorter || !isInOpenList) {
        neighbor.parent = currentNode;
        neighbor.setGCost(map);

        if (!isInOpenList) {
          openList.push(neighbor);
        }
      }
    });
  }

  return path;
}

/**
 * Create a new node.
 *
 * @param {Map} map A Map instance.
 * @param {number} index The index in the map.
 * @param {PathFinderNode=} parent Optional parent node.
 *
 * @return {PathFinderNode} The node.
 */
function createNode(map, endTile, index, parent) {
  const node = new PathFinderNode(index, parent);
  node.setGCost(map);
  node.setHCost(map, endTile);
  return node;
}

/**
 * Get the nodes that are surrounding the passed node.
 *
 * @param {Map} map A Map instance.
 * @param {Tile} end The end tile.
 * @param {Object} nodeCache Object where keys are indices and values are nodes.
 * @param {PathFinderNode} node The node to look from.
 *
 * @return {Array.<PathFinderNode>} An array of nodes.
 */
function getNeighbors(map, end, nodeCache, node) {
  const col = node.index % map.cols;
  const row = Math.floor(node.index / map.cols);

  const neighbors = [];

  const conditionals = [
    col + 1 < map.cols,
    col + 1 < map.cols && row + 1 < map.rows,
    row + 1 < map.rows,
    col - 1 >= 0 && row + 1 < map.rows,
    col - 1 >= 0,
    col - 1 >= 0 && row - 1 >= 0,
    row - 1 >= 0,
    col + 1 < map.cols && row - 1 >= 0
  ];

  const indices = [
    row * map.cols + col + 1,
    (row + 1) * map.cols + col + 1,
    (row + 1) * map.cols + col,
    (row + 1) * map.cols + col - 1,
    row * map.cols + col - 1,
    (row - 1) * map.cols + col - 1,
    (row - 1) * map.cols + col,
    (row - 1) * map.cols + col + 1,
  ];

  conditionals.forEach((condition, i) => {
    if (condition) {
      const index = indices[i];
      const tileValue = map.data[index];
      if (tileValue !== 1) {
        nodeCache[index] = nodeCache[index] || createNode(map, end, index, node);
        neighbors.push(nodeCache[index]);
      }
    }
  });

  return neighbors;
}

export default {
  findPath
};
