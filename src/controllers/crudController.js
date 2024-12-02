const db = require('../models/index') // モデルをインポート
const CRUDService = require('../services/CRUDService.js')
/*
// ホームページのデータを取得する関数
let getHomePage = async (req, res) => {
  try {
    // Userモデルからすべてのデータを取得
    let data = await db.User.findAll()

    // SequelizeのデータをJSON形式に変換
    let users = await data.map((user) => user.toJSON())

    // データをテンプレートに渡してレンダリング
    return res.render('new.hbs', { users })
  } catch (error) {
    // エラーが発生した場合にコンソールにログを出力
    console.log('error from getHomePage', error)
  }
}
*/

let getHomePage = async (req, res) => {
  let user = (await req.session.user) || null
  // let user = (await db.User.findOne({ where: { id: req?.params?.id } })) || null
  // return
  // if (user && user?.image) {
  //   const imageBase64 = new Buffer(user.image, 'base64')
  //   req.session.user.imageBase64 = `data:image/jpeg;base64,${imageBase64}`

  //   // const image = await new Buffer(user.image, 'base64')
  //   // .toString('binary')

  //   user.image = req.session.user.imageBase64
  //   // user.image = image
  // }

  res.render('home.hbs', { user })
}

let getUserData = (req) => {
  return req.session.user
}

let getCRUD = (req, res) => {
  try {
    return res.render('./admin/crud.hbs')
  } catch (error) {
    console.log('error from getCrud', error)
  }
}

let postCRUD = async (req, res) => {
  try {
    await CRUDService.createNewUser(req.body)

    return res.render('./user/login.hbs')
  } catch (error) {
    console.log('error from postCRUD', error)
  }
}

let displayGetCRUD = async (req, res) => {
  try {
    let data = await CRUDService.getAllUser()
    return res.render('./admin/displayCRUD.hbs', { dataTable: data })
  } catch (error) {
    console.log('error from postCRUD', error)
  }
}

let displayEditCRUD = async (req, res) => {
  try {
    let userId = req.query.id
    if (userId) {
      let userData = await CRUDService.getUserInfoById(userId)
      return res.render('./admin/editCRUD.hbs', {
        userData: userData,
      })
    } else {
      return res.send('user not found from displayEditCRUD')
    }
  } catch (error) {
    console.log('error from displayEditCRUD', error)
  }
}

let putCRUD = async (req, res) => {
  try {
    let data = req.body
    let allUser = await CRUDService.updateUserData(data)
    let users = allUser.map((user) => user.toJSON())
    return res.render('./admin/displayCRUD.hbs', { dataTable: users })
  } catch (error) {
    console.log('error from putCRUD', error)
  }
}

let deleteCRUD = async (req, res) => {
  try {
    let id = req.query.id

    if (id) {
      await CRUDService.deleteUserById(id)
      let data = await CRUDService.getAllUser()
      return res.render('./admin/displayCRUD.hbs', { dataTable: data })
      // return res.send('delete success')
    } else {
      return res.send('not found')
    }
  } catch (error) {
    console.log('error from putCRUD', error)
  }
}

module.exports = {
  getHomePage,
  getCRUD,
  postCRUD,
  displayGetCRUD,
  displayEditCRUD,
  putCRUD,
  deleteCRUD,
}
