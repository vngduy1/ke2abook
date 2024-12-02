const express = require('express')

const crudController = require('../controllers/crudController')
const userController = require('../controllers/userController')
const upload = require('../middleware/upload')
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next() // ログイン済みの場合、処理を続行する
  } else {
    res.redirect('/api/sign-in') // 未ログインの場合、ログイン画面にリダイレクトする
  }
}

const isGuest = (req, res, next) => {
  if (req.session.user) {
    res.redirect('/home')
  } else {
    next()
  }
}

const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') {
    next()
  } else {
    res.redirect('/home')
  }
}

let router = express.Router()
let initWebRoutes = (app) => {
  router.get('/home', crudController.getHomePage)
  router.get('/', crudController.getHomePage)

  //admin
  router.get('/crud', isGuest, crudController.getCRUD)
  router.post('/post-crud', crudController.postCRUD)
  router.get(
    '/get-crud',
    isAuthenticated,
    isAdmin,
    crudController.displayGetCRUD,
  )
  router.get(
    '/edit-crud',
    isAuthenticated,
    isAdmin,
    crudController.displayEditCRUD,
  )
  router.post('/put-crud', isAuthenticated, isAdmin, crudController.putCRUD)
  router.get(
    '/delete-crud',
    isAuthenticated,
    isAdmin,
    crudController.deleteCRUD,
  )

  //user
  router.get('/api/sign-in', isGuest, userController.handleSignIn)
  router.post('/api/login', userController.handleLogin)
  router.get('/api/get-all-users', isAuthenticated, userController.getAllUser)
  router.post(
    '/api/create-new-user',
    upload.single('image'),
    userController.handleCreateNewUser,
  )
  router.put('/api/edit-user', isAuthenticated, userController.handleEditUser)
  router.delete(
    '/api/delete-user',
    isAuthenticated,
    userController.handleDeleteUser,
  )

  return app.use('/', router)
}
module.exports = initWebRoutes
