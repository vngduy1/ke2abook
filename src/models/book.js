'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      //関係を識別する
      Book.hasMany(models.CartItem, { foreignKey: 'bookId' })
      //User(admin)
      Book.belongsTo(models.User, { foreignKey: 'adminId', as: 'admin' })
    }
  }
  Book.init(
    {
      name: DataTypes.STRING,
      image: DataTypes.TEXT,
      title: DataTypes.TEXT,
      description: DataTypes.TEXT,
      adminId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Book',
    },
  )
  return Book
}
