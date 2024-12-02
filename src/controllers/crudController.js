const db = require('../models/index') // モデルをインポート
const CRUDService = require('../services/CRUDService.js')

let getHomePage = async (req, res) => {
  let user = (await req.session.user) || null

  res.render('home.hbs', { user })
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

    let user = (await req.session.user) || null
    return res.render('./admin/displayCRUD.hbs', { dataTable: data, user })
  } catch (error) {
    console.log('error from postCRUD', error)
  }
}

let displayEditCRUD = async (req, res) => {
  try {
    let userId = req.query.id

    let user = (await req.session.user) || null
    if (userId) {
      let userData = await CRUDService.getUserInfoById(userId)
      return res.render('./admin/editCRUD.hbs', {
        userData: userData,
        user,
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
