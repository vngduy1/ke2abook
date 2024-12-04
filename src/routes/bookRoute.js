const express = require('express')

const booksController = require('../controllers/booksController')
const upload = require('../middleware/upload')
const { isAdmin } = require('../middleware/authenticated')

let router = express.Router()
let userRoute = (app) => {
  //book
  router.get(
    '/create-new-book',
    upload.single('image'),
    booksController.createNewBookPage,
  )
  router.post(
    '/create-new-book',
    upload.single('image'),
    booksController.createBook,
  )
  router.put('/update/:id', booksController.updateBook)
  router.delete('/delete/:id', booksController.deleteBook)
  router.delete('/hard-delete/:id', booksController.permanentlyDeleteBook)

  return app.use('/book', router)
}
module.exports = userRoute
