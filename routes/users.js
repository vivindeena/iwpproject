const router = require('express').Router()
const bcrypt = require('bcryptjs')
const verify = require('./verifyToken')
const { Auth } = require('two-step-auth')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Otp = require('../models/Otp')
const Employer = require("../models/Employer")

// @TODO Add recaptcha middleware
router.post('/register', (req, res) => {
  if (!req.body.email) {
    return res.status(400).json({
      errorMessage: 'Missing Required Params'
    })
  }

  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        return res.status(400).json({
          errorMessage: 'User Already Exists'
        })
      } else {
        login(req.body.email, "registration")
        return res.status(200).json({
          otpSentStatus: 'success',
          message: 'call otp verification endpoint'
        })
      }
    })
    .catch((err) => {
      console.log('Error:', err)
    })
})

router.post('/otpVerify', (req, res) => {
  if (
    !req.body.name ||
    !req.body.email ||
    !req.body.password ||
    !req.body.phoneNo ||
    !req.body.otp
  ) {
    return res.status(400).json({
      errorMessage: 'Missing Required Params'
    })
  }
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        return res.status(400).json({
          errorMessage: 'User Already Exists'
        })
      } else {
        Otp.findOne({ otp: req.body.otp })
          .then((otp) => {
            if (!otp) {
              return res.status(400).json({
                errorMessage: 'OTP does not exist'
              })
            } else {
              const current = new Date()
              const hours = current.getHours()
              var expiryMinutes = current.getMinutes().toString()
              if (expiryMinutes.length == 1)
                expiryMinutes = "0" + expiryMinutes;
              console.log(expiryMinutes.toString())
              const expiryTime = hours.toString() + ':' + expiryMinutes.toString()
              if (otp.email !== req.body.email || otp.requirement !== "registration") {
                return res.status(400).json({
                  errorMessage: 'OTP Not Valid'
                })
              }
              if (expiryTime.localeCompare(otp.expiryTime) > 0) {
                return res.status(400).json({
                  errorMessage: 'OTP expired'
                })
              } else {
                const name = req.body.name
                const email = req.body.email
                const phoneNo = req.body.phoneNo
                const password = req.body.password
                const newUser = new User({
                  name,
                  password,
                  email,
                  phoneNo
                })

                // hash
                bcrypt.genSalt(10, (err, salt) => {
                  if (err) {
                    return res.status(400).json({
                      errorMessage: err
                    })
                  }
                  bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) {
                      return res.status(400).json({
                        errorMessage: err
                      })
                    }

                    newUser.password = hash
                    newUser
                      .save()
                      .then((user) => {

                        Otp.deleteOne({ _id: otp._id })
                          .then(() => {
                            return res.status(200).json({
                              message: 'success'
                            })
                          })
                          .catch((err) => {
                            return res.status(400).json({
                              errorMessage: err
                            })
                          })
                      })
                      .catch((err) => {
                        return res.status(400).json({
                          errorMessage: err
                        })
                      })
                  })
                })
              }
            }
          })
          .catch((err) => {
            console.log('Error:', err)
          })
      }
    })
    .catch((err) => {
      console.log('Error:', err)
    })
})

router.post('/forgotPassword', (req, res) => {
  if (!req.body.email) {
    return res.status(400).json({
      errorMessage: 'Missing Required Params'
    })
  }

  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          errorMessage: 'User Doesnt Exists'
        })
      } else {
        login(req.body.email, "forgotPassword")
        return res.status(200).json({
          otpSentStatus: 'success',
          message: 'call updatePassowrd otp verification endpoint'
        })
      }
    })
    .catch((err) => {
      console.log('Error:', err)
    })
})

router.patch('/updatePassword', (req, res) => {
  if (!req.body.password || !req.body.otp || !req.body.email) {
    return res.status(400).json({
      errorMessage: 'Missing Required Params'
    })
  }

  Otp.findOne({ otp: req.body.otp })
    .then((otp) => {
      if (!otp) {
        return res.status(400).json({
          errorMessage: 'OTP does not exist'
        })
      } else {
        const current = new Date()
        const hours = current.getHours()
        var expiryMinutes = current.getMinutes().toString()
        if (expiryMinutes.length == 1)
          expiryMinutes = "0" + expiryMinutes;
        const expiryTime = hours.toString() + ':' + expiryMinutes.toString()
        if (otp.email !== req.body.email || otp.requirement !== "forgotPassword") {
          return res.status(400).json({
            errorMessage: 'OTP Not Valid'
          })
        }
        if (expiryTime.localeCompare(otp.expiryTime) > 0) {
          return res.status(400).json({
            errorMessage: 'OTP expired'
          })
        } else {
          User.findOne({ email: req.body.email })
            .then((user) => {
              if (!user) {
                return res.status(400).json({
                  errorMessage: "User doesn't Exists!"
                })
              } else {
                // hash
                bcrypt.genSalt(10, (err, salt) => {
                  if (err) {
                    return res.status(400).json({
                      errorMessage: err
                    })
                  }
                  bcrypt.hash(req.body.password, salt, (err, hash) => {
                    if (err) {
                      return res.status(400).json({
                        errorMessage: err
                      })
                    }

                    User.updateOne(
                      { email: req.body.email },
                      {
                        $set: {
                          password: hash
                        }
                      }
                    )
                      .then((update) => {

                        Otp.deleteOne({ _id: otp._id })
                          .then(() => {
                            res.status(200).json({
                              message: 'Details updated Successfully!'
                            })
                          })
                          .catch((err) => {
                            console.log('Error:', err)
                          })
                      })
                      .catch((err) => {
                        console.log('Error:', err)
                      })
                  })
                })
              }
            })
            .catch((err) => {
              console.log('Error:', err)
            })
        }
      }
    })
    .catch((err) => {
      console.log('Error:', err)
    })
})

router.post('/login', (req, res) => {
  // CHECKING IF EMAIL EXISTS
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(400).send('Email or Password Does Not Exist')
      }

      // CHECKING IF PASSWORD IS CORRECT
      const validPass = bcrypt.compare(req.body.password, user.password)

      if (!validPass) {
        return res.status(400).send('Invalid Password or Email')
      }

      // CREATE AND ASSIGN A TOKEN
      const token = jwt.sign(
        {
          _id: user._id,
          name: user.name,
          email: user.email,
          phoneNo: user.phoneNo,
          resumeLink: user.resumeLink,
          booked: user.booked,
          approvalStatus: user.approvalStatus
        },
        process.env.TOKEN_SECRET
      )
      res.status(200).json({
        success: true,
        message: 'Authentication Successful!',
        token: token
      })
    })
    .catch((err) => {
      console.log('Error:', err)
    })
})

router.get('/profile', verify, (req, res) => {
  User.findOne({ email: req.user.email })
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          Message: "User doesn't Exists!"
        })
      }
      return res.status(200).json({
        name: user.name,
        email: user.email,
        phoneNo: user.phoneNo,
        resumeLink: user.resumeLink
      })
    })
    .catch((err) => {
      console.log('Error:', err)
      return res.status(400).json({
        Error: err
      })
    })
})

router.patch('/update', verify, (req, res) => {
  if (!req.body.name || !req.body.phoneNo) {
    return res.status(400).json({
      errorMessage: 'Missing Required Params'
    })
  }

  User.findOne({ email: req.user.email })
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          errorMessage: "User doesn't Exists!"
        })
      } else {
        User.updateOne(
          { email: req.user.email },
          {
            $set: {
              name: req.body.name,
              phoneNo: req.body.phoneNo
            }
          }
        )
          .then((update) => {
            req.user.resumeLink = req.body.resumeLink
            req.user.name = req.body.name
            req.user.phoneNo = req.body.phoneNo
            res.status(200).json({
              message: 'Details updated Successfully!'
            })
          })
          .catch((err) => {
            console.log('Error:', err)
          })
      }
    })
    .catch((err) => {
      console.log('Error:', err)
    })
})

router.get('/logout', (req, res) => {
  return res.status(200).json({
    message: 'logged out'
  })
})

let otp = 0

async function login(emailId, requirement) {
  try {
    const res = await Auth(emailId, 'Job Portal')
    otp = res.OTP
    const current = new Date()
    let hours = current.getHours()
    console.log(current.getMinutes().toString())
    let expiryMinutes = current.getMinutes() + 10
    if (expiryMinutes > 60) {
      hours = hours + 1
      if (hours == 24) {
        hours = '00'
      }
      expiryMinutes = expiryMinutes - 60
    }
    var email = emailId
    const expiryTime = hours.toString() + ':' + expiryMinutes.toString()
    const newOtp = new Otp({
      otp,
      email,
      expiryTime,
      requirement
    })
    newOtp
      .save()
      .then((otp) => {
        console.log('done')
      })
      .catch((err) => {
        console.log(err)
      })
    console.log(res.success)
  } catch (error) {
    console.log(error)
  }
}

router.get('/test', (req, res) => {
  const current = new Date()
  let hours = current.getHours()
  body = current.getMinutes().toString()
  if(body.length == 1)
    body="0"+body
  return res.status(200).json({
    message: body
  })
})

router.get('/getAll', verify, (req, res) => {
  if (req.user._id.equals(process.env.ADMIN)) {
    User.find().then((infos) => {
      res.status(200).json(infos)
    })
  } else {
    return res.status(400).json({
      errorMessage: 'unauthorized access request'
    })
  }
})

module.exports = router
