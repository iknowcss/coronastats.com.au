import {
  normaliseData,
  filterAfterDate,
  linest,
} from './dataUtil';

const MILLI_PER_DAY = 1000 * 86400;
const linestDaily = data => linest({ period: MILLI_PER_DAY }, data);

function generatePredictionData(coeff, startAestDate, endAestDate) {
  const endDate = new Date(`${endAestDate}T00:00:00.000+10:00`);
  endDate.setHours(endDate.getHours() + 12);

  const data = [];
  let date = new Date(`${startAestDate}T00:00:00.000+10:00`);
  while (date.getTime() < endDate.getTime()) {
    data.push({
      x: date,
      y: Math.exp(coeff.beta * (date.getTime() / MILLI_PER_DAY) + coeff.alpha)
    });
    date = new Date(date);
    date.setDate(date.getDate() + 1);
  }

  return data;
}

export function buildDatasets(options = {}, data) {
  const { predictStartDate, predictEndDate, label } = options;
  const processedData = normaliseData(data);
  const sampleData = filterAfterDate(predictStartDate, processedData);
  const predictionCoefficients = linestDaily(sampleData);
  const predictionData = generatePredictionData(predictionCoefficients, predictStartDate, predictEndDate);

  return [{
    label,
    data: processedData,
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
