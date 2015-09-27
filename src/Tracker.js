import theme from './theme';

export default class Tracker {

  constructor() {
    this.x = 0;
    this.y = 0;
    this.radius = 0;
    this.speed = 2;
    this.fill = theme.trackerColor;
    this.trackingPath = null;
  }

}