export class MinMaxScaler {
  constructor(featureRange = [0, 1]) {
    this.min = null;
    this.max = null;
    this.range = featureRange;
  }

  fit(data) {
    const flat = data.flat();
    this.min = Math.min(...flat);
    this.max = Math.max(...flat);
  }

  transform(data) {
    const [rangeMin, rangeMax] = this.range;

    return data.map(row =>
      row.map(x => {
        if (this.max === this.min) return 0; // avoid divide by zero
        return (
          ((x - this.min) / (this.max - this.min)) *
            (rangeMax - rangeMin) +
          rangeMin
        );
      })
    );
  }

  fitTransform(data) {
    this.fit(data);
    return this.transform(data);
  }
}