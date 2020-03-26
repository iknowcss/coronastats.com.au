import ausCaseCount from './totalCaseCount_australia.json';
import nswCaseCount from './totalCaseCount_nsw.json';
import vicCaseCount from './totalCaseCount_vic.json';
import qldCaseCount from './totalCaseCount_qld.json';
import actCaseCount from './totalCaseCount_act.json';
import saCaseCount from './totalCaseCount_sa.json';
import tasCaseCount from './totalCaseCount_tas.json';
import waCaseCount from './totalCaseCount_wa.json';
import ntCaseCount from './totalCaseCount_nt.json';

const data = {
  aus: {
    rawDataset: ausCaseCount.raw,
    predictStartDate: '2020-03-16',
  },
  nsw: {
    rawDataset: nswCaseCount.raw,
    predictStartDate: '2020-03-12',
  },
  vic: {
    rawDataset: vicCaseCount.raw,
    predictStartDate: '2020-03-12',
  },
  qld: {
    rawDataset: qldCaseCount.raw,
    predictStartDate: '2020-03-12',
  },
  act: {
    rawDataset: actCaseCount.raw,
    predictStartDate: '2020-03-17',
  },
  sa: {
    rawDataset: saCaseCount.raw,
    predictStartDate: '2020-03-18',
  },
  tas: {
    rawDataset: tasCaseCount.raw,
    predictStartDate: '2020-03-21',
  },
  wa: {
    rawDataset: waCaseCount.raw,
    predictStartDate: '2020-03-21',
  },
  nt: {
    rawDataset: ntCaseCount.raw,
    predictStartDate: '2020-03-21',
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
