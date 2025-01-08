let getHomePage = async (req, res) => {
  let user = (await req.session.user) || null

  res.render('home.hbs', { user })
}

let getAbout = async (req, res) => {
  let user = (await req.session.user) || null
  res.render('about', { user })
}

let getContact = async (req, res) => {
  let user = (await req.session.user) || null
  res.render('contact', { user })
}

module.exports = { getHomePage, getAbout, getContact }
