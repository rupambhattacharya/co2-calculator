const { when } = require('jest-when');

const mocks = {};

beforeAll(() => {
  process.env.escenicUrl = 'https://www.mock-url.de';
  process.env.s3Bucket = 'mock-bucket';
  jest.mock('request-promise-native');
  jest.mock('aws-sdk', () => {
    mocks.headObject = jest.fn();
    mocks.putObject = jest.fn();
    return {
      config: {
        update: jest.fn(),
      },
      S3: class {
        get headObject() {
          return mocks.headObject;
        }

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


describe('Tests pullHandler', () => {
  it('sould fail fetching teaser data', (done) => {
    const request = require('request-promise-native');
    const { pullData } = require('../pullHandler');

    const expectedError = new Error('error in fetching the data from escenic');

    when(request)
      .calledWith(expect.objectContaining({
        uri: process.env.escenicUrl,
        method: 'GET',
      }))
      .mockReturnValue(Promise.reject(expectedError));

    pullData()
      .catch((err) => {
        expect(err)
          .toBe(expectedError);
        done();
      });
  });

  it('should fail corrupted escenic teaser data', (done) => {
    // content{}, top_news{} or items[] missing in data
    const request = require('request-promise-native');
    const { pullData } = require('../pullHandler');
    const escenicCorrupt = {
      content_wrong: {
        top_news: {
          items: [],
        },
      },
    };
    when(request)
      .calledWith(expect.objectContaining({
        uri: process.env.escenicUrl,
        method: 'GET',
      }))
      .mockReturnValue(Promise.resolve(escenicCorrupt));

    pullData()
      .catch((err) => {
        expect(err.message)
          .toBe('Cannot read property \'top_news\' of undefined');
        done();
      });
  });

  it('should not fail', (done) => {
    const request = require('request-promise-native');
    const { pullData } = require('../pullHandler');
    const testTeaser = require('./data/escenic_one_teaser_id_9791072.json');
    const testArticle = require('./data/escenic_one_article_id_9791072.json');
    const testS3Key = `${testTeaser.content.top_news.items[0].id}-${testTeaser.content.top_news.items[0].timestamp}`;
    const expectedResultBody = {
      message: [{
        statusCode: 200,
        key: `${process.env.s3Bucket}/${testS3Key}.json`,
        message: 'OK',
      }],
    };
    when(request)
      .calledWith(expect.objectContaining({
        uri: process.env.escenicUrl,
        method: 'GET',
      }))
      .mockReturnValue(Promise.resolve(testTeaser));

    when(mocks.headObject)
      .calledWith()
      .mockReturnValue({
        promise: () => Promise.reject({
          statusCode: 404,
        }),
      });

    when(request)
      .calledWith(expect.objectContaining({
        uri: expect.stringMatching(/https:\/\/json\.focus\.de/),
        method: 'GET',
      }))
      .mockReturnValue(Promise.resolve(testArticle));

    when(mocks.putObject)
      .calledWith()
      .mockReturnValue({
        promise: () => Promise.resolve({
          ETag: 'mock-ETag',
        }),
      });

    // shouldnt fail at all
    pullData()
      .then((res) => {
        expect(res.statusCode)
          .toBe(200);
        expect(JSON.parse(res.body))
          .toEqual(expectedResultBody);
        done();
      });
  });
});

describe('Tests processItem() inside pullHandler', () => {
  it('should fail fetchJSONObject()', (done) => {
    const request = require('request-promise-native');
    const { pullData } = require('../pullHandler');
    const testTeaser = require('./data/escenic_one_teaser_id_9791072.json');
    const testS3Key = `${testTeaser.content.top_news.items[0].id}-${testTeaser.content.top_news.items[0].timestamp}`;

    const fetchJSONError = new Error('FETCH JSON: some strange mock-error');

    const expectedResultBody = {
      message: [{
        statusCode: 500,
        key: `${process.env.s3Bucket}/${testS3Key}.json`,
        message: fetchJSONError.message,
      }],
    };
    when(request)
      .calledWith(expect.objectContaining({
        uri: process.env.escenicUrl,
        method: 'GET',
      }))
      .mockReturnValue(Promise.resolve(testTeaser));

    when(mocks.headObject)
      .calledWith()
      .mockReturnValue({
        promise: () => Promise.reject({
          statusCode: 404,
        }),
      });

    when(request)
      .calledWith(expect.objectContaining({
        uri: expect.stringMatching(/https:\/\/json\.focus\.de/),
        method: 'GET',
      }))
      .mockReturnValue(Promise.reject(fetchJSONError));

    // shouldnt fail at all
    pullData()
      .then((res) => {
        expect(res.statusCode)
          .toBe(200);
        expect(JSON.parse(res.body))
          .toEqual(expectedResultBody);
        done();
      });
  });

  it('should fail if esc_src includes newswire-rss-importer', (done) => {
    const request = require('request-promise-native');
    const { pullData } = require('../pullHandler');
    const testTeaser = require('./data/escenic_one_teaser_id_9791072_credit_has_newswire.json');
    const testArticle = require('./data/escenic_one_article_id_9791072.json');
    const testS3Key = `${testTeaser.content.top_news.items[0].id}-${testTeaser.content.top_news.items[0].timestamp}`;
    const expectedResultBody = {
      message: [{
        statusCode: 400,
        key: `${process.env.s3Bucket}/${testS3Key}.json`,
        message: 'This article is not transformed to avoid duplicates!',
      }],
    };
    when(request)
      .calledWith(expect.objectContaining({
        uri: process.env.escenicUrl,
        method: 'GET',
      }))
      .mockReturnValue(Promise.resolve(testTeaser));

    when(mocks.headObject)
      .calledWith()
      .mockReturnValue({
        promise: () => Promise.reject({
          statusCode: 404,
        }),
      });

    when(request)
      .calledWith(expect.objectContaining({
        uri: expect.stringMatching(/https:\/\/json\.focus\.de/),
        method: 'GET',
      }))
      .mockReturnValue(Promise.resolve(testArticle));

    // should fail because the teaser credit was not null
    pullData()
      .then((res) => {
        expect(res.statusCode)
          .toBe(200);
        expect(JSON.parse(res.body))
          .toEqual(expectedResultBody);
        done();
      });
  });

  it('should fail putToS3()', (done) => {
    const request = require('request-promise-native');
    const { pullData } = require('../pullHandler');
    const testTeaser = require('./data/escenic_one_teaser_id_9791072.json');
    const testArticle = require('./data/escenic_one_article_id_9791072.json');
    const testS3Key = `${testTeaser.content.top_news.items[0].id}-${testTeaser.content.top_news.items[0].timestamp}`;
    const putS3Error = new Error('S3 PUT Object: some strange mock-error');
    const expectedResultBody = {
      message: [{
        statusCode: 500,
        key: `${process.env.s3Bucket}/${testS3Key}.json`,
        message: putS3Error.message,
      }],
    };
    when(request)
      .calledWith(expect.objectContaining({
        uri: process.env.escenicUrl,
        method: 'GET',
      }))
      .mockReturnValue(Promise.resolve(testTeaser));

    when(mocks.headObject)
      .calledWith()
      .mockReturnValue({
        promise: () => Promise.reject({
          statusCode: 404,
        }),
      });

    when(request)
      .calledWith(expect.objectContaining({
        uri: expect.stringMatching(/https:\/\/json\.focus\.de/),
        method: 'GET',
      }))
      .mockReturnValue(Promise.resolve(testArticle));

    when(mocks.putObject)
      .calledWith()
      .mockReturnValue({
        promise: () => Promise.reject(putS3Error),
      });

    // shouldnt fail at all
    pullData()
      .then((res) => {
        expect(res.statusCode)
          .toBe(200);
        expect(JSON.parse(res.body))
          .toEqual(expectedResultBody);
        done();
      });
  });
});
