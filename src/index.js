import { fetchData } from './data/data';
import { createElement, getCookies, datePad } from './browserUtil';
import { linestDaily, logisticEstDaily, normaliseData, filterAfterDate, filterBeforeDate, linest } from './dataUtil';
import { buildDatasets } from './chartUtil';
import './ga';
import './index.scss';

const MILLI_PER_DAY = 1000 * 86400;
const DISPLAY_START_DATE = '2020-03-08';
const DEFAULT_PREDICT_END_DATE = '2020-04-12';
const GRAPH_Y_MIN = 5;
const GRAPH_Y_MAX = 5000;
const EASTER_DATE = new Date('2020-04-10T15:00:00.000+10:00');

// Sample filtering

const logY = (normalData) => normalData.map(({ x, y }) => ({ x, y: Math.log(y) }));

function getLinestSampleData(stateData) {
  const normalData = logY(normaliseData(stateData.rawDataset));
  return filterAfterDate(stateData.predictStartDate, normalData);
}

function getPreviousLinestSampleData(stateData) {
  const normalData = logY(normaliseData(stateData.rawDataset));
  const predictStartDate = new Date(`${stateData.predictStartDate}T00:00:00.000+10:00`);
  predictStartDate.setDate(predictStartDate.getDate() - 1);
  const predictEndDate = normalData[normalData.length - 1].x;
  predictEndDate.setDate(predictEndDate.getDate() - 1);
  return filterBeforeDate(predictEndDate, filterAfterDate(predictStartDate, normalData));
}

// Doubling rate

function calculateDoublingRate(stateData) {
  const sampleData = getLinestSampleData(stateData);
  const { beta } = linestDaily(sampleData);
  return Math.log(2) / beta;
}

function calculatePreviousDoublingRate(stateData) {
  const sampleData = getPreviousLinestSampleData(stateData);
  const { beta } = linestDaily(sampleData);
  return Math.log(2) / beta;
}

// Easter number

function estimateEasterNumber(stateData) {
  const sampleData = getLinestSampleData(stateData);
  const { alpha, beta } = linestDaily(sampleData);
  return Math.round(Math.exp(beta * (EASTER_DATE.getTime() / MILLI_PER_DAY) + alpha));
}

function estimatePreviousEasterNumber(stateData) {
  const sampleData = getPreviousLinestSampleData(stateData);
  const { alpha, beta } = linestDaily(sampleData);
  return Math.round(Math.exp(beta * (EASTER_DATE.getTime() / MILLI_PER_DAY) + alpha));
}

// - Rendering ---------------------------------------------------------------------------------------------------------

// Render and control graph
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

function chooseYScale(scale) {
  if (scale === 'log') {
    document.getElementById('graphScaleLog').checked = true;
    graph.options.scales.yAxes = [{
      type: 'logarithmic',
      ticks: {
        autoSkip: true,
        suggestedMin: GRAPH_Y_MIN,
        suggestedMax: GRAPH_Y_MAX,
        callback: value => value.toLocaleString()
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
          callback: value => value.toLocaleString()
        }
      }
    ];
  }
  document.cookie = `lastYScale=${scale}`;
  graph.update();
}

const exponentialFitter = (sampleData) => {
  const logYData = sampleData.map(({ x, y }) => ({ x, y: Math.log(y) }));
  const { alpha, beta } = linestDaily(logYData);
  return x => Math.exp(beta * x + alpha);
};

const logisticFitter = (sampleData) => {
  const { L, k, x0 } = logisticEstDaily(sampleData);
  return x => L / (1 + Math.exp(-k * (x - x0)));
};

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
    fitter: exponentialFitter,
    // fitter: logisticFitter,
    predictStartDate: `${fiveDaysAgo.getFullYear()}-${datePad(fiveDaysAgo.getMonth() + 1)}-${datePad(fiveDaysAgo.getDate())}`,
    // predictStartDate: '2020-03-08',
    predictEndDate,
  }, rawDataset);
  graph.update();
  document.cookie = `lastStateCode=${stateCode}`;
}

// Listen for scale button events
document.getElementById('scaleControl').addEventListener('change', (event) => {
  if (event.target.checked) {
    chooseYScale(event.target.value);
  }
});

// Listen for location button events
document.getElementById('locationControl').addEventListener('change', (event) => {
  if (event.target.checked) {
    choseState(event.target.value);
  }
});

// Fetch the data and then render
fetchData().then((data) => {
  enrichedCollection = data;

  const {
    lastStateCode = enrichedCollection[0].stateCode,
    lastYScale = 'linear'
  } = getCookies();

  // Render location buttons
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

  // Prepare all Australia data to render

  const australiaData = enrichedCollection.filter(item => item.stateCode === 'ALL')[0];

  function renderTimeHTML(days) {
    if (days >= 1) {
      const daysRounded = Math.round(days);
      return `${daysRounded}&nbsp;day${daysRounded === 1 ? '' : 's'}`;
    }
    const hoursRounded = Math.round(days * 24);
    return `${hoursRounded}&nbsp;hour${hoursRounded === 1 ? '' : 's'}`;
  }

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

  // Render case doubling
  const doublingRate = calculateDoublingRate(australiaData);
  const previousDoublingRate = calculatePreviousDoublingRate(australiaData);
  const doublingRateDelta = doublingRate - previousDoublingRate;
  document.getElementById('doublingRateDisplay')
    .innerHTML = renderTimeHTML(doublingRate);
  renderTag(
    document.getElementById('doublingRateTag'),
    doublingRateDelta > 0
      ? ['positive', 'up']
      : doublingRateDelta < 0
      ? ['negative', 'down']
      : [],
    renderTimeHTML(Math.abs(doublingRateDelta)),
  );

  // Render Easter prediction
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
});
