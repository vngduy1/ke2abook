const db = require('../models/index')
const bcrypt = require('bcryptjs')

var salt = bcrypt.genSaltSync(10)

let hashUserPassword = (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let hashPassword = await bcrypt.hashSync(password, salt)
      resolve(hashPassword)
    } catch (error) {
      reject(error)
    }
  })
}

const checkUserEmail = (emailUser) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({ where: { email: emailUser } })
      if (user) {
        resolve(true)
      } else {
        resolve(false)
      }
    } catch (error) {
      reject(error)
    }
  })
}

const createNewUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check email
      let check = await checkUserEmail(data.email)
      if (check) {
        resolve({
          errCode: 1,
          errMessage: 'あなたのメールアドレスはすでに存在してます。',
        })
      } else {
        let hashPasswordFromBcrypt = await hashUserPassword(data.password)
        await db.User.create({
          ...data,
          password: hashPasswordFromBcrypt,
        })
        resolve({
          errCode: 0,
          data,
        })
      }
    } catch (error) {
      reject(error)
    }
  })
}

const handleUserLogin = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let userData = {}
      let isExist = await checkUserEmail(email)
      if (isExist) {
        let user = await db.User.findOne({
          attributes: [
            'id',
            'email',
            'password',
            'firstName',
            'lastName',
            'isAdmin',
            'image',
          ],
          where: {
            email: email,
          },
          raw: true,
        })
        if (user) {
          let check = await bcrypt.compareSync(password, user.password)
          if (check) {
            userData.errCode = 0
            delete user.password
            userData.user = user
          } else {
            userData.errCode = 3
            userData.errMessage = `パスワード間違ってます。`
          }
        } else {
          userData.errCode = 2
          userData.errMessage = `ユーザが存在ません。`
          resolve(userData)
        }
      } else {
        userData.errCode = 1
        userData.errMessage = `あなたの電子メールはあなたのシステムに存在しません`
      }
      resolve(userData)
    } catch (error) {
      reject(error)
    }
  })
}

const handleUserProfile = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let userData = {}

      let user = await db.User.findOne({
        where: { id: data.id },
        attributes: [
          'id',
          'email',

          'firstName',
          'lastName',
          'address',
          'phonenumber',
          'image',
        ],
        raw: true,
      })

      if (user) {
        userData.errCode = 0

        userData.user = user
      } else {
        userData.errCode = 1
        userData.errMessage =
          'ユーザー情報の取得に失敗しました。もう一度お試しください。'
      }
      resolve(userData)
    } catch (error) {
      reject({ errCode: -2, errMessage: error })
    }
  })
}

const handleEditProfile = async (data, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { id: id },
        raw: false,
      })
      if (user) {
        if (data.password) {
          let hashPasswordFromBcrypt = await hashUserPassword(data.password)

          user.password = hashPasswordFromBcrypt
        }

        user.firstName = data.firstName
        user.lastName = data.lastName
        user.address = data.address
        user.phonenumber = data.phonenumber

        if (data.image) {
          user.image = data.image
        }

        await user.save()

        resolve({
          errCode: 0,
        })
      }
    } catch (error) {
      console.log(error)

      reject({
        errCode: 1,
        errMessage: 'ユーザが存在ません。',
      })
    }
  })
}
module.exports = {
  handleUserLogin,
  handleUserProfile,
  handleEditProfile,
  createNewUser,
}
