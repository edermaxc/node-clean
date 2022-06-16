class AuthUseCase {
  async auth (email, pass) {
    if (!email) {
      throw new Error('no email provided')
    }
  }
}

describe('Auth UseCase', () => {
  test('Should throws if no e-mail is provided', async () => {
    const sut = new AuthUseCase()
    const promise = sut.auth()
    expect(promise).rejects.toThrow()
  })
})
