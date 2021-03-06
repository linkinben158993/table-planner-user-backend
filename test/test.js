const chai = require('chai');
const request = require('chai-http');
const { server } = require('../app');

chai.should();
chai.use(request);

describe('Test Users API', () => {
  // Test users route
  describe('POST /users/login: Case Correct Username and Password', () => {
    it('Should return user info, isAuthenticate and access_token', (done) => {
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
    }).timeout(4000);
    // Should have timeout because takes time to connect to cloud database!
  });
});
