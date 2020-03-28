import ausCaseCount from './totalCaseCount_australia.json';
import nswCaseCount from './totalCaseCount_nsw.json';
import vicCaseCount from './totalCaseCount_vic.json';
import qldCaseCount from './totalCaseCount_qld.json';
import actCaseCount from './totalCaseCount_act.json';
import saCaseCount from './totalCaseCount_sa.json';
import tasCaseCount from './totalCaseCount_tas.json';
import waCaseCount from './totalCaseCount_wa.json';
import ntCaseCount from './totalCaseCount_nt.json';

const DEFAULT_PREDICT_START_DATE = '2020-03-23';

const data = {
  aus: {
    rawDataset: ausCaseCount.raw,
    predictStartDate: DEFAULT_PREDICT_START_DATE,
  },
  nsw: {
    rawDataset: nswCaseCount.raw,
    predictStartDate: DEFAULT_PREDICT_START_DATE,
  },
  vic: {
    rawDataset: vicCaseCount.raw,
    predictStartDate: DEFAULT_PREDICT_START_DATE,
  },
  qld: {
    rawDataset: qldCaseCount.raw,
    predictStartDate: DEFAULT_PREDICT_START_DATE,
  },
  act: {
    rawDataset: actCaseCount.raw,
    predictStartDate: DEFAULT_PREDICT_START_DATE,
  },
  sa: {
    rawDataset: saCaseCount.raw,
    predictStartDate: '2020-03-24',
  },
  tas: {
    rawDataset: tasCaseCount.raw,
    predictStartDate: DEFAULT_PREDICT_START_DATE,
  },
  wa: {
    rawDataset: waCaseCount.raw,
    predictStartDate: DEFAULT_PREDICT_START_DATE,
  },
  nt: {
    rawDataset: ntCaseCount.raw,
    predictStartDate: DEFAULT_PREDICT_START_DATE,
  },
};

export const enrichedCollection = [
  {
    ...data.aus,
    stateCode: 'ALL',
    stateName: 'All',
  },
  {
    ...data.nsw,
    stateCode: 'NSW',
    stateName: 'New South Wales',
  },
  {
    ...data.vic,
    stateCode: 'VIC',
    stateName: 'Victoria',
  },
  {
    ...data.qld,
    stateCode: 'QLD',
    stateName: 'Queensland',
  },
  {
    ...data.act,
    stateCode: 'ACT',
    stateName: 'Australian Capital Territory',
  },
  {
    ...data.sa,
    stateCode: 'SA',
    stateName: 'South Australia',
  },
  {
    ...data.wa,
    stateCode: 'WA',
    stateName: 'West Australia',
  },
  {
    ...data.tas,
    stateCode: 'TAS',
    stateName: 'Tasmania',
  },
  {
    ...data.nt,
    stateCode: 'NT',
    stateName: 'Northern Territory',
  },
];

export default data;
