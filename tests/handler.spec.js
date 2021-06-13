const mocks = {};
const handler = require('../handler')
const log = console.log; 

beforeAll(() => {
  process.env.ORS_TOKEN = 'test';
  process.argv.push('--start', 'Munich');
  process.argv.push('--end', 'Hamburg');
  process.argv.push('--transportation-method', 'medium-diesel-car');
  console.log = jest.fn();
});
afterAll(() => {
  console.log = log; 
});

describe('Testing positive flow for Requests', () => {
  it('Should pass by providing co2 consumption', () => {
    handler.compute().then(status => {
      console.log('status', status);
      expect(status).toBe(200);
    // const spy = jest.spyOn(handler, 'compute');
    // jest.spyOn(handler, 'compute').toHaveBeenCalled(() => 
    //});
  });
});
});

describe('Testing negative flow for Requests when no argument is given', () => {
  it('Should fail for invalid arguments', () => {
    const spy = jest.spyOn(handler, 'compute');
    expect(spy).not.toHaveBeenCalled();
  });
});