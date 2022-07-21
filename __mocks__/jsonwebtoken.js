module.exports = {
  token: 'any_token',
  id: '',
  key: '',
  sign (id, key) {
    this.id = id
    this.key = key
    return this.token
  }
}
