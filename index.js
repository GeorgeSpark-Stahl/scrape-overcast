var superagent = require("superagent")
var agent = superagent.agent()
var Xray = require('x-ray');
var x = Xray();
var moment = require('moment');
var request = require('request')
var total_duration = moment.duration();
var total_episodes = 0;

agent
  .post('https://overcast.fm/login')
  .type('form')
  .send({ email: process.env.OVERCAST_EMAIL, password: process.env.OVERCAST_PASSWORD })
  .end(function(err, res){
    if (err || !res.ok) {
      console.log(err);
    } else {
      x(res.text, ['.titlestack@html'])(function(err, elements) {
        elements.forEach(function(element){
          x(element, ['.singleline'])(function (err, title) {
            if (typeof title[0] != 'undefined') {
              var duration=moment.duration(title[2].trim().split('•')[1])
              total_duration.add(duration)
              total_episodes++;
            }
          })
        })
        var summary =
        {
          episodes: total_episodes,
          duration: total_duration.asMinutes()
        }
        console.log(summary)
        var qs =
        {
          private_key: process.env.SPARKDATA_PK,
          duration:summary.duration,
          episodes:summary.episodes
        }
        request.get({uri:process.env.SPARKDATA_URL, qs:qs}, function callback(error, response, body) {
          if(error)
            console.log(error)
          if(body)
            console.log(body)
        })
      })
    }
  });
