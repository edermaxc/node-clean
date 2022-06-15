
const MissingParamError = require('../helper/missing-param-error')
const InvalidParamError = require('../helper/invalid-param-error')
const UnauthoriedError = require('../helper/unauthorized-error')
const LoginRouter = require('./login-router')
const makeSut = () => {
  const authUseCase = makeAuthUseCase()
  const emailValidator = makeEmailValidator()
  authUseCase.accessToken = 'valid_token'
  const sut = new LoginRouter(authUseCase, emailValidator)
  return { sut, authUseCase, emailValidator }
}

const makeAuthUseCase = () => {
  class AuthUseCaseSpy {
    async auth (email, password) {
      this.email = email
      this.password = password
      return this.accessToken
    }
  }
  return new AuthUseCaseSpy()
}

const makeEmailValidator = () => {
  class EmailValidatorSpy {
    isValid (email) {
      return this.isEmailValid
    }
  }
  const emailValidatorSpy = new EmailValidatorSpy()
  emailValidatorSpy.isEmailValid = true
  return emailValidatorSpy
}

describe('Login Router', () => {
  test('Should return 400 if no e-mail is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        password: 'any pass'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('Should return 400 when invalid e-mail is provided', async () => {
    const { sut, emailValidator } = makeSut()
    emailValidator.isEmailValid = false
    const httpRequest = {
      body: {
        email: 'invalid_email@email.com',
        password: 'any pass'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })

  test('Should return 400 if no password is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@email.com'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('Should return 500 if httpRequest has no body', async () => {
    const { sut } = makeSut()
    const httpRequest = {
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  test('Should return 500 if no httpRequest is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.route()
    expect(httpResponse.statusCode).toBe(500)
  })

  test('Shuold call AuthUseCase with corect params', async () => {
    const { sut, authUseCase } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        password: 'any_pass'
      }
    }
    await sut.route(httpRequest)
    expect(authUseCase.email).toBe(httpRequest.body.email)
    expect(authUseCase.password).toBe(httpRequest.body.password)
  })

  test('Should return 401 when invalid credentials are provided', async () => {
    const { sut, authUseCase } = makeSut()
    authUseCase.accessToken = null
    const httpRequest = {
      body: {
        email: 'invalid@email.com',
        password: 'invalid_pass'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual(new UnauthoriedError())
  })

  test('Should return 500 when no AuthuseCase is provided', async () => {
    const sut = new LoginRouter()
    const httpRequest = {
      body: {
        email: 'invalid@email.com',
        password: 'invalid_pass'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  test('Should return 500 when  AuthuseCase has no auth method', async () => {
    class AuthUseCaseSpy { }
    const authUseCase = new AuthUseCaseSpy()
    const sut = new LoginRouter(authUseCase)
    const httpRequest = {
      body: {
        email: 'invalid@email.com',
        password: 'invalid_pass'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  test('Should return 200 when valid credentials are provided', async () => {
    const { sut, authUseCase } = makeSut()
    const httpRequest = {
      body: {
        email: 'valid@email.com',
        password: 'valid_pass'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body.accessToken).toEqual(authUseCase.accessToken)
  })

  test('Should return 500 when AuthuseCase throws', async () => {
    class AuthUseCaseSpy {
      async auth () {
        throw new Error()
      }
    }
    const authUseCase = new AuthUseCaseSpy()
    const sut = new LoginRouter(authUseCase)
    const httpRequest = { }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })
})
