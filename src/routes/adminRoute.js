const express = require('express')

const adminController = require('../controllers/adminController')

const { isAdmin } = require('../middleware/authenticated')

const router = express.Router()

let adminWebRoutes = (app) => {
  router.get('/crud', isAdmin, adminController.getCRUD)
  router.post('/post-crud', isAdmin, adminController.postCRUD)
  router.get('/get-crud', isAdmin, adminController.displayGetCRUD)
  router.get('/edit-crud', isAdmin, adminController.displayEditCRUD)
  router.post('/put-crud', isAdmin, adminController.putCRUD)
  router.get('/delete-crud', isAdmin, adminController.deleteCRUD)

  return app.use('/admin', router)
}

module.exports = adminWebRoutes
