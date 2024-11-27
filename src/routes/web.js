const express = require('express')
const homeController = require('../controllers/homeController')

let router = express.Router()
let initWebRoutes = (app) => {
  router.get('/new', homeController.getHomePage)
  router.get('/crud', homeController.getCRUD)

  router.post('/post-crud', homeController.postCRUD)
  router.get('/get-crud', homeController.displayGetCRUD)
  router.get('/edit-crud', homeController.displayEditCRUD)
  router.post('/put-crud', homeController.putCRUD)
  router.get('/delete-crud', homeController.deleteCRUD)

  return app.use('/', router)
}
module.exports = initWebRoutes
