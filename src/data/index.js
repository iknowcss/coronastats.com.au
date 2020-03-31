const DEFAULT_PREDICT_START_DATE = '2020-03-24';

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

export const fetchData = () => {
  const rawData = {};
  return all([
    fetch('/data/totalCaseCount_australia.json').then(res => res.json()).then(data => rawData.aus = { rawDataset: data.raw,
      predictStartDate: DEFAULT_PREDICT_START_DATE, }),
    fetch('/data/totalCaseCount_nsw.json').then(res => res.json()).then(data => rawData.nsw = { rawDataset: data.raw,
      predictStartDate: DEFAULT_PREDICT_START_DATE, }),
    fetch('/data/totalCaseCount_vic.json').then(res => res.json()).then(data => rawData.vic = { rawDataset: data.raw,
      predictStartDate: DEFAULT_PREDICT_START_DATE, }),
    fetch('/data/totalCaseCount_qld.json').then(res => res.json()).then(data => rawData.qld = { rawDataset: data.raw,
      predictStartDate: DEFAULT_PREDICT_START_DATE, }),
    fetch('/data/totalCaseCount_act.json').then(res => res.json()).then(data => rawData.act = { rawDataset: data.raw,
      predictStartDate: DEFAULT_PREDICT_START_DATE, }),
    fetch('/data/totalCaseCount_sa.json').then(res => res.json()).then(data => rawData.sa = { rawDataset: data.raw,
      predictStartDate: '2020-03-24', }),
    fetch('/data/totalCaseCount_tas.json').then(res => res.json()).then(data => rawData.tas = { rawDataset: data.raw,
      predictStartDate: DEFAULT_PREDICT_START_DATE, }),
    fetch('/data/totalCaseCount_wa.json').then(res => res.json()).then(data => rawData.wa = { rawDataset: data.raw,
      predictStartDate: DEFAULT_PREDICT_START_DATE, }),
    fetch('/data/totalCaseCount_nt.json').then(res => res.json()).then(data => rawData.nt = { rawDataset: data.raw,
      predictStartDate: DEFAULT_PREDICT_START_DATE, }),
  ]).then(() => ({
    rawData,
    enrichedCollection: [
      {
        ...rawData.aus,
        stateCode: 'ALL',
        stateName: 'All',
      },
      {
        ...rawData.nsw,
        stateCode: 'NSW',
        stateName: 'New South Wales',
      },
      {
        ...rawData.vic,
        stateCode: 'VIC',
        stateName: 'Victoria',
      },
      {
        ...rawData.qld,
        stateCode: 'QLD',
        stateName: 'Queensland',
      },
      {
        ...rawData.act,
        stateCode: 'ACT',
        stateName: 'Australian Capital Territory',
      },
      {
        ...rawData.sa,
        stateCode: 'SA',
        stateName: 'South Australia',
      },
      {
        ...rawData.wa,
        stateCode: 'WA',
        stateName: 'West Australia',
      },
      {
        ...rawData.tas,
        stateCode: 'TAS',
        stateName: 'Tasmania',
      },
      {
        ...rawData.nt,
        stateCode: 'NT',
        stateName: 'Northern Territory',
      },
    ]
  }));
};
