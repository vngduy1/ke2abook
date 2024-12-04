'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      //関係を識別する
      Book.hasMany(models.CartItem, { foreignKey: 'bookId', as: 'cartItems' })
    }
  }
  Book.init(
    {
      title: {
        type: DataTypes.TEXT,
        allowNull: false, // Không cho phép null
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      image: DataTypes.BLOB('long'),
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.FLOAT, // Kiểu dữ liệu giá (số thực)
        allowNull: false,
      },
      author: {
        type: DataTypes.STRING, // Thêm trường tác giả
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Book',
    },
  )
  return Book
}
