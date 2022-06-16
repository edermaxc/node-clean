const { MissingParamError } = require('../utils/error')

class AuthUseCase {
  constructor (loadUserByEmailRepository) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
  }

  async auth (email, pass) {
    if (!email) {
      throw new MissingParamError('email')
    }
    if (!pass) {
      throw new MissingParamError('password')
    }
    await this.loadUserByEmailRepository.load(email)
  }
}

const makeSut = () => {
  const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository()
  const sut = new AuthUseCase(loadUserByEmailRepositorySpy)
  return { sut, loadUserByEmailRepositorySpy }
}

const makeLoadUserByEmailRepository = () => {
  class LoadUserByEmailRepositorySpy {
    async load (email) {
      this.email = email
    }
  }
  return new LoadUserByEmailRepositorySpy()
}

describe('Auth UseCase', () => {
  test('Should throws if no e-mail is provided', async () => {
    const { sut } = makeSut()
    const promise = sut.auth()
    expect(promise).rejects.toThrow(new MissingParamError('email'))
  })

  test('Should throws if no password is provided', async () => {
    const { sut } = makeSut()
    const promise = sut.auth('email')
    expect(promise).rejects.toThrow(new MissingParamError('password'))
  })

  test('Should throws if no password is provided', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()
    await sut.auth('any_email@email.com', 'amy_password')
    expect(loadUserByEmailRepositorySpy.email).toBe('any_email@email.com')
  })
})
