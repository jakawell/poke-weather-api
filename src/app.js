import express from 'express';
import request from 'request';

const app = express();
const config = require('./config.local.json');

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:42001');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.get('/', (req, res) => res.send('Hello World!'));

function requestWeather(language, isMetric, location, res) {
  request({
    uri: config.accuweatherForecastsApi + 'hourly/12hour/' + location.Key,
    qs: {
      apikey: config.accuweatherApiKey,
      details: 'true',
      language: language,
      metric: isMetric
    }
  }, (error, response, body) => {
    if (error)
      res.status(400).json({ errorCode: 'BAD_FORECAST', errorDesc: 'Failed to find a forecast.'})
    res.json({
      location: location,
      forecast: JSON.parse(body)
    });
  });
}

app.get('/ip_location', (req, res) => {
  let ipAddress = req.connection.remoteAddress;
  if (ipAddress == '::1')
    ipAddress = '104.139.105.176';
  request('http://freegeoip.net/json/' + ipAddress).pipe(res);
})

app.get('/weather', (req, res) => {
  const language = req.query.language || 'en-us';
  const isMetric = req.query.metric || 'false';
  if (req.query.searchQuery || (req.query.lat && req.query.long)) {
    request({
      uri: config.accuweatherLocationsApi + (req.query.searchQuery ? 'search' : 'cities/geoposition/search'),
      qs: {
        apikey: config.accuweatherApiKey,
        q: req.query.searchQuery || (req.query.lat + ',' + req.query.long)
      }
    }, (error, response, body) => {
      if (error) {
        res.status(400).json(error);
      }
      else {
        const locationResults = JSON.parse(body);
        let location = locationResults;
        if ((!!locationResults) && (locationResults.constructor === Array) && locationResults.length > 0) // is array of locations
          location = locationResults[0];

        if (location)
          requestWeather(language, isMetric, location, res);
        else
          res.status(404).json({ errorCode: 'BAD_SEARCH', errorDesc: 'Failed to find a matching location.'});
      }
    });
  }
  else {
    res.status(400).json({ errorCode: 'BAD_LOC', errorDesc: 'Weather request must include either lat and long parameter, or searchQuery.'});
  }
});

app.listen(3000, () => console.log('Listening on port 3000'));
