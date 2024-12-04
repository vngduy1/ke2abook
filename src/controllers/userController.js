const fs = require('fs')
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
      // Đọc file và chuyển sang Base64
      const imageBuffer = fs.readFileSync(file.path)
      const imageBase64 = imageBuffer.toString('base64') // Chuyển thành chuỗi Base64

      // Gán chuỗi Base64 vào userData
      userData.image = imageBase64
      fs.unlinkSync(file.path)
    }

    let message = await userService.createNewUser(userData)

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

const handleLogout = async (req, res) => {
  try {
    await req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err)
        return res
          .status(500)
          .send('ログアウトに失敗しました。もう一度お試しください。')
      }

      res.clearCookie('connect.sid') // Xóa cookie phiên
      return res.redirect('/api/sign-in') // Chuyển hướng về trang đăng nhập
    })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .send('handleLogoutに失敗しました。もう一度お試しください。')
  }
}

const getProfilePage = async (req, res) => {
  try {
    const user = await req.session.user

    if (!user) {
      return res.redirect('/api/sign-in')
    }

    const userData = await userService.handleUserProfile(user)

    //   await db.User.findOne({
    //   where: { id: user.id },
    //   attributes: ['id', 'email', 'firstName', 'lastName', 'address', 'image'],
    //   raw: true,
    // })

    if (userData.errCode === 0) {
      if (userData.user.image) {
        const imageBase64 = Buffer.from(userData.user.image).toString('binary')
        userData.user.image = imageBase64
        return res.render('./user/profile.hbs', { userData, user })
      }
    } else {
      return res.redirect('/api/sign-in', {
        errCode: userData.errCode,
        message: userData.errMessage,
      })
    }
  } catch (error) {
    console.error('Lỗi khi truy cập trang hồ sơ:', error)
    res.status(500).send('Đã xảy ra lỗi máy chủ.')
  }
}

const handleEditProfile = async (req, res) => {
  try {
    const user = req.session.user
    const id = user.id
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

    let message = await userService.handleEditProfile(userData, id)
    if (message.errCode === 0) {
      return res.redirect('/api/profile', { user })
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
