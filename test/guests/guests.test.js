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
            console.log('Pass field message!');
            done();
        })
        .catch(done);
    });
});