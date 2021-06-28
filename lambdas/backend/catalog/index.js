const yaml = require('js-yaml');
const fs = require('fs');

const usagePlans = [
  {
    id: 'b04or5',
    name: 'drv-basic',
    apis: [
      {
        id: '5iz79asre6',
        image: '/sam-logo.png',
        swagger: loadYaml('./drv.yaml'),
        summary: 'Service that provides dietary reference values compiled by EuroFIR.',
        extraDoc: '/pdfs/drv.pdf',
      },
    ],
  },
  {
    id: '9vp8pq',
    name: 'foodtransport-basic',
    apis: [
      {
        id: 'gms327o2ak',
        image: '/sam-logo.png',
        swagger: loadYaml('./FoodTransport.yaml'),
        summary: 'Food composition data, linking foods and nutrients, collected by EU project EuroFIR.',
        extraDoc: '/pdfs/FoodTransport.pdf'
      },
    ],
  },
  {
    id: 'qyujcn',
    name: 'my-dna-health-basic',
    apis: [
      {
        id: '2gfe7ztifk',
        image: '/sam-logo.png',
        swagger: loadYaml('./my-dna-health.yaml'),
        summary: 'The myDNAhealth API collection of endpoints and methods to'
            + ' access them specifically designed for QSP.',
        extraDoc: '/pdfs/eNutri.pdf'
      },
    ],
  },
  {
    id: 'g12l31',
    name: 'p4h-basic',
    apis: [
      {
        id: 'hd0zlobu64',
        image: '/sam-logo.png',
        swagger: loadYaml('./p4h.yaml'),
        summary: 'Retrieve AGING information by sending DNA results.'
            + 'There are two endpoints needed to retrieve AGING information.'
            + ' One is for authentication and the other is to get AGING'
            + ' information',
        extraDoc: '/pdfs/p4h.pdf'
      },
    ],
  },
  {
    id: 'ydkuz9',
    name: 'enutri-basic',
    apis: [
      {
        id: '30d4cgalvl',
        image: '/sam-logo.png',
        swagger: loadYaml('./eNutri-de-rct.yaml'),
        summary: 'Advice based on Food Frequency Questionnaire for eNutri'
            + ' app, by University of Reading',
        extraDoc: '/pdfs/eNutri_API_docs.pdf'
      },
    ],
  },
  {
    id: 'ecoabw',
    name: 'new-foodexplorer',
    apis: [
      {
        id: 'rer1jlh0l8',
        image: '/sam-logo.png',
        swagger: loadYaml('./new-foodExplorer-v0.1.yaml'),
        summary: 'POC Integrations to test new Implementation of FoodExplorer'
            + 'based on REST',
        extraDoc: '/pdfs/FoodEXplorer- v0.1.pdfeNutri_API_docs.pdf'
      },
    ],
  },
  {
    id: '3b2n44',
    name: 'ffq-safecape-basic',
    apis: [
      {
        id: 'txz1jr9ipi',
        image: '/logo-ffq.png',
        swagger: loadYaml('./ffq.yaml'),
        summary: 'A service for calculating daily intake for a variety of'
            + ' nutrients based on a simple Food Frequency Questionnaire',
        extraDoc: '/pdfs/ffq-api-doc-v1.2.pdf'
      },
    ],
  },
  {
    id: 'wq96j0',
    name: 'food4me-l1-safecape-basic',
    apis: [
      {
        id: 'nhxiy6ft2b',
        image: '/logo-pna-l1.png',
        swagger: loadYaml('./food4me-l1.yaml'),
        summary: '',
        extraDoc: '/pdfs/food4me-api-doc-v1.0.pdf'
      },
    ],
   },
   {
    id: 'x6qz7w',
    name: 'ffq-food4me-safecape-basic',
    apis: [
      {
        id: 'fryr6joc4f',
        image: '/logo-ffq-pna-l1.png',
        swagger: loadYaml('./ffq-food4me-l1.yaml'),
        summary: 'An integrated service for providing personalized dietary advice based on the guidelines developed by the Food4Me project,' +
        ' using a simple Food Frequency Questionnaire.',
        extraDoc: '/pdfs/ffq-food4me-api-doc-v1.0.pdf'
      },
    ],
   },
  // Disable until the service works again
  // {
  //   id: 'ekp75u',
  //   name: 'harmonized-basic',
  //   apis: [
  //     {
  //       id: 'tnrl2m4nkf',
  //       image: '/sam-logo.png',
  //       swagger: loadYaml('./HarmonizedQuisper.yaml'),
  //       summary: 'An XML web service that provides a single-point access to QSP webservices.',
  //       extraDoc: '/pdfs/HarmonizedQuisper.pdf'
  //     },
  //   ],
  // },
  {
    id: '9ktgci',
    name: 'pdas-basic',
    apis: [
      {
        id: 'j3ctrwbieg',
        image: '/sam-logo.png',
        swagger: loadYaml('./PDAS.yaml'),
        summary: 'Web-service based on the Food4Me level 3 advices.',
        extraDoc: '/pdfs/pdas.pdf'
      },
    ],
  },
];

module.exports = usagePlans;

function loadYaml (path) {
  try {
      return yaml.safeLoad(fs.readFileSync(`${__dirname}/${path}`, 'utf8'))
  } catch (e) {
      console.log(e)
  }
}
