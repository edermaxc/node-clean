const { MongoClient } = require('mongodb')
const LoadUserByEmailRepository = require('./load-user-by-email-repository')
let client, db

const makeSut = () => {
  const userModel = db.collection('users')
  console.log('a')
  const sut = new LoadUserByEmailRepository(userModel)
  return { sut, userModel }
}

describe('LoadUserByEmailRepository', () => {
  beforeAll(async () => {
    client = await MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    db = client.db('userDB')
  })

  beforeEach(async () => {
    await await db.collection('users').deleteMany()
  })

  afterAll(async () => {
    await client.close()
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
})
