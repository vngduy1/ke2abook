// 検索バーとメニューを開閉します
document.addEventListener('DOMContentLoaded', () => {
  const searchToggle = document.querySelector('.search-toggle')
  const searchBar = document.querySelector('.search-bar')
  const navToggle = document.querySelector('.nav-toggle')
  const navMenu = document.querySelector('.nav-menu')

  // 検索アイコンのイベントを作成する
  searchToggle.addEventListener('click', () => {
    searchBar.classList.toggle('active') // 検索バーの開閉
  })

  // ナビアイコンのイベントを作成
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active') // メニューを開く/閉じる
  })
})

document.addEventListener('DOMContentLoaded', function () {
  const avatarMenu = document.querySelector('.avatar-menu')
  const dropdownMenu = avatarMenu.querySelector('.dropdown-menu')
  const avatarImg = avatarMenu.querySelector('.avatar-img')

  avatarImg.addEventListener('click', function () {
    dropdownMenu.classList.toggle('show') // Hiển thị hoặc ẩn menu
  })

  // Đảm bảo rằng menu sẽ ẩn nếu nhấn ra ngoài
  document.addEventListener('click', function (e) {
    if (!avatarMenu.contains(e.target)) {
      dropdownMenu.classList.remove('show')
    }
  })
})
