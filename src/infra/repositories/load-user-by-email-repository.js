const MissingParamError = require('../../utils/error/missing-param-error')

module.exports = class LoadUserByEmailRepository {
  constructor (userModel) {
    this.userModel = userModel
  }

  async load (email) {
    if (!email) {
      throw new MissingParamError('email')
    }
    return await this.userModel.findOne({ email })
  }
}
