import { filterAfterDate } from './dataUtil';

const MILLI_PER_DAY = 1000 * 86400;

function generatePredictionData(fn, startAestDate, endAestDate) {
  const data = [];
  const endDate = new Date(`${endAestDate}T00:00:00.000+10:00`);
  endDate.setHours(endDate.getHours() + 12);

  let date = new Date(`${startAestDate}T00:00:00.000+10:00`);
  while (date.getTime() < endDate.getTime()) {
    data.push({
      x: date,
      y: fn(date.getTime() / MILLI_PER_DAY),
    });
    date = new Date(date);
    date.setDate(date.getDate() + 1);
  }

  return data;
}

export function buildDatasets(options = {}, data) {
  const { predictStartDate, predictEndDate, fitter, label } = options;
  const sampleData = filterAfterDate(predictStartDate, data);
  const predictionData = generatePredictionData(fitter(sampleData), predictStartDate, predictEndDate);

  return [{
    label,
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
    data: predictionData,
    borderColor: '#27CFC5',
    backgroundColor: 'transparent',
    borderWidth: 2,
    pointRadius: 0,
    showLine: true
  }];
}
