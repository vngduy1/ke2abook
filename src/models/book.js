'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      // BookとUserの多対1の関係
      Book.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })

      // BookとCategoryの多対1の関係
      Book.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category',
      })

      // BookとReadingStatusの1対多の関係
      Book.hasMany(models.ReadingStatus, {
        foreignKey: 'bookId',
        as: 'readingStatuses',
      })
    }
  }
  Book.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: DataTypes.TEXT,
      image: DataTypes.BLOB('long'),
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        paranoid: true,
        timestamps: true,
      },
    },
    {
      sequelize,
      modelName: 'Book',
      paranoid: true, //ソフト削除を有効にする
      timestamps: true,
    },
  )
  return Book
}
