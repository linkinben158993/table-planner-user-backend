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
    const genericEvent = {
      eventName: 'Test 4 Event',
      eventDescription: 'Test 4 Event',
      tableType: 'Test Event Table Type',
    };
    chai
      .request(server)
      .post('/events/add')
      .send(genericEvent)
      .then((response) => {
        response.should.have.status(200);
        console.log('Pass status code!');
        response.body.should.be.a('object');
        console.log('Pass body type!');
        response.body.should.have.property('message').to.deep.equal({
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
    const genericId = '6048506f8fb7b6249151343e';
    const genericEvent = {
      eventId: genericId,
      eventName: 'Test Edit Event Test',
      eventDescription: 'Test Edit Event Test',
    };
    chai
      .request(server)
      .post('/events/edit')
      .send(genericEvent)
      .then((response) => {
        response.should.have.status(200);
        console.log('Pass status code!');
        response.body.should.be.a('object');
        console.log('Pass body type!');
        response.body.should.have.property('message').to.deep.equal({
          msgBody: 'Edit Event Successful!',
          msgError: false,
        });
        console.log('Pass field message!');

        done();
      })
      .catch(done);
  });
});
