'use strict'
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'Books',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        author: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
        },
        image: {
          type: Sequelize.BLOB('long'),
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Users',
            key: 'id',
          },

          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        categoryId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Categories',
            key: 'id',
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        deletedAt: {
          type: Sequelize.DATE,
        },
      },
      {
        paranoid: true, // 論理的な削除を有効にする
        timestamps: true, // フィールドを作成しますcreatedat、updatedat
      },
    )
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Books')
  },
}
