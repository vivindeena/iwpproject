const mongoose = require('mongoose')

const Schema = mongoose.Schema

const companySchema = new Schema({
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
  }
})

const Company = mongoose.model('Employeers', companySchema)

module.exports = Company
