const bcrypt = require('bcryptjs')
const db = require('../models/index')
const user = require('../models/user')
var salt = bcrypt.genSaltSync(10)

let createNewUser = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let hashPasswordFromBcrypt = await hashUserPassword(data.password)
      await db.User.create({
        email: data.email,
        password: hashPasswordFromBcrypt,
        firstName: data.firstName,
        lastName: data.lastName,
        phonenumber: data.phonenumber,
        address: data.address,
        gender: data.gender,
        roleId: data.roleId,
      })
      resolve('createNewUser successfully')
    } catch (error) {
      reject(error)
    }
  })
}

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

let getAllUser = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = db.User.findAll({ raw: true })
      resolve(users)
    } catch (error) {
      reject(error)
    }
  })
}

let getUserInfoById = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = await db.User.findOne({ where: { id: userId }, raw: true })
      if (user) {
        resolve(users)
      } else {
        resolve({})
      }
    } catch (error) {
      reject(error)
    }
  })
}

let updateUserData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({ where: { id: data.id } })
      if (user) {
        user.firstName = data.firstName
        user.lastName = data.lastName
        user.address = data.address
        await user.save()
        let allUsers = await db.User.findAll()
        resolve(allUsers)
      } else {
        resolve()
      }
    } catch (error) {
      reject(error)
    }
  })
}

let deleteUserById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({ where: { id: id } })
      if (user) {
        await user.destroy()
      }
      let allUsers = await db.User.findAll()
      resolve(allUsers)
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  createNewUser,
  getAllUser,
  getUserInfoById,
  updateUserData,
  deleteUserById,
}
