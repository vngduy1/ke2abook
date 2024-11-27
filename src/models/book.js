'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      //Định danh các mối quan hệ
    }
  }
  Book.init(
    {
      name: DataTypes.STRING,
      image: DataTypes.TEXT,
      title: DataTypes.TEXT,
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'Book',
    },
  )
  return Book
}
