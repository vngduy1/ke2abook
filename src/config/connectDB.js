require('dotenv').config()

const { Sequelize } = require('sequelize')
const { DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_DIALECT } = process.env

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: 'localhost',
  dialect: DB_DIALECT,
  logging: false,
})
let connectDB = async () => {
  try {
    await sequelize.authenticate()
    console.log('データベースの接続に成功しました!')
  } catch (error) {
    console.error('デフォルトで接続する!!!', error)
  }
}
module.exports = connectDB
