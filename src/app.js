const express = require("express");
const path = require("path");
const handlebars = require("express-handlebars");
const app = express();
const methodOverride = require("method-override");

const route = require("./routes/index");

// method-override ミドルウェアを使用して、HTTP メソッドを上書きできるように設定します。
// '_method' はリクエストのクエリまたはボディに含まれるパラメータ名で、
// 本来の HTTP メソッドを指定します（例: 'PUT' や 'DELETE'）。
app.use(methodOverride("_method"));

//静的ファイル（CSS、画像など）を含むフォルダーへのパス
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true })).use(express.json());

// ハンドルバーをビュー エンジンとして使用するように Express を構成する
app
  .engine(
    "hbs",
    handlebars.engine({
      extname: ".hbs",
      helpers: {
        sum: (a, b) => a + b,
      },
    }),
  )
  .set("view engine", "hbs")
  //パス: D:\ke2a\book\src\resources\views
  .set("views", path.join(__dirname, "resources", "views"));

app.get("/", (req, res) => {
  res.render("home");
});

//ルートをインポートする
route(app);

//ローカルポート
const port = 3000;

//リッスンポート
app.listen(port, () => {
  console.log(`localhost:${port}`);
});
