/* eslint-disable */
const fs = require('fs');
const {
  when
} = require('jest-when');

beforeAll(() => {
  process.env.s3Bucket = 'bucket';
  process.env.username = 'username';
  process.env.password = 'password';
  process.env.usernameCPs = 'usernameCPs';
  process.env.passwordCPs = 'passwordCPs';
  process.env.gatewayUrlCPs = 'testCPs.content.rest';
  process.env.gatewayUrlCP = 'test.content.rest';
});

let mocks = {};

beforeEach(() => {
  mocks.session = jest.fn();
  mocks.transform = jest.fn();
  mocks.sendRequest = jest.fn();
  jest.mock('request-promise-native');
  jest.mock('../lib/EscenicETL', () => {
    return class {
      get transform() {
        return mocks.transform;
      }
    };
  });
  jest.mock('aws-sdk', () => {
    const getObject = jest.fn();
    return {
      config: {
        update: jest.fn()
      },
      mocks: {
        S3: {
          getObject,
        }
      },
      S3: class {
        get getObject() {
          return getObject;
        }
      }
    };
  });
});

afterEach(() => {
  jest.resetAllMocks();
  jest.resetModules();
});

describe('Testing positive flow for request', () => {
  it('Positive case where the request to the API gateway goes through', async () => {
    const AWS = require('aws-sdk');
    const request = require('request-promise-native');
    const canonicalFormat = require('./fixtures/results/canonicalFormat.json');
    mocks.transform.mockImplementation(() => canonicalFormat);
    const initState = JSON.parse(fs.readFileSync('tests/fixtures/input/escenicArticle.json').toString());
    const initStatePromise = initState === null ? Promise.reject() : Promise.resolve({
      Body: Buffer.from(JSON.stringify(initState))
    });

    AWS.mocks.S3.getObject.mockImplementation(() => ({
      promise: () => initStatePromise
    }));

    const response = {
      response: {
        statusCode: 202,
        body: {
          contentId: 1001
        },
      },
    };
    const event = {
      Records: [{
        s3: {
          object: {
            key: 'tempKey',
          },
        },
      }],
    };

    when(request).calledWith(expect.objectContaining({
      uri: expect.stringMatching(/\/auth/)
    })).mockReturnValue(Promise.resolve({
      body: {
        token: 'mocked-token',
      }
    }));
    when(request).calledWith(expect.objectContaining({
      method: expect.stringMatching('POST')
    })).mockReturnValue(Promise.resolve(response.response));

    const transformer = require('../transformer');
    await transformer.pushContent(event, {})
      .then(res => {
        expect(res.contentId).toBe(response.response.body.contentId);
      });
  });
});

it('Positive case where the request to the API gateway of CPs goes through', async () => {
  const AWS = require('aws-sdk');
  const request = require('request-promise-native');
  const canonicalFormat = require('./fixtures/results/canonicalFormat.json');
  mocks.transform.mockImplementation(() => canonicalFormat);
  const initState = JSON.parse(fs.readFileSync('tests/fixtures/input/escenicArticle.json').toString());
  const initStatePromise = initState === null ? Promise.reject() : Promise.resolve({
    Body: Buffer.from(JSON.stringify(initState))
  });

  AWS.mocks.S3.getObject.mockImplementation(() => ({
    promise: () => initStatePromise
  }));

  const response = {
    response: {
      statusCode: 202,
      body: {
        contentId: 1001
      },
    },
  };
  const event = {
    Records: [{
      s3: {
        object: {
          key: 'tempKey',
        },
      },
    }],
  };

  when(request).calledWith(expect.objectContaining({
    uri: expect.stringMatching(/\/auth/)
  })).mockReturnValue(Promise.resolve({
    body: {
      token: 'mocked-token',
    }
  }));
  when(request).calledWith(expect.objectContaining({
    method: expect.stringMatching('POST')
  })).mockReturnValue(Promise.resolve(response.response));

  const transformer = require('../transformer');
  await transformer.pushContent(event, {})
    .then(res => {
      expect(res.contentId).toBe(response.response.body.contentId);
    });
});

describe('Testing Negative flows for request', () => {
  it('Fails for Negative case where user doesnt authenticate', async () => {
    const AWS = require('aws-sdk');
    const request = require('request-promise-native');
    const initState = JSON.parse(fs.readFileSync('tests/fixtures/input/escenicArticle.json').toString());
    const initStatePromise = initState === null ? Promise.reject() : Promise.resolve({
      Body: Buffer.from(JSON.stringify(initState))
    });
    AWS.mocks.S3.getObject.mockImplementation(() => ({
      promise: () => initStatePromise
    }));

    const event = {
      Records: [{
        s3: {
          object: {
            key: 'tempKey',
          },
        },
      }],
    };

    when(request).calledWith(expect.objectContaining({
      uri: expect.stringMatching(/\/auth/)
    })).mockReturnValue(Promise.reject(new Error('Auth failed.')));

    const transformer = require('../transformer');
    await transformer.pushContent(event, {}).catch(err => {
      const error = new Error('Auth failed.');
      expect(err).toEqual(error);
    });
  });

  it('Fails for the Negative case where creation is not accepted', async () => {
    const AWS = require('aws-sdk');
    const request = require('request-promise-native');
    const canonicalFormat = require('./fixtures/results/canonicalFormat.json');
    mocks.transform.mockImplementation(() => canonicalFormat);
    const initState = JSON.parse(fs.readFileSync('tests/fixtures/input/escenicArticle.json').toString());
    const initStatePromise = initState === null ? Promise.reject() : Promise.resolve({
      Body: Buffer.from(JSON.stringify(initState))
    });

    AWS.mocks.S3.getObject.mockImplementation(() => ({
      promise: () => initStatePromise
    }));

    const response = {
      error: `Creation request failed. Wrong statusCode (403) or no contentId returned.`
    };

    const event = {
      Records: [{
        s3: {
          object: {
            key: 'tempKey',
          },
        },
      }],
    };

    when(request).calledWith(expect.objectContaining({
      uri: expect.stringMatching(/\/auth/)
    })).mockReturnValue(Promise.resolve({
      body: {
        token: 'mocked-token',
      }
    }));
    when(request).calledWith(expect.objectContaining({
      method: expect.stringMatching('POST')
    })).mockReturnValue(Promise.reject(new Error(response.error)));

    const transformer = require('../transformer');
    await transformer.pushContent(event, {})
      .then(res => {
        expect(res.error).toBe(response.error);
        expect(res.contentId).toBeNull();
      });
  });

  it('Fails for the Negative case where fetchFromS3 fails', async () => {
    const AWS = require('aws-sdk');
    const initState = null;
    const initStatePromise = initState === null ? Promise.reject(new Error('Cannot read from S3!')) : Promise.resolve({
      Body: Buffer.from(JSON.stringify(initState))
    });
    AWS.mocks.S3.getObject.mockImplementation(() => ({
      promise: () => initStatePromise
    }));

    const event = {
      Records: [{
        s3: {
          object: {
            key: 'tempKey',
          },
        },
      }],
    };

    const transformer = require('../transformer');
    await transformer.pushContent(event, {})
      .catch(err => {
        const error = new Error('Cannot read from S3!');
        expect(err).toEqual(error);
      });
  });
});
