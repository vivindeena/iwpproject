const mongoose = require('mongoose')

const Schema = mongoose.Schema

const jobSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    postedBy: {
        type: String,
        required: true
    },
    feild: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    daysToExpiration:{
        type: Number,
        required: true
    },
    salary: {
        type: Number,
        required: true
    },
    yearsOfExperience: {
        type: Number,
        required: true
    },
    skills:{
        type: String,
        required: true
    },
    currentApplication: {
        type: Array,
        default: []
    }
})

const Jobs = mongoose.model("Jobs", jobSchema)

module.exports = Jobs