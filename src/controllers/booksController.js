const booksService = require('../services/booksService')
const readingStatusService = require('../services/readingStatus')

// 本アップロード用のController
const booksController = {
  getBookDetails: async (req, res) => {
    const bookId = req.params.id
    const sessionUser = req.session.user

    try {
      const book = await booksService.getBookById(bookId, sessionUser.id)
      const books = await booksService.getBooksByUserId(sessionUser.id)
      if (books.errCode !== 0) {
        res.redirect('./books/errorBook.hbs')
      }
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
            books: books.data,
          })
        } else {
          res.render('./books/errorBook.hbs', {
            errMessage,
            user: sessionUser,
          })
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

  // リスト
  getAllBooksByUserId: async (req, res) => {
    const sessionUser = await req.session.user
    const userId = await req.session.user.id
    const sortOption = req.query.sortOption || 'title_ASC'
    const [sortField, sortOrder] = sortOption.split('_')

    try {
      const categories = await booksService.getCategories()
      const books = await booksService.getBooksByUserId(
        userId,
        sortField,
        sortOrder,
      )
      const { errCode, data } = books
      if (errCode === 0) {
        res.render('./books/listBooks.hbs', {
          books: data,
          user: sessionUser,
          sortField,
          sortOrder,
          categories,
        })
      }
      if (errCode === 1) {
        res.render('./books/listBooks.hbs', {
          books: data,
          user: sessionUser,
          sortField,
          sortOrder,
          message: '書籍のリスト空いてます。',
        })
      } else {
        const errMessage = books.errMessage
          ? books.errMessage
          : '本をリストできません。'
        res.render('./books/errorBook.hbs', {
          errMessage,
          user: sessionUser,
        })
      }
    } catch (error) {
      console.error('本の取得エラー:', error)
      res.render('./books/errorBook.hbs', {
        errMessage: error,
        user: sessionUser,
      })
    }
  },

  // 検索
  searchBooks: async (req, res) => {
    const sessionUser = req.session.user
    const categories = await booksService.getCategories()
    try {
      const {
        keyword,
        categoryId,
        status = 'all',
        owned = 'all',
        page = 1,
        limit = 10,
      } = req.query

      const result = await booksService.searchBooks({
        userId: sessionUser.id,
        keyword,
        categoryId,
        status,
        owned,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10,
      })

      //書籍だけ取得

      const books = Array.isArray(result.data)
        ? result.data.map((row) => row.book)
        : []

      const selectedCategoryId =
        categoryId !== 'all' ? parseInt(categoryId, 10) : 'all'

      if (result.errCode === -1) {
        res.render('./books/listBooks.hbs', {
          books: [],
          user: sessionUser.id,
          message: result.errMessage,
        })
      } else if (result.errCode === 0) {
        const totalPages = Math.ceil(result.totalBooks / limit)
        res.render('./books/listBooks.hbs', {
          books,
          user: sessionUser,
          currentPage: parseInt(page, 10),
          totalPages,
          hasPagination: result.totalBooks > limit,
          categories,
          query: { ...req.query, categoryId: selectedCategoryId },
        })
      } else {
        res.render('./books/errorBooks.hbs', {
          user: sessionUser,
          errMessage: result.errMessage,
        })
      }

      // const books = result.data.map((row) => row.book)

      // if (result.errCode === -1) {
      //   res.render('./books/listBooks.hbs', {
      //     books: result.data,
      //     user: sessionUser.id,
      //     message: result.errMessage,
      //   })
      // }

      // const selectedCategoryId =
      //   categoryId !== 'all' ? parseInt(categoryId, 10) : 'all'
      // if (result.errCode === 0) {
      //   const totalPages = Math.ceil(result.totalBooks / limit)
      //   res.render('./books/listBooks.hbs', {
      //     books,
      //     user: sessionUser,
      //     currentPage: parseInt(page, 10),
      //     totalPages,
      //     hasPagination: result.totalBooks > limit,
      //     categories,
      //     query: { ...req.query, categoryId: selectedCategoryId },
      //   })
      // } else {
      //   res.render('./books/errorBook.hbs', {
      //     user: sessionUser,
      //     errMessage: result.errMessage,
      //   })
      // }
    } catch (error) {
      // console.error('書籍検索エラー:', error)
      res.render('./books/errorBooks.hbs', {
        user: sessionUser,
        errMessage: 'Database error',
      })
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
      const categories = await booksService.getCategories()
      const file = req.file
      const { title, author, description, categoryId, userId, status } =
        req.body
      const owned = req.body.owned === 'on' // チェックボックスが選択されている場合は「オン」を返します

      if (!title || !author || !categoryId || !status) {
        const user = await req.session.user
        const errMessage = '所有物ではありません '
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

        res.render('./books/createBook.hbs', {
          errMessage: newBook.errMessage,
          user,
          categories,
        })
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
    const userId = sessionUser.id

    try {
      // サービスを呼び出して、ユーザーの論理的に削除された書籍を取得します
      const result = await booksService.getTrashBooksByUserId(userId)
      const { errCode, data, errMessage } = result

      if (errCode === 0) {
        if (data.length === 0) {
          return res.render('./books/listTrashBooks.hbs', {
            books: [],
            user: sessionUser,
            message: '空いてます。',
          })
        }
        // 削除された書籍データがある場合は listtrashbooks.hbs ページをレンダリングします
        res.render('./books/listTrashBooks.hbs', {
          books: data,
          user: sessionUser,
        })
      } else {
        // 本が削除されていない場合はエラー ページを表示します
        res.render('./books/errorBook.hbs', {
          errMessage: errMessage || '削除された本は見つかりませんでした。',
          user: sessionUser,
        })
      }
    } catch (error) {
      console.error(
        'ユーザー ID によるゴミブックの取得中にエラーが発生しました:',
        error,
      )
      res.render('./books/errorBook.hbs', {
        errMessage: error.message,
        user: sessionUser,
      })
    }
  },

  restoreBookById: async (req, res) => {
    const bookId = req.params.id
    const sessionUser = await req.session.user

    try {
      const result = await booksService.restoreBookById(bookId)

      if (result.errCode === 0) {
        res.redirect('/book/trash-book')
      } else {
        res.render('./books/errorBook.hbs', {
          errMessage: result.errMessage,
          user: sessionUser.id,
        })
      }
    } catch (error) {
      console.error('本の復元中にエラーが発生しました:', error)
      res.render('./books/errorBook.hbs', {
        errMessage: '内部サーバーエラー',
      })
    }
  },

  // 本を完全に削除する
  permanentlyDeleteBook: async (req, res) => {
    const sessionUser = req.session.user
    try {
      const bookId = req.params.id

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
      console.log('ハード削除', error)

      res.render('./books/errorBook.hbs', {
        errMessage: error,
        user: sessionUser,
      })
    }
  },
}

module.exports = booksController
