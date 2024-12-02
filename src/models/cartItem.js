'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(models) {
      // Quan hệ với User
      CartItem.belongsTo(models.User, { foreignKey: 'userId' })
      // Quan hệ với Book
      CartItem.belongsTo(models.Book, { foreignKey: 'bookId' })
    }
  }
  CartItem.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      bookId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Books',
          key: 'id',
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'pending', // trạng thái mặc định là "pending"
      },
    },
    {
      sequelize,
      modelName: 'CartItem',
    },
  )
  return CartItem
}
