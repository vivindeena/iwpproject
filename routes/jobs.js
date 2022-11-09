const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const csv = require('csv-parser')
const verify = require('./verifyToken')
const fs = require('fs')
const directoryPath = path.join(__dirname, '../uploads')

const User = require("../models/User")
const Employer = require('../models/Employer')
const Job = require('../models/Jobs')

//assuming search has 4 filters
//title=&location=&skills=&yoe

router.get('/search', (req, res) => {
    param1 = req.query.p1;
    param2 = req.query.p2;

    if (!param1 || !param2) {
        res.status(400).json({
            errorMessage: 'Missing Required Params'
        })
    } else {
        switch (param2) {
            case 'location':
                Job.find({ location: param1 })
                    .then((data) => { res.status(200).json(data) })
                    .catch((err) => { res.status(400).json({ error: "error" }) })
                break;
            case 'title':
                Job.find({ title: param1 })
                    .then((data) => { res.status(200).json(data) })
                    .catch((err) => { res.status(400).json({ error: "error" }) })
                break;
            //ctrlc+v and change the fields you want to filter against as you like
        }
    }
})

router.post("/apply",verify,(req,res)=>{
    if(!req.body.email |!req.query.id){
        res.status(400).json({
            errorMessage: 'Missing Required Params'+req.body.email+" "+req.query.jobID
        })
    }
    User.findOne({email: req.body.email})
        .then((user)=>{
            if(!user){
                return res.status(400).send({
                    errorMessage: "Given user not an User"
                })
            }else {
                Job.findById(req.query.jobID)
                    .then((jobs)=>{
                        console.log(jobs)
                        if(!jobs){
                            return res.status(400).send({
                                errorMessage: "Given JobID doesn't match with existing jobs"
                            })
                        } else{
                            Job.updateOne(
                                { _id: req.query.jobID },
                                {
                                    $push: {
                                        currentApplication: req.body.email
                                    }
                                })
                            .then((data) =>{
                                res.status(200).json({
                                    message: "Applied",
                                })
                            }).catch((err)=> {
                                console.log("Error: ",err)
                            })
                        }
                    })
                    .catch((err)=>{
                        console.log("Error: ",err);
                    })
            }
        })
        .catch((err) => {
            console.log("Error: ", err);
        })
}) // Tested

router.post("/createListing", verify, (req,res)=>{
    if(!req.body.jobTitle||
        !req.body.jobDesc||
        !req.body.jobFeild||
        !req.body.jobLocation||
        !req.body.jobsDaysToExpiration||
        !req.body.jobSalary||
        !req.body.jobSkills||
        !req.body.posterEmail
        ){
        return res.status(400).json({
            errorMessage: 'Missing Required Params'
        })}
    Employer.findOne({email: req.body.posterEmail})
        .then((user) => {
            if (!user) {
                return res.status(400).json({
                    errorMessage: 'Given user not an Employer'
                })
            } 
            const title = req.body.jobTitle
            const description = req.body.jobDesc
            const postedBy = req.body.posterEmail
            const feild = req.body.jobFeild
            const location = req.body.jobLocation
            const daysToExpiration = req.body.jobsDaysToExpiration
            const salary = req.body.jobSalary
            const skills = req.body.jobSkills
            const yearsOfExperience = req.body.exp
            const newPosting = new Job({
                title,
                description,
                postedBy,
                feild,
                location,
                daysToExpiration,
                salary,
                yearsOfExperience,
                skills
            })
            newPosting.save().
            then(()=>{
                return res.status(200).json({
                    message: 'success'
                })
            })
            .catch((err)=>{
                console.log(err)
                return
            })
        })
        .catch((err) => {
            console.log('Error:', err)
        })
}) // Tested

router.post("/getApplicants", verify, (req,res)=>{
    if (!req.body.email || !req.body.jobID) {
        res.status(400).json({
            errorMessage: 'Missing Required Params'
        })
    }
    
    console.log("ehh")
})

module.exports = router