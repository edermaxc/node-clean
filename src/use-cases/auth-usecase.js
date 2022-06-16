const { MissingParamError } = require('../utils/error')

module.exports = class AuthUseCase {
  constructor (loadUserByEmailRepository, encrypter) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
    this.encrypter = encrypter
  }

  async auth (email, pass) {
    if (!email) {
      throw new MissingParamError('email')
    }
    if (!pass) {
      throw new MissingParamError('password')
    }

    const user = await this.loadUserByEmailRepository.load(email)
    if (!user) {
      return null
    }
    this.encrypter.compare(pass, user.password)
    return null
  }
}
