'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * アソシエーションを定義するためのヘルパーメソッド
     */
    static associate(models) {
      // CategoryとBookの1対多の関係
      Category.hasMany(models.Book, { foreignKey: 'categoryId', as: 'books' })
    }
  }
  Category.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'Category',
    },
  )
  return Category
}
