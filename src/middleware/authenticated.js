const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next() // ログイン済みの場合、処理を続行する
  } else {
    res.redirect('/api/sign-in') // 未ログインの場合、ログイン画面にリダイレクトする
  }
}

const isGuest = (req, res, next) => {
  if (req.session.user) {
    res.redirect('/home')
  } else {
    next()
  }
}

const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.isAdmin === 1) {
    next()
  } else {
    res.redirect('/home')
  }
}

module.exports = {
  isAuthenticated,
  isGuest,
  isAdmin,
}
