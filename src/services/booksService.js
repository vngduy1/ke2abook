const { Book, Category, Sequelize } = require('../models')
const fs = require('fs')

const path = require('path')

// 本管理用のサービス
const booksService = {
  getCategories: async () => {
    try {
      const categories = await Category.findAll({ raw: true })

      return categories
    } catch (error) {
      console.log(error)
    }
  },
  // Tìm kiếm sách
  searchBooks: async (keyword) => {
    return await Book.findAll({
      where: {
        title: {
          [Op.like]: `%${keyword}%`,
        },
      },
      raw: true,
    })
  },

  getBookById: async (bookId, userId) => {
    try {
      const data = await Book.findByPk(bookId, { raw: true })

      if (!data) {
        return {
          errCode: -1,
        }
      }
      if (data?.userId !== userId) {
        return {
          errCode: -1,
        }
      } else {
        return {
          errCode: 0,
          data,
        }
      }
    } catch (error) {
      console.error('Error fetching book by ID:', error)
      return {
        errCode: 2,
        errMessage: error,
      }
    }
  },

  // Lấy danh sách sách
  getBooksByUserId: async (userId) => {
    try {
      const books = await Book.findAll({
        where: { userId, deletedAt: null },
        raw: true,
      })
      if (books && books.length > 0) {
        return {
          errCode: 0,
          data: books,
        }
      } else {
        return {
          errCode: 0,
          data: [],
          errMessage: 'Thung rac trong',
        }
      }
    } catch (error) {
      console.error('Error fetching books by userId:', error)
      return {
        errCode: 2,
        errMessage: error,
      }
    }
  },

  checkBook: async (title, userId) => {
    const existingBook = await Book.findOne({
      where: {
        title,
        userId,
      },
    })
    return existingBook ? true : false
  },

  // 本を作成する
  createBook: async (bookData) => {
    try {
      const { title, userId } = bookData
      const checkBook = await booksService.checkBook(title, userId)
      if (checkBook) {
        return {
          errCode: 1,
          errMessage: 'A book with this title already exists for this user',
        }
      } else {
        const data = await Book.create(bookData)
        console.log(data)
        if (data) {
          return {
            errCode: 0,
            errMessage: 'createBook successfully',
            data,
          }
        } else {
          return {
            errCode: 1,
            errMessage: 'createBook failure',
          }
        }
      }
    } catch (error) {
      return {
        errCode: 2,
        errMessage: error,
      }
    }
  },

  // 本を更新する
  updateBook: async (id, updates) => {
    try {
      let book = await Book.findByPk(id)

      if (!book) {
        return {
          errCode: -1,
          errMessage: 'Cannot get book by id',
        }
      }

      const data = await book.update(updates)
      if (!data) {
        return {
          errCode: -1,
        }
      } else {
        return { errCode: 0, data }
      }
    } catch (error) {
      console.log(error)
      return {
        errCode: 2,
        errMessage: 'updateBook failure error',
      }
    }
  },

  // 論理削除 (thùng rácに移動)
  softDeleteBook: async (id) => {
    try {
      const book = await Book.findByPk(id)

      if (!book) {
        return {
          errCode: -1,
        }
      } else {
        const data = await book.destroy()

        if (!data) {
          return {
            errCode: 1,
            errMessage: 'cannot delete book ',
          }
        } else {
          return {
            errCode: 0,
            data,
          }
        }
      }
    } catch (error) {
      console.log(error)
      return {
        errCode: 2,
        errMessage: error,
      }
    }
  },

  getTrashBooksByUserId: async (userId) => {
    try {
      // Tìm tất cả sách đã xóa mềm của người dùng
      const books = await Book.findAll({
        where: {
          userId,
          deletedAt: { [Sequelize.Op.ne]: null }, // Kiểm tra deletedAt khác null tức là đã bị xóa
        },
        paranoid: false, // Đảm bảo lấy cả sách đã xóa mềm
        raw: true,
      })

      if (books && books.length > 0) {
        return {
          errCode: 0,
          data: books,
        }
      } else {
        return {
          errCode: 1,
          errMessage: 'No deleted books found.',
          data: [],
        }
      }
    } catch (error) {
      console.error('Error fetching trash books:', error)
      return {
        errCode: 2,
        errMessage: error.message,
      }
    }
  },

  restoreBookById: async (bookId) => {
    try {
      // Tìm sách đã bị xóa mềm
      const book = await Book.findOne({
        where: { id: bookId },
        paranoid: false, // Bao gồm cả sách đã bị xóa mềm
      })
      console.log(book)

      if (!book) {
        return {
          errCode: -1,
          errMessage: 'Book not found',
        }
      }

      // Khôi phục sách
      const data = await book.restore()
      if (data) {
        return {
          errCode: 0,
          message: 'Book restored successfully',
          data,
        }
      }
    } catch (error) {
      console.error('Error restoring book:', error)
      return {
        errCode: 2,
        errMessage: error.message,
      }
    }
  },

  // 完全に削除する
  hardDeleteBook: async (id) => {
    try {
      const book = await Book.findByPk(id, { paranoid: false })
      console.log(id)

      console.log(book)

      if (!book) {
        return {
          errCode: -1,
        }
      } else {
        const data = await book.destroy({ force: true })

        if (!data) {
          return {
            errCode: 1,
            errMessage: 'cannot hard delete',
          }
        } else {
          return {
            errCode: 0,
            errMessage: 'delete Successfully',
          }
        }
      }
    } catch (error) {
      console.log(error)
      return {
        errCode: 2,
        errMessage: error,
      }
    }
  },

  // 画像をBase64形式に変換する
  processImage: (file) => {
    const imageBuffer = fs.readFileSync(file.path)
    const imageBase64 = imageBuffer.toString('base64')
    fs.unlinkSync(file.path) // 一時ファイルを削除
    return imageBase64
  },

  defaultImage: () => {
    return fs
      .readFileSync(path.join(__dirname, '../public/images/book.jpg'))
      .toString('base64')
  },
}

module.exports = booksService
