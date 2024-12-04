let getHomePage = async (req, res) => {
  let user = (await req.session.user) || null

  res.render('home.hbs', { user })
}

module.exports = { getHomePage }
