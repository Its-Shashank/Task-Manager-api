const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendGoodbyeEmail } = require('../emails/account')

// Route for adding users to database.

router.post('/users', async (req, res) => {
  const user = new User(req.body)

  try {
    await user.save()
    sendWelcomeEmail(user.email, user.name)
    const token = await user.generateAuthToken()
    res.status(201).send({ user, token })
  } catch (e) {
    res.status(400).send(e)
  }
})

// Route for reading user to database.
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user)
})



// Route for updating existing endpoint.

router.patch('/users/me', auth, async(req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
  
  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid Updates'})
  }
  
  try {
    updates.forEach((update) => req.user[update] = req.body[update])
      // Bracket notation for updating 
    
    await req.user.save()
    res.send(req.user)
  } catch (e) {
    res.status(400).send(e)
  }
})

// Route for deleting a user.

router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove()
    sendGoodbyeEmail(req.user.email, req.user.name)
    res.send(req.user)
  } catch (e) {
    res.status(500).send(e)
  }
})

// Route to login.

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    
    res.send({ user, token })
  } catch (e) {
    res.status(400).send()
  }
})

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })
    // Here we used req.token, the token created when we logged in.

    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []

    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

// Only images are allowed to upload
const upload = multer({
  limits: {
    fileSize: 1000000
  }, 
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('File uploaded is not must be an image.'))
    }

    cb(undefined, true)
  }
})

// Remove dest property which will provide us a way to store files the way we want them to : as binary data

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
  
  // Buffer contains all of the binary data required for that file.
  req.user.avatar = buffer
  await req.user.save()
  res.send()
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
})

// Delete route
router.delete('/users/me/avatar', auth, async (req, res, next) => {
  req.user.avatar = undefined
  await req.user.save()
  res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user || !user.avatar) {
      throw new Error()
    }

    // Response header
    res.set('Content-Type', 'image.png')
    res.send(user.avatar)
  } catch (e) {
    res.status(404).send()
  }
})

module.exports = router