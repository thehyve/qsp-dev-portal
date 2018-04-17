const yaml = require('js-yaml');
const fs = require('fs');

// Load Swagger as JSON
// const petStoreSwaggerDefinition = require('./pet-store-prod.json')

// Load Swagger as YAML
const drvDef = loadYaml('./drv.yaml');

const usagePlans = [{
  id: 'b04or5',
  name: 'Basic',
  apis: [{
    id: '5iz79asre6',
    image: '/sam-logo.png',
    swagger: drvDef
  }]
}];

module.exports = usagePlans;

function loadYaml (path) {
  try {
      return yaml.safeLoad(fs.readFileSync(`${__dirname}/${path}`, 'utf8'))
  } catch (e) {
      console.log(e)
  }
}
