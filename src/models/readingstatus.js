'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class ReadingStatus extends Model {
    /**
     * アソシエーションを定義するためのヘルパーメソッド
     */
    static associate(models) {
      // ReadingStatusとUserの多対1の関係
      ReadingStatus.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })

      // ReadingStatusとBookの多対1の関係
      ReadingStatus.belongsTo(models.Book, { foreignKey: 'bookId', as: 'book' })
    }
  }
  ReadingStatus.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      bookId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [['未読', '読書中', '読了']],
        },
      },
      owned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'ReadingStatus',
    },
  )
  return ReadingStatus
}
