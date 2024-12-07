const { ReadingStatus } = require('../models')

const readingStatusService = {
  createStatus: async (readingStatusData) => {
    try {
      const data = await ReadingStatus.create(readingStatusData)
      if (data) {
        return {
          errCode: 0,
          data,
        }
      } else {
        return {
          errCode: 1,
          errMessage: 'status not found',
        }
      }
    } catch (error) {
      return {
        errCode: 2,
        errMessage: error,
      }
    }
  },

  getReadingStatusByBookId: async (userId, bookId) => {
    try {
      const data = await ReadingStatus.findOne({
        where: { bookId, userId },
        raw: true,
      })

      if (data) {
        return {
          errCode: 0,
          data,
        }
      }

      return {
        errCode: 1,
        errMessage: 'No reading status found for this book and user',
      }
    } catch (error) {
      return {
        errCode: 2,
        errMessage:
          error.message ||
          'An error occurred while fetching the reading status',
      }
    }
  },
}

module.exports = readingStatusService
