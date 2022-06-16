const { MissingParamError } = require('../utils/error')

module.exports = class AuthUseCase {
  constructor (loadUserByEmailRepository, encrypter, tokenGenerator) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
    this.encrypter = encrypter
    this.tokenGenerator = tokenGenerator
  }

  async auth (email, pass) {
    if (!email) {
      throw new MissingParamError('email')
    }
    if (!pass) {
      throw new MissingParamError('password')
    }

    const user = await this.loadUserByEmailRepository.load(email)
    const isValid = user && await this.encrypter.compare(pass, user.password)
    if (isValid) {
      return await this.tokenGenerator.generate(user.id)
    }
    return null
  }
}
