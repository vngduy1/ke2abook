const { Book } = require('../models')
const fs = require('fs')

// 本管理用のサービス
const booksService = {
  // Lấy danh sách sách
  getAllBooks: async () => {
    return await Book.findAll({
      raw: true,
    })
  },

  // 本を作成する
  createBook: async (bookData) => {
    return await Book.create(bookData)
  },

  // 本を更新する
  updateBook: async (id, updates) => {
    const book = await Book.findByPk(id)
    if (!book) {
      return null // 本が存在しない場合
    }
    return await book.update(updates)
  },

  // 論理削除 (thùng rácに移動)
  softDeleteBook: async (id) => {
    const book = await Book.findByPk(id)
    if (!book) {
      return null
    }
    return await book.update({ deletedAt: new Date() })
  },

  // 完全に削除する
  hardDeleteBook: async (id) => {
    const book = await Book.findByPk(id)
    if (!book) {
      return null
    }
    return await book.destroy()
  },

  // 画像をBase64形式に変換する
  processImage: (file) => {
    const imageBuffer = fs.readFileSync(file.path)
    const imageBase64 = imageBuffer.toString('base64')
    fs.unlinkSync(file.path) // 一時ファイルを削除
    return imageBase64
  },
}

module.exports = booksService
