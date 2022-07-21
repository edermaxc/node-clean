const bcrypt = require('bcrypt')

class Encrypter {
  async compare (value, hash) {
    return await bcrypt.compare(value, hash)
  }
}
describe('Encrypter', () => {
  test('Shuld return true if bcrypt returns true', async () => {
    const sut = new Encrypter()
    const isValid = await sut.compare('any_value', 'hashed_value')
    expect(isValid).toBe(true)
  })

  test('Shuld return false if bcrypt returns false', async () => {
    const sut = new Encrypter()
    bcrypt.isValid = false
    const isValid = await sut.compare('any_value', 'hashed_value')
    expect(isValid).toBe(false)
  })
})
