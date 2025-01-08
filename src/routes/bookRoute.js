const express = require('express')

const booksController = require('../controllers/booksController')
const upload = require('../middleware/upload')
const { isAuthenticated } = require('../middleware/authenticated')

let router = express.Router()
let userRoute = (app) => {
  router.use(isAuthenticated)
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

  router.get('/edit/:id', booksController.editBookPage)
  router.post('/edit/:id', upload.single('image'), booksController.updateBook)

  router.post('/delete/:id', booksController.deleteBook)

  router.post('/destroy/:id', booksController.permanentlyDeleteBook)

  router.get('/list', booksController.getAllBooksByUserId)
  router.get('/trash-book', booksController.getTrashBookByUserId)
  router.post('/restore/:id', booksController.restoreBookById)

  router.get('/book-details/:id', booksController.getBookDetails)

  router.get('/search', booksController.searchBooks)

  return app.use('/book', router)
}
module.exports = userRoute
