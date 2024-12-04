const booksService = require('../services/booksService')

// 本アップロード用のController
const booksController = {
  // Lấy danh sách sách
  getAllBooks: async (req, res) => {
    try {
      const books = await booksService.getAllBooks()
      console.log('books', books)

      return res.render('home.hbs', { books }) // Truyền danh sách sách sang giao diện
    } catch (error) {
      return res
        .status(500)
        .json({ message: '本を取得中にエラーが発生しました。', error })
    }
  },

  createNewBookPage: (req, res) => {
    res.render('./books/createBook.hbs')
  },

  // 新しい本を作成する
  createBook: async (req, res) => {
    try {
      const file = req.file
      const bookData = req.body

      // 必須項目のチェック
      if (!bookData.title || !bookData.description || !bookData.type || !file) {
        return res.status(400).json({ message: '必須項目が不足しています！' }) // 日本語でエラーメッセージ
      }

      // 画像をBase64形式に変換
      const imageBase64 = booksService.processImage(file)
      bookData.image = imageBase64

      const newBook = await booksService.createBook(bookData)
      return res
        .status(201)
        .json({ message: '本が作成されました！', book: newBook })
    } catch (error) {
      console.log(error)

      return res
        .status(500)
        .json({ message: '本を作成中にエラーが発生しました。', error })
    }
  },

  // 本を編集する
  updateBook: async (req, res) => {
    try {
      const bookId = req.params.id
      const updates = req.body

      // 必須項目のチェック
      if (!updates.title || !updates.description || !updates.type) {
        return res.status(400).json({ message: '必須項目が不足しています！' })
      }

      const updatedBook = await booksService.updateBook(bookId, updates)
      if (!updatedBook) {
        return res.status(404).json({ message: '本が見つかりません！' })
      }
      return res
        .status(200)
        .json({ message: '本が更新されました！', book: updatedBook })
    } catch (error) {
      return res
        .status(500)
        .json({ message: '本を更新中にエラーが発生しました。', error })
    }
  },

  // 本を削除する (論理削除)
  deleteBook: async (req, res) => {
    try {
      const bookId = req.params.id
      const deletedBook = await booksService.softDeleteBook(bookId)
      if (!deletedBook) {
        return res.status(404).json({ message: '本が見つかりません！' })
      }
      return res
        .status(200)
        .json({ message: '本が削除されました (論理削除)！' })
    } catch (error) {
      return res
        .status(500)
        .json({ message: '本を削除中にエラーが発生しました。', error })
    }
  },

  // 本を完全に削除する
  permanentlyDeleteBook: async (req, res) => {
    try {
      const bookId = req.params.id
      const deletedBook = await booksService.hardDeleteBook(bookId)
      if (!deletedBook) {
        return res.status(404).json({ message: '本が見つかりません！' })
      }
      return res.status(200).json({ message: '本が完全に削除されました！' })
    } catch (error) {
      return res
        .status(500)
        .json({ message: '本を完全に削除中にエラーが発生しました。', error })
    }
  },
}

module.exports = booksController
