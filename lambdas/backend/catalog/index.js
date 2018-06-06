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
        summary: 'SOAP web service that provides access to food composition data collected by EU project EuroFIR.',
        extraDoc: '/pdfs/FoodTransport.pdf'
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
