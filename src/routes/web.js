const express = require('express')

const crudController = require('../controllers/crudController')
const userController = require('../controllers/userController')
const upload = require('../middleware/upload')
const {
  isAuthenticated,
  isGuest,
  isAdmin,
} = require('../middleware/authenticated')

let router = express.Router()
let initWebRoutes = (app) => {
  router.get('/home', crudController.getHomePage)
  router.get('/', crudController.getHomePage)

  //user
  router.get('/api/sign-in', isGuest, userController.handleSignIn)
  router.post(
    '/api/create-new-user',
    upload.single('image'),
    userController.handleCreateNewUser,
  )
  router.post('/api/login', userController.handleLogin)
  router.get('/api/get-all-users', isAuthenticated, userController.getAllUser)
  router.put('/api/edit-user', isAuthenticated, userController.handleEditUser)
  router.delete(
    '/api/delete-user',
    isAuthenticated,
    userController.handleDeleteUser,
  )

  return app.use('/', router)
}
module.exports = initWebRoutes
