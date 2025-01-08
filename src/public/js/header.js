// 検索バーとメニューを開閉します
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle')
  const navMenu = document.querySelector('.nav-menu')

  // ナビアイコンのイベントを作成
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active') // メニューを開く/閉じる
  })
  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
      navMenu.classList.remove('active')
    }
  })
})

document.addEventListener('DOMContentLoaded', function () {
  const avatarMenu = document.querySelector('.avatar-menu')
  const dropdownMenu = avatarMenu.querySelector('.dropdown-menu')
  const avatarImg = avatarMenu.querySelector('.avatar-img')

  avatarImg.addEventListener('click', function () {
    dropdownMenu.classList.toggle('show') // メニューの表示または非表示
  })

  // メニューを押し出すとメニューが非表示になるようにします
  document.addEventListener('click', function (e) {
    if (!avatarMenu.contains(e.target)) {
      dropdownMenu.classList.remove('show')
    }
  })
})
