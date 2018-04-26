const yaml = require('js-yaml');
const fs = require('fs');

// Load Swagger as JSON
// const petStoreSwaggerDefinition = require('./pet-store-prod.json')

// Load Swagger as YAML
const drvDef = loadYaml('./drv.yaml');
const foodTransport = loadYaml('./FoodTransport.yaml');
const harmonisedQuisper = loadYaml('./HarmonizedQuisper.yaml');
const hq = '/pdfs/HarmonizedQuisper.pdf';
const drv = '/pdfs/drv.pdf';
const ft = '/pdfs/FoodTransport.pdf';

const usagePlans = [{
  id: 'b04or5',
  name: 'Basic',
  apis: [
    {
      id: '5iz79asre6',
      image: '/sam-logo.png',
      swagger: drvDef,
      extraDoc: drv
    },
    {
      id: 'gms327o2ak',
      image: '/sam-logo.png',
      swagger: foodTransport,
      extraDoc: ft
    },
    {
      id: 'tnrl2m4nkf',
      image: '/sam-logo.png',
      swagger: harmonisedQuisper,
      extraDoc: hq
    }
  ]
}];

module.exports = usagePlans;

function loadYaml (path) {
  try {
      return yaml.safeLoad(fs.readFileSync(`${__dirname}/${path}`, 'utf8'))
  } catch (e) {
      console.log(e)
  }
}
