'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // UserとBookの1対多の関係
      User.hasMany(models.Book, { foreignKey: 'userId', as: 'books' })

      // UserとReadingStatusの1対多の関係
      User.hasMany(models.ReadingStatus, {
        foreignKey: 'userId',
        as: 'readingStatuses',
      })
    }
  }
  User.init(
    {
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      address: DataTypes.STRING,
      phonenumber: DataTypes.STRING,
      image: DataTypes.BLOB('long'),
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'User',
    },
  )
  return User
}
