const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
})

// 
// We have environment variables to establish a url for the local machine or deploay on heroku.
// 