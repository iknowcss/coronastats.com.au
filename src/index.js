import { fetchData } from './data/data';
import { createElement, getCookies, datePad } from './browserUtil';
import { linestDaily, logisticEstDaily, filterAfterDate, filterBeforeDate, filterBetweenDates } from './dataUtil';
import { buildDatasets } from './chartUtil';
import './ga';
import './index.scss';

const MILLI_PER_DAY = 1000 * 86400;
const DISPLAY_START_DATE = '2020-03-08';
const GRAPH_Y_MIN = 5;
const GRAPH_Y_MAX = 5000;
const DEFAULT_PREDICT_END_DATE = new Date('2020-04-20T15:00:00.000+10:00');
const LOGISTIC_EST_START_DATE = new Date('2020-03-08T00:00:00.000+10:00');

// Sample filtering

function nDaysBefore(n, date) {
  const nDaysAgo = new Date(date);
  nDaysAgo.setDate(nDaysAgo.getDate() - n);
  return nDaysAgo;
}

function nDaysBeforeLastEntry(n, dataset) {
  return nDaysBefore(n, dataset[dataset.length - 1].x);
}

const logY = (normalData) => normalData.map(({ x, y }) => ({ x, y: Math.log(y) }));

function getLinestSampleData(stateData) {
  return filterAfterDate(nDaysBeforeLastEntry(5, stateData.dataset), logY(stateData.dataset));
}

function getPreviousLinestSampleData(stateData) {
  const logYData = logY(stateData.dataset);
  const predictEndDate = new Date(logYData[logYData.length - 1].x);
  predictEndDate.setDate(predictEndDate.getDate() - 1);
  const predictStartDate = new Date(predictEndDate);
  predictStartDate.setDate(predictStartDate.getDate() - 5);
  return filterBetweenDates(predictStartDate, predictEndDate, logYData);
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
  return Math.round(Math.exp(beta * (DEFAULT_PREDICT_END_DATE.getTime() / MILLI_PER_DAY) + alpha));
}

function estimatePreviousEasterNumber(stateData) {
  const sampleData = getPreviousLinestSampleData(stateData);
  const { alpha, beta } = linestDaily(sampleData);
  return Math.round(Math.exp(beta * (DEFAULT_PREDICT_END_DATE.getTime() / MILLI_PER_DAY) + alpha));
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

const exponentialFitter = (dataset) => {
  const startDate = nDaysBeforeLastEntry(5, dataset);
  const filteredDataset = filterAfterDate(startDate, dataset);
  const logYData = filteredDataset.map(({ x, y }) => ({ x, y: Math.log(y) }));
  const coefficients = linestDaily(logYData);
  return {
    startDate,
    endDate: DEFAULT_PREDICT_END_DATE,
    coefficients,
    valueFn: x => Math.exp(coefficients.beta * x + coefficients.alpha),
  };
};

const logisticFitter = (dataset) => {
  const startDate = LOGISTIC_EST_START_DATE;
  const filteredDataset = filterAfterDate(startDate, dataset);
  const { L, k, x0 } = logisticEstDaily(filteredDataset);
  return {
    startDate,
    endDate: DEFAULT_PREDICT_END_DATE,
    valueFn: x => L / (1 + Math.exp(-k * (x - x0))),
  };
};

let enrichedCollection = [];
function choseState(state) {
  let stateEntry = enrichedCollection.filter(x => x.stateCode === state)[0] || enrichedCollection[0];
  const { dataset, stateCode } = stateEntry;
  document.querySelector(`#graphLocation${stateCode}`).checked = true;
  graph.data.datasets = buildDatasets({ exponentialFitter, logisticFitter } , dataset);
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
    .innerText = easterNumber.toLocaleString() + '*';
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
