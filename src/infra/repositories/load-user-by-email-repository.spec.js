const MongoHelper = require('../helpers/mongo-helper')
const LoadUserByEmailRepository = require('./load-user-by-email-repository')
let db

const makeSut = () => {
  const userModel = db.collection('users')
  const sut = new LoadUserByEmailRepository(userModel)
  return { sut, userModel }
}

describe('LoadUserByEmailRepository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL, 'userDb')
    db = await MongoHelper.getDb()
  })

  beforeEach(async () => {
    await await db.collection('users').deleteMany()
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  test('Should return null if no user is found', async () => {
    const { sut } = makeSut()
    const user = await sut.load('invalid_email@email.com')
    expect(user).toBeNull()
  })

  test('Should returns a user if user is found', async () => {
    const email = 'valid_email@email.com'
    const { sut, userModel } = makeSut()
    const fakeUser = await userModel.insertOne({ email })
    const user = await sut.load(email)
    expect(user._id).toEqual(fakeUser.insertedId)
  })

  test('Should throws if no userModel is provided', async () => {
    const { sut } = new LoadUserByEmailRepository()
    const promise = sut.load('any_email@email.com')
    expect(promise).rejects.toThrow()
  })
})
