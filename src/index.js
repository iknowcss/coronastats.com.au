import { enrichedCollection } from './data';
import {createElement, getCookies} from './browserUtil';
import { linestDaily, normaliseData, filterAfterDate } from './dataUtil';
import {buildDatasets} from './chartUtil';
import './ga';
import './index.scss';

const DISPLAY_START_DATE = '2020-03-08';
const DEFAULT_PREDICT_END_DATE = '2020-04-05';
const GRAPH_Y_MIN = 5;
const GRAPH_Y_MAX = 12000;

function calculateDoublingRate(stateData) {
  const normalData = normaliseData(stateData.rawDataset);
  const sampleData = filterAfterDate(stateData.predictStartDate, normalData);
  const { beta } = linestDaily(sampleData);
  return Math.log(2) / beta;
}

function formatTime(days) {
  const bits = [Math.floor(days)];
  bits.push(`day${bits[0] === 1 ? '' : 's'},`);
  bits.push(Math.round((days - bits[0]) * 24));
  bits.push(`hour${bits[2] === 1 ? '' : 's'}`);
  return bits.join(' ');
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

const locationControlContainer = document.querySelector('#locationControl .controlContainer');
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

const {
  lastStateCode = enrichedCollection[0].stateCode,
  lastYScale = 'linear'
} = getCookies();

const formatYTick = value => value.toLocaleString();

const formatYTickLog = value =>
  (Math.log(value) / Math.log(10) + 1e-9) % 1 < 1e-8
  || (Math.log(value / 2) / Math.log(10) + 1e-9) % 1 < 1e-8
  || (Math.log(value / 5) / Math.log(10) + 1e-9) % 1 < 1e-8
    ? formatYTick(value)
    : '';

function chooseYScale(scale) {
  if (scale === 'log') {
    document.getElementById('graphScaleLog').checked = true;
    graph.options.scales.yAxes = [{
      type: 'logarithmic',
      ticks: {
        suggestedMin: GRAPH_Y_MIN,
        suggestedMax: GRAPH_Y_MAX,
        callback: formatYTickLog
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

chooseYScale(lastYScale);
choseState(lastStateCode);
