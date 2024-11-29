// models/cartItem.js
module.exports = (sequelize, DataTypes) => {
  const CartItem = sequelize.define('CartItem', {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  })

  CartItem.associate = (models) => {
    CartItem.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    })
    CartItem.belongsTo(models.Book, {
      foreignKey: 'bookId',
      onDelete: 'CASCADE',
    })
  }

  return CartItem
}
