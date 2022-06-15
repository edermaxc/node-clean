module.exports = class UnauthoriedError extends Error {
  constructor (paramName) {
    super('Unauthoried')
    this.name = 'UnauthoriedError'
  }
}
