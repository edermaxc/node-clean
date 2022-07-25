module.exports = class UpdateAccessTokenRepository {
  constructor (userModel) {
    this.userModel = userModel
  }

  async update (userId, accessToken) {
    return await this.userModel.updateOne(
      { _id: userId },
      {
        $set: {
          accessToken
        }
      }
    )
  }
}
