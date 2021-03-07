function importTest(name, path) {
  describe(name, function () {
    require(path);
  });
}

describe('Test Users API', () => {
  beforeEach(function () {
    console.log('Try running something before each test!');
  });

  importTest('users.test', './users/users.test');

  after(function () {
    console.log('Run all test!');
  });
});
