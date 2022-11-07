const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phoneNo: {
    type: String,
    required: true
  },
  resumeLink: {
    type: String,
    default: ''
  }
  }
)

const User = mongoose.model('JobSeekers', userSchema)

module.exports = User
