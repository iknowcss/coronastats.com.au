const DEFAULT_PREDICT_START_DATE = '2020-03-29';

function all(promises) {
  let chain = Promise.resolve();
  let success = true;
  const results = [];
  promises.forEach((p, i) => chain = chain.then(() => {
    return p
      .then(result => results[i] = result)
      .catch(error => {
        results[i] = error;
        success = false;
      });
  }));
  return chain.then(() => success ? results : Promise.reject(results));
}

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

export const fetchData = () => {
  return all(states.map(({
    fileSuffix,
    ...theRest
  }) => {
    return fetch(`/data/totalCaseCount_${fileSuffix}.json`)
      .then(res => res.json())
      .then(data => ({ rawDataset: data.raw, ...theRest }));
  }));
};
