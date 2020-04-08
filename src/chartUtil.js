const MILLI_PER_DAY = 1000 * 86400;

function generatePredictionData({ valueFn, startDate, endDate }) {
  const data = [];
  endDate.setHours(endDate.getHours() + 12);

  let date = new Date(startDate);
  const endTime = endDate.getTime();
  while (date.getTime() < endTime) {
    data.push({
      x: date,
      y: valueFn(date.getTime() / MILLI_PER_DAY),
    });
    date = new Date(date);
    date.setDate(date.getDate() + 1);
  }

  return data;
}

const avg = set =>  set.reduce((sum, n) => sum + n, 0) / set.length;

export function buildDatasets({ exponentialFitter, logisticFitter } = {}, data) {
  return [{
    label: '# cases',
    data,
    backgroundColor: 'rgba(255,255,255,0)',
    borderColor: '#DD6F6F',
    pointBorderColor: '#DD6F6F',
    borderWidth: 2,
    pointRadius: 3,
    pointHoverRadius: 5,
    pointHoverBackgroundColor: '#DD6F6F',
    pointHitRadius: 5
  }, {
    label: 'Prediction',
    data: generatePredictionData(exponentialFitter(data)),
    borderColor: '#27CFC5',
    backgroundColor: 'transparent',
    borderWidth: 2,
    pointRadius: 0,
    showLine: true
  }, {
    label: 'Prediction',
    data: generatePredictionData(logisticFitter(data)),
    borderColor: '#3B4144',
    backgroundColor: 'transparent',
    borderDash: [10, 5],
    borderWidth: 1,
    pointRadius: 0,
    showLine: true
  }];
}
