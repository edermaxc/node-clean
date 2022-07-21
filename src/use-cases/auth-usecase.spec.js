const { MissingParamError } = require('../utils/error')
const AuthUseCase = require('./auth-usecase')

const makeSut = () => {
  const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepositorySpy()
  const encrypterSpy = makeEncrypterSpy()
  const tokenGeneratorSpy = makeTokenGeneratorSpy()
  const updateAccessTokenRepositorySpy = makeUpdateAccessTokenRepositorySpy()
  const injectionParams = {
    loadUserByEmailRepository: loadUserByEmailRepositorySpy,
    encrypter: encrypterSpy,
    tokenGenerator: tokenGeneratorSpy,
    updateAccessTokenRepository: updateAccessTokenRepositorySpy
  }
  const sut = new AuthUseCase(injectionParams)
  return { sut, loadUserByEmailRepositorySpy, encrypterSpy, tokenGeneratorSpy, updateAccessTokenRepositorySpy }
}

const makeUpdateAccessTokenRepositorySpy = () => {
  class UpdateAccessTokenRepositorySpy {
    async update (userId, accessToken) {
      this.userId = userId
      this.accessToken = accessToken
    }
  }
  return new UpdateAccessTokenRepositorySpy()
}

const makeTokenGeneratorSpy = () => {
  class TokenGeneratorSpy {
    async generate (id) {
      this.userId = id
      return this.accessToken
    }
  }
  const tokenGeneratorSpy = new TokenGeneratorSpy()
  tokenGeneratorSpy.accessToken = 'anyToken'
  return tokenGeneratorSpy
}

const makeTokenGeneratorWithError = () => {
  class TokenGeneratorSpy {
    async generate (id) {
      throw new Error()
    }
  }
  return new TokenGeneratorSpy()
}

const makeEncrypterSpy = () => {
  class EncrypterSpy {
    async compare (string, hash) {
      this.string = string
      this.hash = hash
      return this.isValid
    }
  }
  const encrypterSpy = new EncrypterSpy()
  encrypterSpy.isValid = true
  return encrypterSpy
}

const makeUpdateAccessTokenRepositoryWithError = () => {
  class UpdateAccessTokenRepositorySpy {
    async update () {
      throw new Error()
    }
  }
  return new UpdateAccessTokenRepositorySpy()
}

const makeEncrypterWithError = () => {
  class EncrypterSpy {
    async compare (string, hash) {
      throw new Error()
    }
  }
  return new EncrypterSpy()
}

const makeLoadUserByEmailRepositorySpy = () => {
  class LoadUserByEmailRepositorySpy {
    async load (email) {
      this.email = email
      return this.user
    }
  }
  const loadUserByEmailRepository = new LoadUserByEmailRepositorySpy()
  loadUserByEmailRepository.user = {
    id: 'any_id',
    password: 'hashed_password'
  }
  return loadUserByEmailRepository
}

const makeLoadUserByEmailRepositoryWithError = () => {
  class LoadUserByEmailRepositorySpy {
    async load (email) {
      throw new Error()
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

  test('Should call LoadUserByEmailRepository with correct email', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()
    await sut.auth('any_email@email.com', 'any_password')
    expect(loadUserByEmailRepositorySpy.email).toBe('any_email@email.com')
  })

  test('Should call UpdateAccessTokenRepository with correct values', async () => {
    const { sut, loadUserByEmailRepositorySpy, tokenGeneratorSpy, updateAccessTokenRepositorySpy } = makeSut()
    await sut.auth('valid_email@email.com', 'valid_password')
    expect(updateAccessTokenRepositorySpy.userId).toBe(loadUserByEmailRepositorySpy.user.id)
    expect(updateAccessTokenRepositorySpy.accessToken).toBe(tokenGeneratorSpy.accessToken)
  })

  test('Should returns a null token if LoadUserByEmailRepository returns null', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()
    loadUserByEmailRepositorySpy.user = null
    const accessToken = await sut.auth('invalid_email@email.com', 'any_password')
    expect(accessToken).toBeNull()
  })

  test('Should returns a null token if password is invalid', async () => {
    const { sut, encrypterSpy } = makeSut()
    encrypterSpy.isValid = false
    const accessToken = await sut.auth('valid_email@email.com', 'invalid_password')
    expect(accessToken).toBeNull()
  })

  test('Should calls Encrypter with correct values', async () => {
    const { sut, loadUserByEmailRepositorySpy, encrypterSpy } = makeSut()
    await sut.auth('valid_email@email.com', 'any_password')
    expect(encrypterSpy.string).toBe('any_password')
    expect(encrypterSpy.hash).toBe(loadUserByEmailRepositorySpy.user.password)
  })

  test('Should calls TokenGenerator with correct UserId', async () => {
    const { sut, loadUserByEmailRepositorySpy, tokenGeneratorSpy } = makeSut()
    await sut.auth('valid_email@email.com', 'valid_password')
    expect(tokenGeneratorSpy.userId).toBe(loadUserByEmailRepositorySpy.user.id)
  })

  test('Should calls TokenGenerator with correct UserId', async () => {
    const { sut, loadUserByEmailRepositorySpy, tokenGeneratorSpy } = makeSut()
    await sut.auth('valid_email@email.com', 'valid_password')
    expect(tokenGeneratorSpy.userId).toBe(loadUserByEmailRepositorySpy.user.id)
  })

  test('Should returns an accessToken if correct credentials are provided', async () => {
    const { sut, tokenGeneratorSpy } = makeSut()
    const accessToken = await sut.auth('valid_email@email.com', 'valid_password')
    expect(accessToken).toBe(tokenGeneratorSpy.accessToken)
    expect(accessToken).toBeTruthy()
  })

  test('Should throws any dependency throws', async () => {
    const loadUserByEmailRepository = makeLoadUserByEmailRepositorySpy()
    const encrypter = makeEncrypterSpy()
    const tokenGenerator = makeTokenGeneratorSpy()
    const loadUserByEmailRepositoryError = makeLoadUserByEmailRepositoryWithError()
    const encrypterError = makeEncrypterWithError()
    const tokenGeneratorError = makeTokenGeneratorWithError()
    const updateAccessTokenRepository = makeUpdateAccessTokenRepositorySpy()
    const updateAccessTokenRepositoryError = makeUpdateAccessTokenRepositoryWithError()
    const suts = [].concat(
      new AuthUseCase({
        loadUserByEmailRepository: loadUserByEmailRepositoryError,
        encrypter,
        tokenGenerator,
        updateAccessTokenRepository
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter: encrypterError,
        tokenGenerator,
        updateAccessTokenRepository
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator: tokenGeneratorError,
        updateAccessTokenRepository
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator,
        updateAccessTokenRepository: updateAccessTokenRepositoryError
      })
    )
    for (const sut of suts) {
      const promise = sut.auth('any_email', 'any_pass')
      expect(promise).rejects.toThrow()
    }
  })

  test('Should throws if dependency object injection provided are inconsistent', async () => {
    const invalid = {}
    const loadUserByEmailRepository = makeLoadUserByEmailRepositorySpy()
    const encrypter = makeEncrypterSpy()
    const tokenGenerator = makeTokenGeneratorSpy()
    const updateAccessTokenRepository = makeUpdateAccessTokenRepositorySpy()
    const suts = [].concat(
      new AuthUseCase(),
      new AuthUseCase({
        loadUserByEmailRepository: null,
        encrypter: null,
        tokenGenerator: null,
        updateAccessTokenRepository: null
      }),
      new AuthUseCase({
        loadUserByEmailRepository: invalid,
        encrypter: null,
        tokenGenerator: null,
        updateAccessTokenRepository: null

      }),
      new AuthUseCase({
        loadUserByEmailRepository: null,
        encrypter: invalid,
        tokenGenerator: null,
        updateAccessTokenRepository: null
      }),
      new AuthUseCase({
        loadUserByEmailRepository: null,
        encrypter: null,
        tokenGenerator: invalid,
        updateAccessTokenRepository: null
      }),
      new AuthUseCase({
        loadUserByEmailRepository: null,
        encrypter: null,
        tokenGenerator: null,
        updateAccessTokenRepository: invalid
      }),
      new AuthUseCase({
        loadUserByEmailRepository: invalid,
        encrypter: invalid,
        tokenGenerator: null,
        updateAccessTokenRepository: null

      }),
      new AuthUseCase({
        loadUserByEmailRepository: invalid,
        encrypter: null,
        tokenGenerator: invalid,
        updateAccessTokenRepository: null
      }),
      new AuthUseCase({
        loadUserByEmailRepository: invalid,
        encrypter: null,
        tokenGenerator: null,
        updateAccessTokenRepository: invalid
      }),
      new AuthUseCase({
        loadUserByEmailRepository: null,
        encrypter: invalid,
        tokenGenerator: invalid,
        updateAccessTokenRepository: null
      }),
      new AuthUseCase({
        loadUserByEmailRepository: null,
        encrypter: invalid,
        tokenGenerator: null,
        updateAccessTokenRepository: invalid
      }),
      new AuthUseCase({
        loadUserByEmailRepository: null,
        encrypter: null,
        tokenGenerator: invalid,
        updateAccessTokenRepository: invalid
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter: null,
        tokenGenerator: null,
        updateAccessTokenRepository: null

      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter: invalid,
        tokenGenerator: null,
        updateAccessTokenRepository: null
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter: null,
        tokenGenerator: invalid,
        updateAccessTokenRepository: null
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter: null,
        tokenGenerator: null,
        updateAccessTokenRepository: invalid
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter: invalid,
        tokenGenerator: invalid,
        updateAccessTokenRepository: null
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter: null,
        tokenGenerator: invalid,
        updateAccessTokenRepository: invalid
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter: invalid,
        tokenGenerator: null,
        updateAccessTokenRepository: invalid
      }),
      new AuthUseCase({
        loadUserByEmailRepository: null,
        encrypter,
        tokenGenerator: null,
        updateAccessTokenRepository: null
      }),
      new AuthUseCase({
        loadUserByEmailRepository: invalid,
        encrypter,
        tokenGenerator: null,
        updateAccessTokenRepository: null
      }),
      new AuthUseCase({
        loadUserByEmailRepository: null,
        encrypter,
        tokenGenerator: invalid,
        updateAccessTokenRepository: null
      }),
      new AuthUseCase({
        loadUserByEmailRepository: null,
        encrypter,
        tokenGenerator: null,
        updateAccessTokenRepository: invalid
      }),
      new AuthUseCase({
        loadUserByEmailRepository: invalid,
        encrypter,
        tokenGenerator: invalid,
        updateAccessTokenRepository: null
      }),
      new AuthUseCase({
        loadUserByEmailRepository: invalid,
        encrypter,
        tokenGenerator: null,
        updateAccessTokenRepository: invalid
      }),
      new AuthUseCase({
        loadUserByEmailRepository: null,
        encrypter,
        tokenGenerator: invalid,
        updateAccessTokenRepository: invalid
      }),
      new AuthUseCase({
        loadUserByEmailRepository: null,
        encrypter: null,
        tokenGenerator,
        updateAccessTokenRepository: null
      }),
      new AuthUseCase({
        loadUserByEmailRepository: invalid,
        encrypter: null,
        tokenGenerator,
        updateAccessTokenRepository: null
      }),
      new AuthUseCase({
        loadUserByEmailRepository: null,
        encrypter: invalid,
        tokenGenerator,
        updateAccessTokenRepository: null
      }),
      new AuthUseCase({
        loadUserByEmailRepository: null,
        encrypter: null,
        tokenGenerator,
        updateAccessTokenRepository: invalid
      }),
      new AuthUseCase({
        loadUserByEmailRepository: invalid,
        encrypter: invalid,
        tokenGenerator,
        updateAccessTokenRepository: null
      }),
      new AuthUseCase({
        loadUserByEmailRepository: invalid,
        encrypter: null,
        tokenGenerator,
        updateAccessTokenRepository: invalid
      }),
      new AuthUseCase({
        loadUserByEmailRepository: null,
        encrypter: invalid,
        tokenGenerator,
        updateAccessTokenRepository: invalid
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator: null,
        updateAccessTokenRepository
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator: invalid,
        updateAccessTokenRepository
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter: null,
        tokenGenerator,
        updateAccessTokenRepository
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter: invalid,
        tokenGenerator,
        updateAccessTokenRepository
      }),
      new AuthUseCase({
        loadUserByEmailRepository: null,
        encrypter,
        tokenGenerator,
        updateAccessTokenRepository
      }),
      new AuthUseCase({
        loadUserByEmailRepository: invalid,
        encrypter,
        tokenGenerator,
        updateAccessTokenRepository
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator,
        updateAccessTokenRepository: null
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator,
        updateAccessTokenRepository: invalid
      })
    )
    for (const sut of suts) {
      const promise = sut.auth('any_email', 'any_pass')
      expect(promise).rejects.toThrow()
    }
  })
})
