import { fetchData } from './data';
import { createElement, getCookies, padLeft } from './browserUtil';
import { linestDaily, normaliseData, filterAfterDate, filterBeforeDate, xxx } from './dataUtil';
import { buildDatasets } from './chartUtil';
import './ga';
import './index.scss';

const MILLI_PER_DAY = 1000 * 86400;
const DISPLAY_START_DATE = '2020-03-08';
const DEFAULT_PREDICT_END_DATE = '2020-04-12';
const GRAPH_Y_MIN = 5;
const GRAPH_Y_MAX = 10000;

function getSampleData(stateData) {
  const normalData = normaliseData(stateData.rawDataset);
  return filterAfterDate(stateData.predictStartDate, normalData);
}

function getPreviousSampleData(stateData) {
  const normalData = normaliseData(stateData.rawDataset);
  const predictStartDate = new Date(`${stateData.predictStartDate}T00:00:00.000+10:00`);
  predictStartDate.setDate(predictStartDate.getDate() - 1);
  const predictEndDate = normalData[normalData.length - 1].x;
  predictEndDate.setDate(predictEndDate.getDate() - 1);
  return filterBeforeDate(predictEndDate, filterAfterDate(predictStartDate, normalData));
}

function calculateDoublingRate(stateData) {
  const sampleData = getSampleData(stateData);
  const { beta } = linestDaily(sampleData);
  return Math.log(2) / beta;
}

function calculatePreviousDoublingRate(stateData) {
  const sampleData = getPreviousSampleData(stateData);
  const { beta } = linestDaily(sampleData);
  return Math.log(2) / beta;
}

function formatTimeHTML(days) {
  if (days >= 1) {
    const daysRounded = Math.round(days);
    return `${daysRounded}&nbsp;day${daysRounded === 1 ? '' : 's'}`;
  }
  const hoursRounded = Math.round(days * 24);
  return `${hoursRounded}&nbsp;hour${hoursRounded === 1 ? '' : 's'}`;
}

const EASTER_DATE = new Date('2020-04-10T15:00:00.000+10:00');

function estimateEasterNumber(stateData) {
  const sampleData = getSampleData(stateData);
  const { alpha, beta } = linestDaily(sampleData);
  return Math.round(Math.exp(beta * (EASTER_DATE.getTime() / MILLI_PER_DAY) + alpha));
}

function estimatePreviousEasterNumber(stateData) {
  const sampleData = getPreviousSampleData(stateData);
  const { alpha, beta } = linestDaily(sampleData);
  return Math.round(Math.exp(beta * (EASTER_DATE.getTime() / MILLI_PER_DAY) + alpha));
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

const datePad = padLeft.bind(null, '0', 2);
let enrichedCollection = [];
function choseState(state) {
  let stateEntry = enrichedCollection.filter(x => x.stateCode === state)[0] || enrichedCollection[0];

  const lastEntryDate = stateEntry.rawDataset[stateEntry.rawDataset.length - 1][0];
  const fiveDaysAgo = new Date(`2020-${lastEntryDate}`);
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  const {
    rawDataset,
    predictEndDate = DEFAULT_PREDICT_END_DATE,
    stateCode
  } = stateEntry;
  document.querySelector(`#graphLocation${stateCode}`).checked = true;
  graph.data.datasets = buildDatasets({
    label: '# Confirmed cases',
    predictStartDate: `${fiveDaysAgo.getFullYear()}-${datePad(fiveDaysAgo.getMonth() + 1)}-${datePad(fiveDaysAgo.getDate())}`,
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

  function renderTag(tagElement, modifiers, html) {
    tagElement.innerHTML = '';
    tagElement.setAttribute('class', `overallStatsTag ${modifiers.map(m => `overallStatsTag--${m}`).join(' ')}`);
    if (modifiers.length > 0) {
      tagElement.appendChild(createElement('img', {
        src: '/arrow.svg',
        className: 'overallStatsTagIcon'
      }));
    }
    tagElement.appendChild(createElement('span', {
      className: 'overallStatsTagText'
    }, { html }));
  }

  // Case doubling
  const doublingRate = calculateDoublingRate(australiaData);
  const previousDoublingRate = calculatePreviousDoublingRate(australiaData);
  const doublingRateDelta = doublingRate - previousDoublingRate;
  document.getElementById('doublingRateDisplay')
    .innerHTML = formatTimeHTML(doublingRate);
  renderTag(
    document.getElementById('doublingRateTag'),
    doublingRateDelta > 0
      ? ['positive', 'up']
      : doublingRateDelta < 0
      ? ['negative', 'down']
      : [],
    formatTimeHTML(Math.abs(doublingRateDelta)),
  );

  // Easter prediction
  const easterNumber = estimateEasterNumber(australiaData);
  const previousEasterNumber = estimatePreviousEasterNumber(australiaData);
  const easterNumberDelta = easterNumber - previousEasterNumber;
  document.getElementById('easterPredictionDisplay')
    .innerText = easterNumber.toLocaleString();
  renderTag(
    document.getElementById('easterPredictionTag'),
    easterNumberDelta > 0
      ? ['negative', 'up']
      : easterNumberDelta < 0
      ? ['positive', 'down']
      : [],
    Math.abs(easterNumberDelta).toLocaleString(),
  );


}, 1000);
