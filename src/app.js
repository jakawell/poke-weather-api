import express from 'express';
import request from 'request';

const app = express();
const config = require('./config.local.json');

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/accu/locations/geoposition', (req, res) => {
  request({
    uri: config.accuweatherLocationsApi + 'cities/geoposition/search',
    qs: {
      apikey: config.accuweatherApiKey,
      q: req.query.lat + ',' + req.query.long
    }
  }).pipe(res);
});

app.get('/accu/forecasts/12hour', (req, res) => {
  request({
    uri: config.accuweatherForecastsApi + 'hourly/12hour/' + req.query.locationKey,
    qs: {
      apikey: config.accuweatherApiKey,
      details: 'true',
      language: req.query.language || 'en-us',
      metric: req.query.metric || 'false'
    }
  }).pipe(res);
});

app.listen(3000, () => console.log('Listening on port 3000'));
