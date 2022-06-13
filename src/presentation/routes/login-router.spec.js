
const MissingParamError = require('../helper/missing-param-error')
const UnauthoriedError = require('../helper/unauthorized-error')
const LoginRouter = require('./login-router')
const makeSut = () => {
  class AuthUseCaseSpy {
    auth (email, password) {
      this.email = email
      this.password = password
    }
  }
  const authUseCase = new AuthUseCaseSpy()
  const sut = new LoginRouter(authUseCase)
  return { sut, authUseCase }
}

describe('Login Router', () => {
  test('Should return 400 if no e-mail is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        password: 'any pass'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('Should return 400 if no password is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@email.com'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('Should return 500 if httpRequest has no body', () => {
    const { sut } = makeSut()
    const httpRequest = {
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  test('Should return 500 if no httpRequest is provided', () => {
    const { sut } = makeSut()
    const httpResponse = sut.route()
    expect(httpResponse.statusCode).toBe(500)
  })

  test('Shuold call AuthUseCase with corect params', () => {
    const { sut, authUseCase } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        password: 'any_pass'
      }
    }
    sut.route(httpRequest)
    expect(authUseCase.email).toBe(httpRequest.body.email)
    expect(authUseCase.password).toBe(httpRequest.body.password)
  })

  test('Should return 401 when invalid credentials are provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'invalid@email.com',
        password: 'invalid_pass'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual(new UnauthoriedError())
  })

  test('Should return 500 when no AuthuseCase is provided', () => {
    const sut = new LoginRouter()
    const httpRequest = {
      body: {
        email: 'invalid@email.com',
        password: 'invalid_pass'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  test('Should return 500 when  AuthuseCase has no auth method', () => {
    class AuthUseCaseSpy { }
    const authUseCase = new AuthUseCaseSpy()
    const sut = new LoginRouter(authUseCase)
    const httpRequest = {
      body: {
        email: 'invalid@email.com',
        password: 'invalid_pass'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })
})
