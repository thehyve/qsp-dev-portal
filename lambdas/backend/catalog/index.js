const yaml = require('js-yaml');
const fs = require('fs');

// Load Swagger as YAML
const drvDef = loadYaml('./drv.yaml');
const foodTransport = loadYaml('./FoodTransport.yaml');
const harmonisedQuisper = loadYaml('./HarmonizedQuisper.yaml');
const pdasDoc = loadYaml('./PDAS.yaml');

const usagePlans = [
  {
    id: 'b04or5',
    name: 'drv-basic',
    apis: [
      {
        id: '5iz79asre6',
        image: '/sam-logo.png',
        swagger: drvDef,
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
        swagger: foodTransport,
        summary: 'SOAP web service that provides access to food composition data collected by EU project EuroFIR.',
        extraDoc: '/pdfs/FoodTransport.pdf'
      },
    ],
  },
  {
    id: 'ekp75u',
    name: 'harmonized-basic',
    apis: [
      {
        id: 'tnrl2m4nkf',
        image: '/sam-logo.png',
        swagger: harmonisedQuisper,
        summary: 'An XML web service that provides a single-point access to QSP webservices.',
        extraDoc: '/pdfs/HarmonizedQuisper.pdf'
      },
    ],
  },
  {
    id: '9ktgci',
    name: 'pdas-basic',
    apis: [
      {
        id: 'j3ctrwbieg',
        image: '/sam-logo.png',
        swagger: pdasDoc,
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
