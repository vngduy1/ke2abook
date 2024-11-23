function route(app) {
  app.get("/", (req, res) => {
    app.render("home");
  });
}

module.exports = route;
