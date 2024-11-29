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
  router.get('/profile', userController.getProfilePage)
  router.post(
    '/update-profile',
    upload.single('image'),
    userController.handleEditProfile,
  )
  router.get('/get-all-users', isAuthenticated, userController.getAllUser)
  router.post(
    '/create-new-user',
    upload.single('image'),
    userController.handleCreateNewUser,
  )
  router.put('/edit-user', isAuthenticated, userController.handleEditUser)
  router.delete(
    '/delete-user',
    isAuthenticated,
    userController.handleDeleteUser,
  )

  return app.use('/api', router)
}
module.exports = userRoute
