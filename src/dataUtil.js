export const xxx = parts => new Date(`2020-${parts[0]}T${parts[1]}:00.000${parts[2]}`);

export const normaliseData = data => data.map(parts => ({
  x: xxx(parts),
  y: parts[3],
}));

export function filterAfterDate(aestDate, data) {
  const afterDate = aestDate instanceof Date
    ? aestDate
    : new Date(`${aestDate}T00:00:00.000+10:00`);
  return data.filter(c => c.y > 0 && c.x.getTime() >= afterDate.getTime());
}

export function filterBeforeDate(aestDate, data) {
  const afterDate = aestDate instanceof Date
    ? aestDate
    : new Date(`${aestDate}T00:00:00.000+10:00`);
  return data.filter(c => c.y > 0 && c.x.getTime() < afterDate.getTime());
}

const avg = set =>  set.reduce((sum, n) => sum + n, 0) / set.length;

export function linest(options = {}, data) {
  const { period } = options;
  // https://en.wikipedia.org/wiki/Simple_linear_regression#Fitting_the_regression_line
  const xvec = data.map(c => c.x.getTime() / period);
  const yvec = data.map(c => Math.log(c.y));
  const xavg = avg(xvec);
  const yavg = avg(yvec);
  const beta = xvec.reduce((sum, xi, i) => sum + (xi - xavg) * (yvec[i] - yavg), 0) /
    xvec.reduce((sum, xi) => sum + Math.pow(xi - xavg, 2), 0);
  const alpha = yavg - beta * xavg;

  return { alpha, beta };
}

export const linestDaily = data => linest({ period: 86400000 }, data);
