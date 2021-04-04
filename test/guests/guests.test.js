const chai = require('chai');
const request = require('chai-http');

chai.should();
chai.use(request);

//Test guests route
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
  // it('Add New Guest', (done) => {
  //   const genericGuest = [{
  //     guestName: 'Test Guests - Name',
  //     guestMail: 'Testguest@gmai.com',
  //     guestPhone: 'Test Guests - Phone',
  //     eventId: '6048529d3a797826f6920062',
  //   }];
  //   chai
  //     .request(server)
  //     .post('/guests/add')
  //     .send(genericGuest)
  //     .set('access_token', jwt)
  //     .then((response) => {
  //       response.should.have.status(200);
  //       console.log('Pass status code!');
  //       response.body.should.be.a('object');
  //       console.log('Pass body type!');
  //       response.body.should.have.property('message').to.deep.equal({
  //         msgBody: 'Add New Guest Successful!',
  //         msgError: false,
  //       });
  //       idGuest = response.body._id;
  //       console.log('Pass field message!');
  //       done();
  //     })
  //     .catch(done);
  // });

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
  it('Edit Guest', (done) => {
    const guest = {
      id: '606726457161bcb22fc1bf7a',
      name: 'edit guest test',
      email: 'thienan.nguyenhoang311@gmail.com',
      phoneNumber: '0123456',
    };
    chai
      .request(server)
      .post('/guests/edit')
      .send(guest)
      .set('access_token', jwt)
      .then((response) => {
        response.should.have.status(200);
        console.log('Pass status code!');
        response.body.should.be.a('object');
        console.log('Pass body type!');
        response.body.should.have.property('message').to.deep.equal({
          msgBody: 'Edit Guest Successful!',
          msgError: false,
        });
        console.log('Pass field message!');
        done();
      })
      .catch(done);
  });

  //Import Guest
  it('Import Guest', (done) => {
    const Guests = [
      {
        name: 'Test 1',
        email: 'thienan.nguyenhoang311@gmail.com',
        phoneNumber: 'Test Event Table Type',
        eventId: '6048529d3a797826f6920062',
        table: {
          id: '1',
          seatNo: 1,
        },
      },
      {
        name: 'Test 2',
        email: 'thienan.nguyenhoang.011@gmail.com',
        phoneNumber: 'Test Event Table Type',
        eventId: '6048529d3a797826f6920062',
        table: {
          id: '2',
          seatNo: 2,
        },
      },
    ];
    chai
      .request(server)
      .post('/guests/add')
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
