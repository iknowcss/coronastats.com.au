const DEFAULT_PREDICT_START_DATE = '2020-03-29';

const states = [
  {
    fileSuffix: 'australia',
    stateCode: 'ALL',
    stateName: 'All',
    predictStartDate: DEFAULT_PREDICT_START_DATE,
  },
  {
    fileSuffix: 'nsw',
    stateCode: 'NSW',
    stateName: 'New South Wales',
    predictStartDate: DEFAULT_PREDICT_START_DATE,
  },
  {
    fileSuffix: 'vic',
    stateCode: 'VIC',
    stateName: 'Victoria',
    predictStartDate: DEFAULT_PREDICT_START_DATE,
  },
  {
    fileSuffix: 'qld',
    stateCode: 'QLD',
    stateName: 'Queensland',
    predictStartDate: DEFAULT_PREDICT_START_DATE,
  },
  {
    fileSuffix: 'act',
    stateCode: 'ACT',
    stateName: 'Australian Capital Territory',
    predictStartDate: DEFAULT_PREDICT_START_DATE,
  },
  {
    fileSuffix: 'sa',
    stateCode: 'SA',
    stateName: 'South Australia',
    predictStartDate: DEFAULT_PREDICT_START_DATE,
  },
  {
    fileSuffix: 'wa',
    stateCode: 'WA',
    stateName: 'West Australia',
    predictStartDate: DEFAULT_PREDICT_START_DATE,
  },
  {
    fileSuffix: 'tas',
    stateCode: 'TAS',
    stateName: 'Tasmania',
    predictStartDate: DEFAULT_PREDICT_START_DATE,
  },
  {
    fileSuffix: 'nt',
    stateCode: 'NT',
    stateName: 'Northern Territory',
    predictStartDate: DEFAULT_PREDICT_START_DATE,
  },
];

const normaliseData = data => data.map(parts => ({
  x: new Date(`2020-${parts[0]}T${parts[1]}:00.000${parts[2]}`),
  y: parts[3],
}));

export const fetchData = () =>
  Promise.all(states.map(({
    fileSuffix,
    ...theRest
  }) => fetch(`/data/totalCaseCount_${fileSuffix}.json`)
    .then(res => res.json())
    .then(data => ({
      dataset: normaliseData(data.raw),
      ...theRest,
    }))
  ));
