import { fetchData } from './data';
import { createElement, getCookies } from './browserUtil';
import { linestDaily, normaliseData, filterAfterDate } from './dataUtil';
import { buildDatasets } from './chartUtil';
import './ga';
import './index.scss';

const MILLI_PER_DAY = 1000 * 86400;
const DISPLAY_START_DATE = '2020-03-08';
const DEFAULT_PREDICT_END_DATE = '2020-04-12';
const GRAPH_Y_MIN = 5;
const GRAPH_Y_MAX = 10000;

function calculateDoublingRate(stateData) {
  const normalData = normaliseData(stateData.rawDataset);
  const sampleData = filterAfterDate(stateData.predictStartDate, normalData);
  const { beta } = linestDaily(sampleData);
  return Math.log(2) / beta;
}

function formatTimeHTML(days) {
  const daysFlr = Math.floor(days);
  const hoursFlr = Math.round((days - daysFlr) * 24);
  return `${daysFlr}&nbsp;day${daysFlr === 1 ? '' : 's'}, ${hoursFlr}&nbsp;hour${hoursFlr === 1 ? '' : 's'}`;
}

function estimateEasterNumber(stateData) {
  const normalData = normaliseData(stateData.rawDataset);
  const sampleData = filterAfterDate(stateData.predictStartDate, normalData);
  const { alpha, beta } = linestDaily(sampleData);

  return Math.round(Math.exp(beta * (new Date('2020-04-10T15:00:00.000+11:00').getTime() / MILLI_PER_DAY) + alpha));

}

const graph = new Chart(document.getElementById('graph').getContext('2d'), {
  type: 'scatter',
  data: {},
  options: {
    legend: { display: false },
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        type: 'time',
        ticks: {
          min: new Date(`${DISPLAY_START_DATE}T00:00:00.000+11:00`)
        },
        time: {
          stepSize: 1,
          unit: 'week',
          displayFormats: { week: 'd MMM' }
        }
      }]
    }
  }
});

const formatYTick = value => value.toLocaleString();

function chooseYScale(scale) {
  if (scale === 'log') {
    document.getElementById('graphScaleLog').checked = true;
    graph.options.scales.yAxes = [{
      type: 'logarithmic',
      ticks: {
        autoSkip: true,
        suggestedMin: GRAPH_Y_MIN,
        suggestedMax: GRAPH_Y_MAX,
        callback: formatYTick
      }
    }];
  } else {
    scale = 'linear';
    document.getElementById('graphScaleLinear').checked = true;
    graph.options.scales.yAxes = [
      {
        type: 'linear',
        ticks: {
          suggestedMin: GRAPH_Y_MIN,
          suggestedMax: GRAPH_Y_MAX,
          callback: formatYTick
        }
      }
    ];
  }
  document.cookie = `lastYScale=${scale}`;
  graph.update();
}

let enrichedCollection = [];
function choseState(state) {
  let stateEntry = enrichedCollection.filter(x => x.stateCode === state)[0] || enrichedCollection[0];
  const {
    rawDataset,
    predictStartDate,
    predictEndDate = DEFAULT_PREDICT_END_DATE,
    stateCode
  } = stateEntry;
  document.querySelector(`#graphLocation${stateCode}`).checked = true;
  graph.data.datasets = buildDatasets({
    label: '# Confirmed cases',
    predictStartDate,
    predictEndDate,
  }, rawDataset);
  graph.update();
  document.cookie = `lastStateCode=${stateCode}`;
}

document.getElementById('scaleControl').addEventListener('change', (event) => {
  if (event.target.checked) {
    chooseYScale(event.target.value);
  }
});

document.getElementById('locationControl').addEventListener('change', (event) => {
  if (event.target.checked) {
    choseState(event.target.value);
  }
});

fetchData().then((data) => {
  enrichedCollection = data;
  const {
    lastStateCode = enrichedCollection[0].stateCode,
    lastYScale = 'linear'
  } = getCookies();

  const locationControlContainer = document.querySelector('#locationControl .controlContainer');
  locationControlContainer.innerHTML = '';
  enrichedCollection.forEach((element) => {
    locationControlContainer.appendChild(
      createElement('div', { className: 'toggleButton' }, [
        createElement('input', {
          type: 'radio',
          name: 'graphLocation',
          value: element.stateCode,
          id: `graphLocation${element.stateCode}`
        }),
        createElement('label', {
          'for': `graphLocation${element.stateCode}`
        }, element.stateCode)
      ])
    );
  });

  chooseYScale(lastYScale);
  choseState(lastStateCode);

  const australiaData = enrichedCollection.filter(item => item.stateCode === 'ALL')[0];
  document.getElementById('doublingRateDisplay')
    .innerHTML = formatTimeHTML(calculateDoublingRate(australiaData));
  document.getElementById('easterPredictionDisplay')
    .innerText = estimateEasterNumber(australiaData).toLocaleString();
}, 1000);
