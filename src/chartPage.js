import './chartPage.scss';
import rawData from './data';
import { buildDatasets } from './chartUtil';
import { getCookies } from './browserUtil';

const DEFAULT_PREDICT_END_DATE = '2020-04-05';
const stateData = [
  {
    ...rawData.aus,
    stateCode: 'AUS',
    stateName: 'Australia',
  },
  {
    ...rawData.nsw,
    stateCode: 'NSW',
    stateName: 'NSW',
  },
  {
    ...rawData.vic,
    stateCode: 'VIC',
    stateName: 'VIC',
  },
  {
    ...rawData.qld,
    stateCode: 'QLD',
    stateName: 'QLD',
  },
  {
    ...rawData.act,
    stateCode: 'ACT',
    stateName: 'ACT',
  },
  {
    ...rawData.sa,
    stateCode: 'SA',
    stateName: 'SA',
  },
  {
    ...rawData.wa,
    stateCode: 'WA',
    stateName: 'WA',
  },
  {
    ...rawData.tas,
    stateCode: 'TAS',
    stateName: 'TAS',
  },
  {
    ...rawData.nt,
    stateCode: 'NT',
    stateName: 'NT',
  },
];

const controlButtonContainer = document.getElementById('controlButtonContainer');
stateData.forEach((entry) => {
  const controlButton = document.createElement('div');
  controlButton.setAttribute('class', 'controlButton');

  const radio = document.createElement('input');
  radio.setAttribute('type', 'radio');
  radio.setAttribute('name', 'state');
  radio.setAttribute('id', `radio_${entry.stateCode}`);
  radio.setAttribute('value', entry.stateCode);
  controlButton.appendChild(radio);

  const label = document.createElement('label');
  label.setAttribute('for', `radio_${entry.stateCode}`);
  label.innerText = entry.stateName;
  controlButton.appendChild(label);

  controlButtonContainer.appendChild(controlButton);
  entry.element = { radio, label };
});

const linChart = new Chart(document.getElementById('linearChart').getContext('2d'), {
  type: 'scatter',
  data: {},
  options: {
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        type: 'time',
        time: {
          stepSize: 1,
          unit: 'week',
          displayFormats: { week: 'd MMM' }
        }
      }]
    }
  }
});

function choseState(state) {
  const stateEntry = stateData.filter(x => x.stateCode === state)[0];
  if (stateEntry) {
    const {
      rawDataset,
      predictStartDate,
      predictEndDate = DEFAULT_PREDICT_END_DATE,
      stateCode
    } = stateEntry;
    stateEntry.element.radio.checked = true;
    linChart.data.datasets = buildDatasets({
      label: '# Confirmed cases',
      predictStartDate,
      predictEndDate
    }, rawDataset);
    linChart.update();
    document.cookie = `lastStateCode=${stateCode}`;
  }
}

function chooseYScale(scale) {
  if (scale === 'linear') {
    document.getElementById("logToggle_linear").checked = true;
    delete linChart.options.scales.yAxes;
  } else if (scale === 'log') {
    document.getElementById("logToggle_log").checked = true;
    linChart.options.scales.yAxes = [{
      type: 'logarithmic',
      ticks: {
        callback: value => (Math.log(value) / Math.log(10) + 1e-9) % 1 < 1e-8
          ? value.toLocaleString()
          : ''
      }
    }];
  }
  document.cookie = `lastYScale=${scale}`;
  linChart.update();
}

document.querySelector('.controlContainer').addEventListener('change', (event) => {
  if (event.target.checked) {
    choseState(event.target.value);
  }
});

document.querySelector('.logToggleContainer').addEventListener('change', (event) => {
  if (event.target.checked) {
    chooseYScale(event.target.value);
  }
});

const {
  lastStateCode = stateData[0].stateCode,
  lastYScale = 'linear'
} = getCookies();

choseState(lastStateCode);
chooseYScale(lastYScale);