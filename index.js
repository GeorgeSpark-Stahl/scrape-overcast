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
        if(err)
          console.log(err)
        else {
          elements.forEach(function(element){
            x(element, ['.singleline'])(function (err, title) {
              try {
                if (typeof title[0] != 'undefined') {
                  var duration_str = title[2].trim().split('•')[1]
                  if(duration_str !== undefined)
                    duration_str = duration_str.trim().split(' ')[0]
                  var duration=moment.duration(duration_str)
                  total_duration.add(duration)
                  total_episodes++;
                }
              }
              catch(e) {
                console.log(e)
              }

            })
          })
        }
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
