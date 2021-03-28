const chai = require('chai');
const request = require('chai-http');

chai.should();
chai.use(request);

// Test users route
describe('Test *events* Endpoints:', () => {
  let server;
  // Should be initialized before each test for protected routes
  let jwt;
  const genericUser = {
    username: 'an@gmail.com',
    password: '123456',
  };
  const genericEvent = {};

  before(async () => {
    console.log('Initialize Server Instance!');
    server = require('../../app').server;
    await chai.request.agent(server);
    // Init jwt here for protected routes
    await chai
      .request(server)
      .post('/users/login')
      .send(genericUser)
      .then((response) => {
        jwt = response.body.access_token;
      });
  });

  // Best Case
  it('Add New Event', (done) => {
    const genericEvent = {
      name: 'Test 4 Event',
      description: 'Test 4 Event',
    };
    chai
      .request(server)
      .post('/events/add')
      .send(genericEvent)
      .set('access_token', jwt)
      .then((response) => {
        response.should.have.status(200);
        console.log('Pass status code!');
        response.body.should.be.a('object');
        console.log('Pass body type!');
        response.body.should.have.property('message')
          .to
          .deep
          .equal({
            msgBody: 'Add New Event Successful!',
            msgError: false,
          });
        console.log('Pass field message!');
        done();
      })
      .catch(done);
  });
  // Should have timeout because takes time to connect to cloud database!

  // Case wrong username or password
  it('Edit Event', (done) => {
    const genericId = '605ff5bc1a903e156ff4b046';
    const genericEvent = {
      id: genericId,
      name: 'Test Edit Event Test',
      description: 'Test Edit Event Test',
    };
    chai
      .request(server)
      .post('/events/edit')
      .set('access_token', jwt)
      .send(genericEvent)
      .then((response) => {
        response.should.have.status(200);
        console.log('Pass status code!');
        response.body.should.be.a('object');
        console.log('Pass body type!');
        response.body.should.have.property('message')
          .to
          .deep
          .equal({
            msgBody: 'Edit Event Successful!',
            msgError: false,
          });
        console.log('Pass field message!');

        done();
      })
      .catch(done);
  });
});
