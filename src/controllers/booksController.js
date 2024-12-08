const booksService = require('../services/booksService')
const readingStatusService = require('../services/readingStatus')

// 本アップロード用のController
const booksController = {
  getBookDetails: async (req, res) => {
    const bookId = req.params.id
    const sessionUser = req.session.user

    try {
      const book = await booksService.getBookById(bookId, sessionUser.id)

      if (book.errCode === -1) {
        res.redirect('/')
      } else {
        const { userId, id } = book.data
        const { errMessage, data } = book
        const bookStatus = await readingStatusService.getReadingStatusByBookId(
          userId,
          id,
        )
        const { status, owned } = bookStatus.data

        if (bookStatus) {
          res.render('./books/book-details.hbs', {
            book: data,
            user: sessionUser,
            status,
            owned,
          })
        } else {
          res.render('./books/errorBook.hbs', { errMessage, user: sessionUser })
        }
      }
    } catch (error) {
      console.error('Error fetching book details:', error)
      res.render('./books/errorBook.hbs', {
        errMessage: error,
        user: sessionUser,
      })
    }
  },

  // Lấy danh sách sách
  getAllBooksByUserId: async (req, res) => {
    const sessionUser = await req.session.user
    const userId = await req.session.user.id
    const sortOption = req.query.sortOption || 'title_ASC'
    const [sortField, sortOrder] = sortOption.split('_')

    try {
      const books = await booksService.getBooksByUserId(
        userId,
        sortField,
        sortOrder,
      )
      const { errCode, data } = books
      if (errCode === 0) {
        if (data.length === 0) {
          res.render('./books/listBooks.hbs', {
            books: data,
            user: sessionUser,
            sortField,
            sortOrder,
            message: 'List book trong',
          })
        }
        res.render('./books/listBooks.hbs', {
          books: data,
          user: sessionUser,
          sortField,
          sortOrder,
        })
      } else {
        const errMessage = books.errMessage
          ? books.errMessage
          : 'Cannot list book errMessage'
        res.render('./books/errorBook.hbs', {
          errMessage,
          user: sessionUser,
        })
      }
    } catch (error) {
      console.error('Error fetching books:', error)
      res.render('./books/errorBook.hbs', {
        errMessage: error,
        user: sessionUser,
      })
    }
  },

  // Tìm kiếm sách
  searchBooks: async (req, res) => {
    try {
      const keyword = req.query.keyword
      const books = await booksService.searchBooks(keyword)

      res.render('./books/listBooks.hbs', { books })
    } catch (error) {
      console.error('Error searching books:', error)
      res.status(500).render('error', { message: 'Internal Server Error' })
    }
  },

  createNewBookPage: async (req, res) => {
    const categories = await booksService.getCategories()

    const user = await req.session.user
    res.render('./books/createBook.hbs', { categories, user })
  },

  // 新しい本を作成する
  createBook: async (req, res) => {
    try {
      const file = req.file // Ảnh bìa
      const { title, author, description, categoryId, userId, status } =
        req.body
      const owned = req.body.owned === 'on' // Checkbox trả về "on" nếu được chọn

      if (!title || !author || !categoryId || !status) {
        const categories = await booksService.getCategories()
        const user = await req.session.user
        const errMessage = 'not property '
        return res.render('./books/createBook.hbs', {
          categories,
          user,
          errMessage,
        })
      }

      // 画像をBase64形式に変換
      let imageBase64 = ''
      if (file) {
        imageBase64 = booksService.processImage(file)
      } else {
        imageBase64 = booksService.defaultImage()
      }

      const newBook = await booksService.createBook({
        title,
        author,
        description,
        image: imageBase64,
        categoryId,
        userId,
      })
      if (newBook.errCode === 0) {
        const createReading = await readingStatusService.createStatus({
          userId,
          bookId: newBook.data.id,
          status,
          owned,
        })
        if (createReading) {
          return res.redirect('/book/list')
        }
      } else {
        const user = await req.session.user

        let messageError = newBook.errMessage
        res.render('./books/createBook.hbs', { errMessage: messageError, user })
      }
    } catch (error) {
      console.log(error)

      res.render('./books/errorBook.hbs', { errMessage: error })
    }
  },

  editBookPage: async (req, res) => {
    const bookId = req.params.id

    const categories = await booksService.getCategories()
    const sessionUser = req.session.user
    const book = await booksService.getBookById(bookId, sessionUser.id)

    if (book.errCode === -1) {
      res.redirect('/')
    } else {
      const { data } = book
      const { categoryId, id, userId } = data
      const bookStatus = await readingStatusService.getReadingStatusByBookId(
        userId,
        id,
      )
      const { status, owned } = bookStatus.data
      res.render('./books/editBook.hbs', {
        categories,
        book: data,
        categoryId,
        status,
        owned,
      })
    }

    if (book.errCode === 2) {
      const errMessage = book.errMessage
      res.render('./books/errorBook.hbs', { errMessage })
    }
  },

  // 本を編集する
  updateBook: async (req, res) => {
    const sessionUser = req.session.user
    try {
      const bookId = req.params.id
      const updates = req.body

      if (req.file) {
        updates.image = booksService.processImage(req.file)
      }

      const updatedBook = await booksService.updateBook(bookId, updates)

      if (updatedBook.errCode === -1) {
        res.redirect('/')
      }
      if (updatedBook.errCode === 0) {
        const books = await booksService.getBooksByUserId(sessionUser.id)
        const { data } = books
        res.render('./books/listBooks.hbs', { books: data, user: sessionUser })
      } else {
        const errMessage = updatedBook.errMessage
        res.render('./books/errorBook.hbs', { errMessage, user: sessionUser })
      }
    } catch (error) {
      console.error('Error updating book:', error)
      res.render('./books/errorBook.hbs', {
        errMessage: error,
        user: sessionUser,
      })
    }
  },

  // 本を削除する (論理削除)
  deleteBook: async (req, res) => {
    const sessionUser = req.session.user
    try {
      const bookId = req.params.id
      const deletedBook = await booksService.softDeleteBook(bookId)

      switch (deletedBook.errCode) {
        case -1:
          res.redirect('/')
          break

        case 0:
          res.redirect('/book/list')
          break
        case 1:
          const books = await booksService.getBooksByUserId(sessionUser.id)
          const { data } = books
          res.render('./books/listBooks.hbs', {
            books: data,
            user: sessionUser,
            errMessage: errMessage,
          })
          break
        case 2:
          const errMessage = deletedBook.errMessage
          res.render('./books/errorBook.hbs', { errMessage, user: sessionUser })

          break
        default:
          break
      }
    } catch (error) {
      console.log('deleteBook', error)

      res.render('./books/errorBook.hbs', {
        errMessage: error,
        user: sessionUser,
      })
    }
  },

  getTrashBookByUserId: async (req, res) => {
    const sessionUser = await req.session.user
    const userId = sessionUser.id // Lấy userId từ session

    try {
      // Gọi service để lấy sách đã xóa mềm của người dùng
      const result = await booksService.getTrashBooksByUserId(userId)
      const { errCode, data, errMessage } = result

      if (errCode === 0) {
        if (data.length === 0) {
          return res.render('./books/listTrashBooks.hbs', {
            books: [],
            user: sessionUser,
            message: 'Thùng rác trống.', // Hiển thị thông báo
          })
        }
        // Render trang listTrashBooks.hbs nếu có dữ liệu sách đã xóa
        res.render('./books/listTrashBooks.hbs', {
          books: data,
          user: sessionUser,
        })
      } else {
        // Render trang lỗi nếu không có sách nào đã bị xóa
        res.render('./books/errorBook.hbs', {
          errMessage: errMessage || 'No deleted books found.',
          user: sessionUser,
        })
      }
    } catch (error) {
      console.error('Error fetching trash books by userId:', error)
      res.render('./books/errorBook.hbs', {
        errMessage: error.message,
        user: sessionUser,
      })
    }
  },

  restoreBookById: async (req, res) => {
    const bookId = req.params.id // Lấy ID sách từ URL

    try {
      const result = await booksService.restoreBookById(bookId)

      if (result.errCode === 0) {
        // Redirect hoặc render thông báo thành công
        res.redirect('/book/trash-book') // Chuyển hướng về danh sách sách đã xóa
      } else {
        // Render trang lỗi với thông báo
        res.render('./books/errorBook.hbs', { errMessage: result.errMessage })
      }
    } catch (error) {
      console.error('Error restoring book:', error)
      res.render('./books/errorBook.hbs', {
        errMessage: 'Internal Server Error',
      })
    }
  },

  // 本を完全に削除する
  permanentlyDeleteBook: async (req, res) => {
    const sessionUser = req.session.user
    try {
      const bookId = req.params.id
      console.log(bookId)

      const deletedBook = await booksService.hardDeleteBook(bookId)

      switch (deletedBook.errCode) {
        case -1:
          res.redirect('/')
          break

        case 0:
          res.redirect('/book/trash-book')
          break

        case 1:
          const books = await booksService.getBooksByUserId(sessionUser.id)
          const { data } = books
          res.render('./books/listBooks.hbs', {
            books: data,
            user: sessionUser,
            errMessage: errMessage,
          })
          break
        case 2:
          const errMessage = deletedBook.errMessage
          res.render('./books/errorBook.hbs', { errMessage, user: sessionUser })

          break
        default:
          break
      }
    } catch (error) {
      console.log('hard delete', error)

      res.render('./books/errorBook.hbs', {
        errMessage: error,
        user: sessionUser,
      })
    }
  },
}

module.exports = booksController
