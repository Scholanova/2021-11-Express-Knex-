class ResourceNotFoundError extends Error {
  constructor (value) {
    super(value)
  }
}

module.exports = {
  ResourceNotFoundError
}
