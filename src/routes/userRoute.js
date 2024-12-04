const express = require('express')

const userController = require('../controllers/userController')
const upload = require('../middleware/upload')
const { isAuthenticated, isGuest } = require('../middleware/authenticated')

let router = express.Router()
let userRoute = (app) => {
  //user
  router.get('/sign-up', userController.handleSignUp)
  router.get('/sign-in', isGuest, userController.handleSignIn)
  router.post('/login', userController.handleLogin)
  router.get('/logout', userController.handleLogout)
  router.get('/profile', isAuthenticated, userController.getProfilePage)
  router.post(
    '/update-profile',
    upload.single('image'),
    isAuthenticated,
    userController.handleEditProfile,
  )
  router.post(
    '/create-new-user',
    upload.single('image'),
    userController.handleCreateNewUser,
  )

  return app.use('/api', router)
}
module.exports = userRoute
