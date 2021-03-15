const chai = require('chai');
const request = require('chai-http');

chai.should();
chai.use(request);

//Test users route
describe('Test *guests* Endpoints:', () => {
  let server;
  // Should be initialized before each test for protected routes
  let jwt;
  const genericUser = {
    username: 'an@gmail.com',
    password: '123456',
  };
  const genericGuest = {};
  let idGuest;
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

  //Add guests
  it('Add New Guest', (done) => {
    const genericGuest = {
      guestName: 'Test Guests - Name',
      guestMail: 'Testguest@gmai.com',
      guestPhone: 'Test Guests - Phone',
      eventId: '6048529d3a797826f6920062',
    };
    chai
      .request(server)
      .post('/guests/add')
      .send(genericGuest)
      .set('access_token', jwt)
      .then((response) => {
        response.should.have.status(200);
        console.log('Pass status code!');
        response.body.should.be.a('object');
        console.log('Pass body type!');
        response.body.should.have.property('message').to.deep.equal({
          msgBody: 'Add New Guest Successful!',
          msgError: false,
        });
        console.log(response.body);
        idGuest = response.body._id;
        console.log('Pass field message!');
        done();
      })
      .catch(done);
  });

  //Get List
  it('Get List', (done) => {
    const eventId = '6048529d3a797826f6920062';
    chai
      .request(server)
      .get('/guests/get/:id', { id: eventId })
      .set('access_token', jwt)
      .then((response) => {
        response.should.have.status(200);
        console.log('Pass status code!');
        response.body.should.be.a('object');
        console.log('Pass body type!');
        response.body.should.have.property('message').to.deep.equal({
          msgBody: 'Get Guest List Successful!',
          msgError: false,
        });
        console.log('Pass field message!');
        done();
      })
      .catch(done);
  });

  //Edit Guest
  // it('Edit Guest', (done) => {
  //   const guest = {
  //     "guestId": "604dccac0c7eca693c497f80",
  //     "guestName": "edit guest",
  //     "guestMail": "edit guest mail",
  //     "guestPhone": "0123456"
  //   };
  //   chai
  //     .request(server)
  //     .post('/guests/edit')
  //     .send(guest)
  //     .set('access_token', jwt)
  //     .then((response) => {
  //       response.should.have.status(200);
  //       console.log('Pass status code!');
  //       response.body.should.be.a('object');
  //       console.log('Pass body type!');
  //       response.body.should.have.property('message').to.deep.equal({
  //         msgBody: 'Edit Guest Successful!',
  //         msgError: false,
  //       });
  //       console.log('Pass field message!');
  //       done();
  //   })
  //   .catch(done);
  // });

  // //Delete Guest
  // it('Delete Guest', (done) => {
  //   const guestId = {
  //     "id": "604dccac0c7eca693c497f80"
  //   }
  //   chai
  //     .request(server)
  //     .post('/guests/delete')
  //     .send(guestId)
  //     .set('access_token', jwt)
  //     .then((response) => {
  //       response.should.have.status(200);
  //       console.log('Pass status code!');
  //       response.body.should.be.a('object');
  //       console.log('Pass body type!');
  //       response.body.should.have.property('message').to.deep.equal({
  //         msgBody: 'Delete Guest Successful!',
  //         msgError: false,
  //       });
  //       console.log('Pass field message!');
  //       done();
  //   })
  //   .catch(done);
  // });

  //Import Guest
  it('Import Guest', (done) => {
    const Guests = [
      {
        guestName: 'Test 1',
        guestMail:
          'Test Guest With JWT Protection And De-reference stuff From Swagger',
        guestPhone: 'Test Event Table Type',
        eventId: '6048529d3a797826f6920062',
      },
      {
        guestName: 'Test 2',
        guestMail:
          'Test Guest With JWT Protection And De-reference stuff From Swagger',
        guestPhone: 'Test Event Table Type',
        eventId: '6048529d3a797826f6920062',
      },
      {
        guestName: 'Test 3',
        guestMail:
          'Test Guest With JWT Protection And De-reference stuff From Swagger',
        guestPhone: 'Test Event Table Type',
        eventId: '6048529d3a797826f6920062',
      },
    ];
    chai
      .request(server)
      .post('/guests/import')
      .send(Guests)
      .set('access_token', jwt)
      .then((response) => {
        response.should.have.status(200);
        console.log('Pass status code!');
        response.body.should.be.a('object');
        console.log('Pass body type!');
        response.body.should.have.property('message').to.deep.equal({
          msgBody: 'Import Guest Successful!',
          msgError: false,
        });
        console.log('Pass field message!');
        done();
      })
      .catch(done);
  });
});
