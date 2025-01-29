const { Book, Category, Sequelize, ReadingStatus } = require('../models')
const { Op } = require('sequelize')
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
  searchBooks: async ({
    userId,
    keyword,
    categoryId,
    status,
    owned,
    page = 1,
    limit = 10,
  }) => {
    try {
      //Dieu kien
      const whereConditions = {
        userId,
      }

      //status
      if (status && status !== 'all') {
        whereConditions.status = status
      }

      //Owned
      if (owned && owned !== 'all') {
        whereConditions.owned = owned === '1'
      }

      const offset = (page - 1) * limit

      //truy van du lieu
      const results = await ReadingStatus.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: Book,
            as: 'book',
            where: {
              ...(keyword
                ? {
                    title: {
                      [Op.like]: `%${keyword}%`,
                    },
                  }
                : {}),
              ...(categoryId && categoryId !== 'all'
                ? {
                    categoryId,
                  }
                : {}),
            },
          },
        ],
        limit,
        offset,
        raw: true,
        nest: true,
      })

      // results.rows.forEach((row) => {
      //   console.log('Book data:', row.book)
      // })

      if (!results || results.length === 0) {
        return {
          errCode: -1,
          data: [],
          errMessage: '本が存在ない',
        }
      } else {
        return {
          errCode: 0,
          data: results.rows,
          totalBooks: results.count,
        }
      }
    } catch (error) {
      console.log(error)
      return {
        errCode: 2,
        errMessage: error.message,
      }
    }
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
  getBooksByUserId: async (userId, sortField = 'title', sortOrder = 'ASC') => {
    try {
      const validSortFields = ['title', 'createdAt']
      if (!validSortFields.includes(sortField)) {
        sortField = 'title'
      }

      if (!['ASC', 'DESC'].includes(sortOrder.toUpperCase())) {
        sortOrder = 'ASC'
      }
      const books = await Book.findAll({
        where: { userId, deletedAt: null },
        order: [[sortField, sortOrder.toUpperCase()]],
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
          errMessage: '現在、書籍はありません。',
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
