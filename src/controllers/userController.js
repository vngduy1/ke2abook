const fs = require('fs')
const userService = require('../services/userService.js')

const handleSignIn = (req, res) => {
  return res.render('./user/login.hbs')
}

const handleLogin = async (req, res) => {
  let email = req.body.email
  let password = req.body.password

  if (!email || !password) {
    return res.render('./user/login.hbs', {
      errCode: 1,
      message: '入力パラメータがありません!',
    })
  }

  const userData = await userService.handleUserLogin(email, password)

  if (userData.errCode === 0) {
    const imageBase64 = Buffer.from(userData.user.image).toString('binary')
    req.session.user = {
      id: userData.user.id,
      email: userData.user.email,
      isAdmin: userData.user.isAdmin,
      image: imageBase64,
    }
    return res.redirect('/')
  } else {
    return res.render('./user/login.hbs', {
      errCode: userData.errCode,
      message: userData.errMessage,
    })
  }
}

const getAllUser = async (req, res) => {
  let id = req.query.id
  if (!id) {
    return res.status(200).json({
      errCode: 1,
      errMessage: '必須パラメータが欠落している',
      users: [],
    })
  }
  let users = await userService.getAllUser(id)

  return res.status(200).json({
    errCode: 0,
    errMessage: 'getAllUser success',
    users,
  })
}

const handleCreateNewUser = async (req, res) => {
  try {
    let file = req.file
    let userData = req.body

    if (file) {
      // Đọc file và chuyển sang Base64
      const imageBuffer = fs.readFileSync(file.path)
      const imageBase64 = imageBuffer.toString('base64') // Chuyển thành chuỗi Base64

      // Gán chuỗi Base64 vào userData
      userData.image = imageBase64
      fs.unlinkSync(file.path)
    }

    let message = await userService.createNewUser(userData)
    console.log(message)
    if (message.errCode === 0) {
      return res.render('./user/login.hbs')
    } else {
      return res.status(400).json({ errMessage: message.errMessage })
    }
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ errMessage: 'Internal server error' })
  }
}

const handleEditUser = async (req, res) => {
  try {
    let data = req.body
    let message = await userService.editUser(data)
    return res.status(200).json(message)
  } catch (error) {
    console.log(error)
  }
}

const handleDeleteUser = async (req, res) => {
  if (!req.body.id) {
    return res.status(200).json({
      errCode: 1,
      errMessage: 'missing required parameters',
    })
  }
  let message = await userService.deleteUser(req.body.id)
  return res.status(200).json(message)
}

const getAllCode = async (req, res) => {
  try {
    let data = await userService.getAllCodeService(req.query.type)
    return res.status(200).json(data)
  } catch (error) {
    console.log('getAllCode', error)
    return res
      .status(200)
      .json({ errCode: -1, errMessage: 'Error from GetALLcode' })
  }
}

module.exports = {
  handleLogin,
  getAllUser,
  handleCreateNewUser,
  handleEditUser,
  handleDeleteUser,
  getAllCode,
  handleSignIn,
}