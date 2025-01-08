const multer = require('multer')
const path = require('path')

// ファイルの保存場所とファイル名を設定します
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/') // ファイルを保存するディレクトリ
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

// ファイルを処理するミドルウェアを作成する
const upload = multer({ storage })

module.exports = upload
