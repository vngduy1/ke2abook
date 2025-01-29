require('dotenv').config()

const { Sequelize } = require('sequelize')
const { DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_DIALECT, DB_PORT } = process.env

//deploy用
const {
  MYSQL_ADDON_HOST,
  MYSQL_ADDON_DB,
  MYSQL_ADDON_USER,
  MYSQL_ADDON_PORT,
  MYSQL_ADDON_PASSWORD,
} = process.env

//local用
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: DB_DIALECT,
  logging: false,
})

//DEPLOY用
// const sequelize = new Sequelize(
//   MYSQL_ADDON_DB,
//   MYSQL_ADDON_USER,
//   MYSQL_ADDON_PASSWORD,
//   {
//     host: MYSQL_ADDON_HOST,
//     dialect: 'mysql',
//     port: MYSQL_ADDON_PORT,
//     logging: false,
//     dialectOptions: {
//       ssl: {
//         rejectUnauthorized: false,
//       },
//     },
//   },
// )

let connectDB = async () => {
  try {
    await sequelize.authenticate()
    console.log('データベースの接続に成功しました!')
  } catch (error) {
    console.error('デフォルトで接続する!!!', error)
  }
}
module.exports = connectDB
