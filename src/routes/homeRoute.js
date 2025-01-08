const express = require('express')

const homeController = require('../controllers/homeController')

let router = express.Router()
let initWebRoutes = (app) => {
  router.get('/home', homeController.getHomePage)
  router.get('/about', homeController.getAbout)
  router.get('/contact', homeController.getContact)
  router.get('/', homeController.getHomePage)

  return app.use('/', router)
}
module.exports = initWebRoutes
