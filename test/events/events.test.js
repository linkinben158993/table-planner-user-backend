const chai = require('chai');
const request = require('chai-http');

chai.should();
chai.use(request);

// Test users route
describe('Test *events* Endpoints:', () => {
  let server;
  const genericEvent = {};

  before(async () => {
    console.log('Initialize Server Instance!');
    server = require('../../app').server;
    await chai.request.agent(server);
  });

  // Best Case
  it('Add New Event', (done) => {
    chai
      .request(server)
      .post('/events/add')
      .send(genericEvent)
      .then((response) => {
        done();
      })
      .catch(done);
  });
  // Should have timeout because takes time to connect to cloud database!

  // Case wrong username or password
  it('Edit Event', (done) => {
    chai
      .request(server)
      .post('/events/edit')
      .send(genericEvent)
      .then((response) => {
        done();
      })
      .catch(done);
  });
});
