const express = require('express')

const crudController = require('../controllers/crudController')

const { isAdmin } = require('../middleware/authenticated')

const router = express.Router()

let adminWebRoutes = (app) => {
  router.get('/crud', isAdmin, crudController.getCRUD)
  router.post('/post-crud', isAdmin, crudController.postCRUD)
  router.get('/get-crud', isAdmin, crudController.displayGetCRUD)
  router.get('/edit-crud', isAdmin, crudController.displayEditCRUD)
  router.post('/put-crud', isAdmin, crudController.putCRUD)
  router.get('/delete-crud', isAdmin, crudController.deleteCRUD)

  return app.use('/admin', router)
}

module.exports = adminWebRoutes
