const MongoHelper = require('../helpers/mongo-helper')
const UpdateAccessTokenRepository = require('./update-access-token-repository')
let db, fakeUserId

const makeSut = () => {
  const userModel = db.collection('users')
  const sut = new UpdateAccessTokenRepository(userModel)
  return { sut, userModel }
}

describe('UpdateAccessTokenRepository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL, 'userDb')
    db = await MongoHelper.getDb()
  })

  beforeEach(async () => {
    const userModel = db.collection('users')
    await userModel.deleteMany()
    const fu = {
      email: 'valid_email@email.com',
      name: 'any_name',
      age: 40,
      sate: 'any_state',
      password: 'hashed_password'
    }
    const fakeUser = await userModel.insertOne(fu)
    fakeUserId = fakeUser.insertedId
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  test('Shoud update the access token', async () => {
    const { sut, userModel } = makeSut()
    await sut.update(fakeUserId, 'valid_token')
    const updatedFakeUser = await userModel.findOne({ _id: fakeUserId })
    expect(updatedFakeUser.accessToken).toBe('valid_token')
  })
})
