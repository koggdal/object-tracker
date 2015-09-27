export default class Path {

  constructor() {
    this.indexMap = {};
    this.indices = [];
  }

  addIndex(index) {
    this.indices.push(index);
    this.indexMap[index] = true;
  }

  hasIndex(index) {
    return !!this.indexMap[index];
  }

  getFirstIndex() {
    return this.indices[this.indices.length - 1];
  }

  removeFirstIndex() {
    this.indices.pop();
  }

  hasReachedEnd() {
    return this.indices.length === 0;
  }

}