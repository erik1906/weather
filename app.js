const express = require('express');
const https = require('https');
const http = require('http');

const app = express();

app.use('/static', express.static('public'));

app.set('view engine', 'pug');

function printError(error){
  console.error(error.message);
}

app.get("/", (req, res) => {
try {
  //Connect
  const request = https.get(`https://api.wunderground.com/api/38f9f855597455c1/conditions/q/Mexico_City.json`, response => {
    if (response.statusCode === 200) {
      var body = "";
      response.on('data', data => {
        body += data.toString();
      });
      response.on('end', end => {
        //Parse data
        try {
          const temperature = JSON.parse(body);
          var type;
          const city = temperature.current_observation.display_location.city;
          const temp_c = temperature.current_observation.temp_c;
          const icon = temperature.current_observation.icon;
          const weather = temperature.current_observation.weather
          if(icon === 'mostlycloudy'){
            type = 'cloudy';
          }else if(weather === 'Overcast'){
            type = 'overcast';
          }else if((icon != 'rain') || icon != 'cloudy'){
            type = 'clear';
          }else{
            type = icon;
          }
          var data ={city, temp_c, icon, weather, type};
          console.log(data);
          res.render('display', {data});


        } catch (e) {
          printError(e);
        }
      });
    } else {
      const message = `Error getting weather for Mexico City (${http.STATUS_CODES[response.statusCode]})`;
      const statusError = new Error(message);
      printError(statusError);
    }
  });
} catch (error) {
  console.error(error.message);
}

});

app.use((req, res, next)=>{
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next)=>{
  res.locals.error = err;
  res.status(err.status);
  res.render('error');
});

app.listen(3000, () => {
  console.log('The application is running on port 3000')
});
