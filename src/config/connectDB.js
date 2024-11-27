const { Sequelize } = require('sequelize')
const sequelize = new Sequelize('ke2abook', 'root', null, {
  host: 'localhost',
  dialect: 'mysql',
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
