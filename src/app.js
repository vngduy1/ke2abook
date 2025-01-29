const express = require('express')
const path = require('path')
const handlebars = require('express-handlebars')
const app = express()
const methodOverride = require('method-override')
const connectDB = require('./config/connectDB')
const session = require('express-session')
// const route = require('./routes/index')
const homeRoute = require('./routes/homeRoute')
const adminWebRoutes = require('./routes/adminRoute')
const userRoute = require('./routes/userRoute')
const bookRoute = require('./routes/bookRoute')
require('dotenv').config()
const http = require('http')

const server = http.createServer(app)

// method-override ミドルウェアを使用して、HTTP メソッドを上書きできるように設定します。
// '_method' はリクエストのクエリまたはボディに含まれるパラメータ名で、
// 本来の HTTP メソッドを指定します（例: 'PUT' や 'DELETE'）。
app.use(methodOverride('_method'))

//静的ファイル（CSS、画像など）を含むフォルダーへのパス
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({ extended: true })).use(express.json())

// ハンドルバーをビュー エンジンとして使用するように Express を構成する
app
  .engine(
    'hbs',
    handlebars.engine({
      extname: '.hbs',
      helpers: {
        sum: (a, b) => a + b,
        isEqual: (a, b) => a == b,
        eq: (a, b) => a === b,
        and: (a, b) => a && b,
        gt: (a, b) => a > b,
        range: (start, end) => {
          const result = []
          for (let i = start; i <= end; i++) {
            result.push(i)
          }
          return result
        },
        ifEquals: (a, b, options) => {
          return a === b ? options.fn(this) : options.inverse(this)
        },
      },
    }),
  )
  .set('view engine', 'hbs')
  //パス: D:\ke2a\book\src\resources\views
  .set('views', path.join(__dirname, 'resources', 'views'))

app.use(
  session({
    secret: process.env.SECRET, //セッションを暗号化するための秘密文字列
    resave: false, // 変更しない場合はセッションを保存しない
    saveUninitialized: false, // 空のセッション Cookie を保存しない
    cookie: { maxAge: 3600000 }, // セッションの有効期間 (1 時間)
  }),
)

//ルートをインポートする
homeRoute(app)
adminWebRoutes(app)
userRoute(app)
bookRoute(app)
// route(app)

//データベース接続
connectDB()

app.get('/', (req, res) => {
  res.render('home.hbs')
})

//ローカルポート
const port = process.env.PORT

//リッスンポート
app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})

module.exports = server
