'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Categories', [
      { name: '小説', createdAt: new Date(), updatedAt: new Date() }, // Tiểu thuyết
      { name: 'SF', createdAt: new Date(), updatedAt: new Date() }, // Khoa học viễn tưởng
      { name: '学術', createdAt: new Date(), updatedAt: new Date() }, // Học thuật
      { name: '歴史', createdAt: new Date(), updatedAt: new Date() }, // Lịch sử
      { name: '文学', createdAt: new Date(), updatedAt: new Date() }, // Văn học
      { name: 'ビジネス', createdAt: new Date(), updatedAt: new Date() }, // Kinh doanh
      { name: '技術', createdAt: new Date(), updatedAt: new Date() }, // Công nghệ
      { name: '自伝', createdAt: new Date(), updatedAt: new Date() }, // Tự truyện
      { name: '子供向け', createdAt: new Date(), updatedAt: new Date() }, // Sách thiếu nhi
      { name: '医学', createdAt: new Date(), updatedAt: new Date() }, // Y học
      { name: '旅行', createdAt: new Date(), updatedAt: new Date() }, // Du lịch
      { name: 'スポーツ', createdAt: new Date(), updatedAt: new Date() }, // Thể thao
      { name: '料理', createdAt: new Date(), updatedAt: new Date() }, // Ẩm thực
      { name: 'ホラー', createdAt: new Date(), updatedAt: new Date() }, // Kinh dị
      { name: 'コメディ', createdAt: new Date(), updatedAt: new Date() }, // Hài
      { name: '推理', createdAt: new Date(), updatedAt: new Date() }, // Trinh thám
      { name: '哲学', createdAt: new Date(), updatedAt: new Date() }, // Triết học
      { name: '詩', createdAt: new Date(), updatedAt: new Date() }, // Thơ ca
      { name: '芸術', createdAt: new Date(), updatedAt: new Date() }, // Nghệ thuật
      { name: '心理学', createdAt: new Date(), updatedAt: new Date() }, // Tâm lý
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', null, {})
  },
}
