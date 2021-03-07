const chai = require('chai');
const request = require('chai-http');

chai.should();
chai.use(request);

// Test users route
describe('POST /users/login:', () => {
  let server;

  beforeEach(async () => {
    server = require('../../app').server;
    await chai.request.agent(server);
  });

  // Best Case
  it('Case Correct Username and Password', (done) => {
    const genericUser = {
      username: 'an@gmail.com',
      password: '123456',
    };
    chai
      .request(server)
      .post('/users/login')
      .send(genericUser)
      .then((response) => {
        response.should.have.status(200);
        response.body.should.be.a('object');
        console.log('Pass body type!');
        response.body.should.have.property('isAuthenticated').eq(true);
        console.log('Pass field isAuthenticated!');
        response.body.should.have.property('user').to.deep.equal({
          email: 'an@gmail.com',
          role: 1,
          fullName: "User's Name",
        });
        console.log('Pass field user!');
        done();
      })
      .catch(done);
  });
  // Should have timeout because takes time to connect to cloud database!

  // Case wrong username or password
  it('Case Wrong Username or Password', (done) => {
    const genericUser = {
      username: 'an@gmail.com',
      password: '12345',
    };
    chai
      .request(server)
      .post('/users/login')
      .send(genericUser)
      .then((response) => {
        response.should.have.status(400);
        console.log('Pass status code!');
        response.body.should.be.a('object');
        console.log('Pass body type!');
        response.body.should.have.property('msgBody').eq('Password not match!');
        console.log('Pass msgBody!');
        response.body.should.have.property('msgError').eq(true);
        console.log('Pass msgError!');
        done();
      })
      .catch(done);
  });
});
