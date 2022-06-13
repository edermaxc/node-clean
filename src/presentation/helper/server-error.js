module.exports = class ServerError extends Error {
  constructor (ref) {
    super(`Internal Server Error, referente: ${ref}`)
    this.name = 'ServerError'
  }
}
