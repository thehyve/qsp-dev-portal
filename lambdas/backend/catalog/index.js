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
        extraDoc: '/pdfs/pdas.pdf'
      },
    ],
  },
];

export default usagePlans;

function loadYaml (path) {
  try {
      return yaml.safeLoad(fs.readFileSync(`${__dirname}/${path}`, 'utf8'))
  } catch (e) {
      console.log(e)
  }
}
