const express = require('express')
const app = express()
const cors = require('cors')
let bodyParser = require("body-parser");
const mongoose = require("mongoose");
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

mongoose.connect(process.env.MONGO_URI,  { useNewUrlParser: true, useUnifiedTopology: true });

const { Schema } = mongoose;

const user = new Schema({
  username: {type: String, required: true}
});

let User = mongoose.model("User", user);

const exercise = new Schema({
  username: {type: String, required: true},
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: {type: String},
  id: {type: String, required: true}
});

let Exercise = mongoose.model("Exercise", exercise)

app.use(bodyParser.urlencoded({extended : false}));

app.post('/api/users', function (req, res){
  let user = new User ({username: req.body.username});
  user.save (function(err, data){
    if(err) console.log(err);
    res.json({username: data.username, _id: data.id});
  });
});

app.get('/api/users', function (req, res){
  User.find({}, function (err, data){
    if(err) console.log(err);
    res.json(data);
  });
});

app.post('/api/users/:_id/exercises', function (req, res){
  User.findById(req.params._id, function(err, user){
    if(err) console.log(err);
    let date = new Date (req.body.date);
    if(date.toDateString() == "Invalid Date"){
      date = new Date();
    }
    let exercise = new Exercise({username: user.username, description: req.body.description, duration: req.body.duration, date: date.toDateString(), id: user._id})
    exercise.save(function(err, data){
      if(err) console.log(err);
      res.json({"_id": data.id, "username": data.username, "date": data.date, "duration": data.duration, "description": data.description});
    });
  });
});

app.get('/api/users/:_id/logs', function(req, res){
  User.findById(req.params._id, function(err, user){
    if(err) console.log(err);
    Exercise.find({id: req.params._id}, function(err, exer){
      if(err) console.log(err); 
        let arrayExercises = exercisesObtainer(req.query.from, req.query.to, req.query.limit, exer);
        let fromDate = new Date(req.query.from).toDateString();
        let toDate = new Date(req.query.to).toDateString();
        res.json({"_id": req.params._id,"username": user.username, "from": fromDate == "Invalid Date" ? undefined : fromDate, "to": toDate == "Invalid Date" ? undefined: toDate ,"count": arrayExercises.length, "log": arrayExercises});
    })
  })  
});

function exercisesObtainer(from, to, limit, exer){
  let arrayExercises = [];
  if(from == undefined  && to == undefined && limit == undefined){
      for (let i = 0; i<exer.length; i++){
        arrayExercises.push({
        description: exer[i].description,
        duration: exer[i].duration,
        date: exer[i].date
      });
    }
  }else if(from != undefined && to != undefined && limit != undefined){
    let fromDate = new Date (from), toDate = new Date(to), numberLimit = parseInt(limit);
    let i = 0;
    let j = 0;
    while(i<exer.length && j < numberLimit){
      iDate = new Date (exer[i].date);
      if(fromDate - iDate <= 0 && toDate - iDate >= 0){
        arrayExercises.push({
          description: exer[i].description,
          duration: exer[i].duration,
          date: exer[i].date
        });
        j++;
      }
      i++;
    }
  }else if(from == undefined && to == undefined && limit != undefined){
    let numberLimit = parseInt(limit);
    let i = 0, j = 0;
    while(i<exer.length && j < numberLimit){
        arrayExercises.push({
          description: exer[i].description,
          duration: exer[i].duration,
          date: exer[i].date
        });
        j++;
        i++;
    }
  }else if(from == undefined && to != undefined && limit == undefined){
    let toDate = new Date(to);
    for(let i = 0; i<exer.length ; i++){
      iDate = new Date (exer[i].date);
      if(toDate - iDate >= 0){
        arrayExercises.push({
          description: exer[i].description,
          duration: exer[i].duration,
          date: exer[i].date
        });
      }
    }
  }else if(from != undefined && to == undefined && limit == undefined){
    let fromDate = new Date(from);
    for(let i = 0; i<exer.length ; i++){
      iDate = new Date (exer[i].date);
      if(fromDate - iDate <= 0){
        arrayExercises.push({
          description: exer[i].description,
          duration: exer[i].duration,
          date: exer[i].date
        });
      }
    }
  }else if(from == undefined && to != undefined && limit != undefined){
    let toDate = new Date(to), numberLimit = parseInt(limit);
    let i = 0, j = 0;
    while(i<exer.length && j < numberLimit){
      iDate = new Date (exer[i].date);
      if(toDate - iDate >= 0){
        arrayExercises.push({
          description: exer[i].description,
          duration: exer[i].duration,
          date: exer[i].date
        });
        j++;
      }
      i++;
    }
  }else if(from != undefined && to == undefined && limit != undefined){
    let fromDate = new Date (from), numberLimit = parseInt(limit);
    let i = 0, j = 0;
    while(i<exer.length && j < numberLimit){
      iDate = new Date (exer[i].date);
      if(fromDate - iDate <= 0){
        arrayExercises.push({
          description: exer[i].description,
          duration: exer[i].duration,
          date: exer[i].date
        });
        j++;
      }
      i++;
    }
  }else if(from != undefined && to != undefined && limit == undefined){
    let fromDate = new Date (from), toDate = new Date(to);
    for(let i = 0; i<exer.length; i++){
      iDate = new Date (exer[i].date);
      if(fromDate - iDate <= 0 && toDate - iDate >= 0){
        arrayExercises.push({
          description: exer[i].description,
          duration: exer[i].duration,
          date: exer[i].date
        });
      }
    }
  }
  
  return arrayExercises;
}

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
