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
          errMessage: 'Your email is already',
        })
      } else {
        let hashPasswordFromBcrypt = await hashUserPassword(data.password)
        await db.User.create({
          ...data,
          password: hashPasswordFromBcrypt,
        })
        resolve({
          errCode: 0,
          message: 'ok',
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
            userData.errMessage = `successfully`
            delete user.password
            userData.user = user
          } else {
            userData.errCode = 3
            userData.errMessage = `Wrong password`
          }
        } else {
          userData.errCode = 2
          userData.errMessage = `User not found`
          resolve(userData)
        }
      } else {
        userData.errCode = 1
        userData.errMessage = `Your Email is not exist in your system`
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
        userData.errMessage = `successfully`

        userData.user = user
      } else {
        userData.errCode = 1
        userData.errMessage = 'failure'
      }
      resolve(userData)
    } catch (error) {
      reject((errCode = -2), (errMessage = error))
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
          errMessage: 'Update success',
        })
      }
    } catch (error) {
      console.log(error)

      reject({
        errCode: 1,
        errMessage: 'User not found',
      })
    }
  })
}

const getAllUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = ''
      if (userId === 'ALL') {
        users = await db.User.findAll({
          attributes: { exclude: ['password'] },
          raw: true,
        })
      }
      if (userId && userId !== 'ALL') {
        users = await db.User.findOne({
          where: {
            id: userId,
          },
          attributes: { exclude: ['password'] },
          raw: true,
        })
      }
      resolve(users)
    } catch (error) {
      reject(error)
    }
  })
}

const editUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id || !data.roleId || !data.positionId || !data.gender) {
        resolve({
          errCode: 2,
          errMessage: 'Missing required parameters',
        })
      }
      let user = await db.User.findOne({
        where: { id: data.id },
        raw: false,
      })
      if (user) {
        user.firstName = data.firstName
        user.lastName = data.lastName
        user.address = data.address
        user.phonenumber = data.phonenumber
        user.gender = data.gender
        user.roleId = data.roleId
        user.positionId = data.positionId
        if (data.avatar) {
          user.image = data.avatar
        }
        await user.save()

        resolve({
          errCode: 0,
          errMessage: 'Update success',
        })
      }
    } catch (error) {
      reject({
        errCode: 1,
        errMessage: 'User not found',
      })
    }
  })
}

const deleteUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { id: id },
      })
      if (!user) {
        resolve({
          errCode: 2,
          errMessage: `The user is not exist`,
        })
      }

      await user.destroy()
      resolve({
        errCode: 0,
        errMessage: 'delete success',
      })
    } catch (error) {
      reject(error)
    }
  })
}

const getAllCodeService = (typeInPut) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!typeInPut) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required from getAllCodeService',
        })
      } else {
        let res = {}
        let allcode = await db.Allcode.findAll({
          where: { type: typeInPut },
        })

        res.errCode = 0
        res.data = allcode

        resolve(res)
      }
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  handleUserLogin,
  handleUserProfile,
  handleEditProfile,
  getAllUser,
  createNewUser,
  editUser,
  deleteUser,
  getAllCodeService,
}
