const fs = require('fs')
const path = require('path')
const userService = require('../services/userService.js')

const handleSignUp = (req, res) => {
  try {
    return res.render('./user/signUp.hbs')
  } catch (error) {
    console.log(error)
  }
}

const handleCreateNewUser = async (req, res) => {
  try {
    let file = req.file
    let userData = req.body

    if (file) {
      //ファイルを読み取ってbase64に変換します
      const imageBuffer = fs.readFileSync(file.path)
      const imageBase64 = imageBuffer.toString('base64') // Chuyển thành chuỗi Base64

      //Base64文字列をユーザーデータに割り当てる
      userData.image = imageBase64
      fs.unlinkSync(file.path)
    } else {
      userData.image = fs
        .readFileSync(path.join(__dirname, '../public/images/images.jpg'))
        .toString('base64')
    }

    let message = await userService.createNewUser(userData)

    if (message.errCode === 0) {
      res.redirect('/api/sign-in')
    } else {
      res.render('./user/signUp.hbs', {
        errMessage: 'エラーが発生しました。もう一度お試しください',
      })
    }
  } catch (error) {
    console.error('Error:', error)
    res.redirect('/')
  }
}

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
    const imageBase64 = userData.user.image
      ? Buffer.from(userData.user.image).toString('binary')
      : null
    req.session.user = {
      ...userData.user,
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

const handleLogout = async (req, res) => {
  try {
    await req.session.destroy((err) => {
      if (err) {
        console.error('セッション破棄エラー:', err)
        res.redirect('/')
      }

      res.clearCookie('connect.sid') // セッションCookieを削除する
      return res.redirect('/api/sign-in') // ログインページにリダイレクトします
    })
  } catch (error) {
    console.log(error)
  }
}

const getProfilePage = async (req, res) => {
  try {
    const user = await req.session.user

    const userData = await userService.handleUserProfile(user)

    if (userData.errCode === 0) {
      if (userData?.user?.image) {
        const imageBase64 = Buffer.from(userData.user.image).toString('binary')
        userData.user.image = imageBase64
      }
      return res.render('./user/profile.hbs', { userData, user })
    } else {
      return res.redirect('/api/sign-in', {
        errCode: userData.errCode,
        message: userData.errMessage,
      })
    }
  } catch (error) {
    console.error('Lỗi khi truy cập trang hồ sơ:', error)
    redirect('/')
  }
}

const handleEditProfile = async (req, res) => {
  try {
    const user = req.session.user
    const id = user.id
    let file = req.file
    let userData = req.body
    if (file) {
      // ファイルを読み取ってbase64に変換します
      const imageBuffer = fs.readFileSync(file.path)
      const imageBase64 = imageBuffer.toString('base64') // Chuyển thành chuỗi Base64

      // Base64文字列をユーザーデータに割り当てる
      userData.image = imageBase64
      fs.unlinkSync(file.path)
    }

    let message = await userService.handleEditProfile(userData, id)
    if (message.errCode === 0) {
      // return res.render('./user/profile.hbs', { user })
      return res.redirect('/api/profile')
    }
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  handleSignUp,
  handleLogin,
  handleLogout,
  getProfilePage,
  handleEditProfile,
  handleCreateNewUser,
  handleSignIn,
}
