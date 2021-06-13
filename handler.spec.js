const handler = require('./handler')

beforeAll(() => {
  process.env.ORS_TOKEN = 'test';
});
afterAll(() => {
});

describe('Testing negative flow for Requests when no argument is given', () => {
  it('Should fail for invalid arguments', () => {
    const spy = jest.spyOn(handler, 'compute');
    expect(spy).not.toHaveBeenCalled();
  });
});