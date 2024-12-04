const express = require('express')

const homeController = require('../controllers/homeController')
const booksController = require('../controllers/booksController')

let router = express.Router()
let initWebRoutes = (app) => {
  router.get('/home', homeController.getHomePage)
  router.get('/', booksController.getAllBooks)

  return app.use('/', router)
}
module.exports = initWebRoutes
