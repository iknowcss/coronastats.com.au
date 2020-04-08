import fminsearch from './util/fminsearch';

window.fminsearch = fminsearch;

export function filterAfterDate(date, data) {
  return data.filter(c => c.y > 0 && c.x.getTime() >= date.getTime());
}

export function filterBeforeDate(date, data) {
  return data.filter(c => c.y > 0 && c.x.getTime() < date.getTime());
}

export function filterBetweenDates(startDate, endDate, data) {
  return filterAfterDate(startDate, filterBeforeDate())
}

const avg = set =>  set.reduce((sum, n) => sum + n, 0) / set.length;

export function linest(options = {}, data) {
  const { period } = options;
  // https://en.wikipedia.org/wiki/Simple_linear_regression#Fitting_the_regression_line
  const xvec = data.map(c => c.x.getTime() / period);
  const yvec = data.map(c => c.y);
  const xavg = avg(xvec);
  const yavg = avg(yvec);
  const beta = xvec.reduce((sum, xi, i) => sum + (xi - xavg) * (yvec[i] - yavg), 0) /
    xvec.reduce((sum, xi) => sum + Math.pow(xi - xavg, 2), 0);
  const alpha = yavg - beta * xavg;

  return { alpha, beta };
}

export const linestDaily = data => linest({ period: 86400000 }, data);

export function logisticEstDaily(data) {
  const xvec = data.map(c => c.x.getTime() / 86400000);
  const yvec = data.map(c => c.y);
  const [min, max] = yvec.reduce((minmax, y) => [
    Math.min(y, minmax[0]),
    Math.max(y, minmax[1]),
  ], [Infinity, 0]);
  const midpoint = (max - min) / 2;
  const midpointX = yvec.findIndex(y => y >= midpoint);
  const x00 = xvec[midpointX];

  const [L, k, x0] = fminsearch(
    (x, P) => x.map(xi => P[0] / (1 + Math.exp(-P[1] * (xi - P[2])))),
    [max, 1, x00],
    xvec,
    yvec,
  );
  return { L, k, x0 };
}