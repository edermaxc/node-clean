module.exports = {
  isValid: true,
  value: '',
  hash: '',

  async compare (value, hashedValue) {
    this.value = value
    this.hash = hashedValue
    return this.isValid
  }
}
