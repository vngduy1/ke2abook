// import express from "express"
const express = require('express')

const { create } = require('../controllers/booksController')

function route(app) {
  app.get('/create', create)
}

module.exports = route
