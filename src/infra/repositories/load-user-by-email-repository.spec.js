const { MongoClient } = require('mongodb')

class LoadUserByEmailRepository {
  constructor (userModel) {
    this.userModel = userModel
  }

  async load (email) {
    return await this.userModel.findOne({ _id: email })
  }
}

describe('LoadUserByEmailRepository', () => {
  let client, db

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
    const userModel = db.collection('users')
    const sut = new LoadUserByEmailRepository(userModel)
    const user = await sut.load('invalid_email@email.com')
    expect(user).toBeNull()
  })

  test('Should returns a user if user is found', async () => {
    const email = 'valid_email@email.com'
    const userModel = db.collection('users')
    userModel.insertOne({ _id: email, email })
    const sut = new LoadUserByEmailRepository(userModel)
    const user = await sut.load(email)
    expect(user.email).toBe(email)
  })
})
