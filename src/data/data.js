
const states = [
  {
    fileSuffix: 'australia',
    stateCode: 'ALL',
    stateName: 'All',
  },
  {
    fileSuffix: 'nsw',
    stateCode: 'NSW',
    stateName: 'New South Wales',
  },
  {
    fileSuffix: 'vic',
    stateCode: 'VIC',
    stateName: 'Victoria',
  },
  {
    fileSuffix: 'qld',
    stateCode: 'QLD',
    stateName: 'Queensland',
  },
  {
    fileSuffix: 'act',
    stateCode: 'ACT',
    stateName: 'Australian Capital Territory',
  },
  {
    fileSuffix: 'sa',
    stateCode: 'SA',
    stateName: 'South Australia',
  },
  {
    fileSuffix: 'wa',
    stateCode: 'WA',
    stateName: 'West Australia',
  },
  {
    fileSuffix: 'tas',
    stateCode: 'TAS',
    stateName: 'Tasmania',
  },
  {
    fileSuffix: 'nt',
    stateCode: 'NT',
    stateName: 'Northern Territory',
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
