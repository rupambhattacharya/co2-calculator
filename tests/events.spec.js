const mocks = {};

beforeEach(() => {
  process.env.s3Bucket = 'mock-bucket';
  jest.mock('aws-sdk', () => {
    mocks.putObject = jest.fn();
    return {
      config: {
        update: jest.fn(),
      },
      S3: class {
        get putObject() {
          return mocks.putObject;
        }
      },
    };
  });
});

afterEach(() => {
  jest.resetAllMocks();
  jest.resetModules();
});

describe('Tests eventHandler', () => {
  it('should fail putting object to bucket', async () => {
    const { handleEvent } = require('../events');
    mocks.putObject.mockImplementation(() => ({ promise: () => Promise.reject(new Error('Failure!')) }));
    return handleEvent({ body: '{}' }).then(res => expect(res.statusCode).toBe(500));
  });

  it('should save object to bucket', async () => {
    const { handleEvent } = require('../events');
    mocks.putObject.mockImplementation(() => ({ promise: () => Promise.resolve({ etag: 'test' }) }));
    return handleEvent({ body: '{}' }).then(res => expect(res.statusCode).toBe(202));
  });
});
