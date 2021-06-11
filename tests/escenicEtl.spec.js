/* eslint-disable */
const escenicArticle = require('./fixtures/input/escenicArticle.json');
const escenicArticleNoMedia = require('./fixtures/input/escenicArticleNoMediaObject');
const escenicArticleAsAdvertisement = require('./fixtures/input/articleTypeNative.json');
const escenicArticleWithVideo = require('./fixtures/input/escenicArticleTypeVideo.json');
const escenicArticleWithVideoNT = require('./fixtures/input/escenicArticleTypeVideoNoTeaser');
const escenicArticleWithJobGroup = require('./fixtures/input/escenicArticleWithJobGroup.json');
const inputText = require('./fixtures/input/inputText.json');
const inputTeaser = require('./fixtures/input/inputTeaser.json');
const inputImage = require('./fixtures/input/inputImage.json');
const inputImageWithoutDefaultValues = require('./fixtures/input/inputImageWithoutDefaultValues.json');
const inputContentWithoutImage = require('./fixtures/input/inputContentWithoutImage.json');
const inputTagTypeParagraph = require('./fixtures/input/inputTagTypeParagraph.json');
const inputTagTypeSubheading = require('./fixtures/input/inputTagTypeSubheading.json');
const inputArticleWithConclusion = require('./fixtures/input/inputArticleWithConclusion.json');
const inputArticleNoMediaImageUrl = require('./fixtures/input/noMediaImageUrl');
const inputTracking = require('./fixtures/input/inputTracking.json');

const defaultPayload = require('./fixtures/input/defaultPayload.json');
const payloadWithVideoInsideArticle = require('./fixtures/input/payloadWithVideoInsideArticle.json');
const expectedCanonical = require('./fixtures/results/canonicalFormat.json');
const expectedCanonicalNoMedia = require('./fixtures/results/canonicalFormatNoMedia');
const expectedNoMediaImageUrl = require('./fixtures/results/canonicalFormatNoMediaImageUrl');
const expectedOutputWithConclusion = require('./fixtures/results/expectedOutputWithConclusion.json');
const expectedAuthors = [];
const expectedCanonicalWithVideo = require('./fixtures/results/canonicalFormatWithVideo.json');
const expectedCanonicalWithVideoNT = require('./fixtures/results/canonicalFormatWithVideoNoTeaser');
const expectedCanonicalWithAdvertisement = require('./fixtures/results/expectedAdvertisementArticle.json');
const expectedCanonicalWithVideoInsideArticle = require('./fixtures/results/canonicalFormatWithVideoInsideArticle.json');
const expectedCanonicalWithJobGroup = require('./fixtures/results/canonicalFormatWithJobGroup.json');
const expectedMeta = require('./fixtures/results/expectedMeta.json');
const expectedContent = require('./fixtures/results/expectedContent.json');
const expectedTeaser = require('./fixtures/results/expectedTeaser.json');
const expectedText = require('./fixtures/results/expectedText.json');
const expectedImage = require('./fixtures/results/expectedImage.json');
const expectedContentWithoutImage = require('./fixtures/results/expectedContentWithoutImage.json');
const expectedImageWithDefaultValues = require('./fixtures/results/expectedImageWithDefaultValues.json');
const twitterWidget = require('./fixtures/results/twitter_widget.json');
const expectedJobGroup = require('./fixtures/results/expectedJobGroup.json');

const mocks = {
  request: jest.fn()
};

afterEach(() => {
  jest.resetAllMocks();
  jest.resetModules();
});

describe('calling all the functions with proper data', () => {
  // Need the mocking here because the related library is being imported earlier than tests start
  jest.mock('request-promise-native', () => mocks.request);
  const escenicEtl = new (require('../lib/EscenicETL'));

  test.each([
    ['Should call getDefaultPayload function with success', escenicEtl.getDefaultPayload.bind(escenicEtl), null, defaultPayload,],
    ['Should call transform function with success', escenicEtl.transform.bind(escenicEtl), escenicArticle, expectedCanonical,],
    ['Should call transform function with success for missing media_object', escenicEtl.transform.bind(escenicEtl), escenicArticleNoMedia, expectedCanonicalNoMedia,],
    ['Should call transform function with success for missing media_object image url', escenicEtl.transform.bind(escenicEtl), inputArticleNoMediaImageUrl, expectedNoMediaImageUrl,],
    ['Should call transform function with success for video articles', escenicEtl.transform.bind(escenicEtl), escenicArticleWithVideo, expectedCanonicalWithVideo,],
    ['Should call transform function with success for video articles without a teaser', escenicEtl.transform.bind(escenicEtl), escenicArticleWithVideoNT, expectedCanonicalWithVideoNT,],
    ['Should call transform function with success for advertisement articles', escenicEtl.transform.bind(escenicEtl), escenicArticleAsAdvertisement, expectedCanonicalWithAdvertisement,],
    ['Should call transform function with success for articles with video inside the article', escenicEtl.transform.bind(escenicEtl), payloadWithVideoInsideArticle, expectedCanonicalWithVideoInsideArticle,],
    ['Should call transform function with success for articles with job group', escenicEtl.transform.bind(escenicEtl), escenicArticleWithJobGroup, expectedCanonicalWithJobGroup,],
    ['Should call getAuthors function with success', escenicEtl.getAuthors.bind(escenicEtl), escenicArticle, expectedAuthors,],
    ['Should call getMeta function with success', escenicEtl.getMeta.bind(escenicEtl), escenicArticle, expectedMeta,],
    ['Should call getContent function with success', escenicEtl.getContent.bind(escenicEtl), escenicArticle, expectedContent,],
    ['Should call getText function with success', escenicEtl.getText.bind(escenicEtl), inputText, expectedText,],
    ['Should call getTeaser function with success', escenicEtl.getTeaser.bind(escenicEtl), inputTeaser, expectedTeaser,],
    ['Should call getImage function with success', escenicEtl.getImage.bind(escenicEtl), inputImage, expectedImage,],
    ['Should call getJobGroup function with success', escenicEtl.getJobGroup.bind(escenicEtl), inputTracking, expectedJobGroup,],
    ['Should convert articles with conclusion with success', escenicEtl.transform.bind(escenicEtl), inputArticleWithConclusion, expectedOutputWithConclusion,],
    ['Should call getTag function with success and receive p when type is paragraph', escenicEtl.getTag.bind(escenicEtl), inputTagTypeParagraph, 'p',],
    ['Should call getTag function with success and receive h2 when type is subheading', escenicEtl.getTag.bind(escenicEtl), inputTagTypeSubheading, 'h2'],
    ['Should call getContent function with success when there are no image content in the article',
      escenicEtl.getContent.bind(escenicEtl), inputContentWithoutImage, expectedContentWithoutImage
    ],
    ['Should call getImage function with success and set default values when the payload contains no suitable values',
      escenicEtl.getImage.bind(escenicEtl), inputImageWithoutDefaultValues, expectedImageWithDefaultValues
    ],
    ['Should call getMediaObject function with null object', escenicEtl.getMediaObject.bind(escenicEtl), null, null,],
    ['Should call getMediaObject function with empty object', escenicEtl.getMediaObject.bind(escenicEtl), {}, null,],
  ])(
    '%s',
    async (testName, testFunction, testParameters, expectedResult) => {
      mocks.request.mockImplementation(() => Promise.resolve(twitterWidget));
      console.log(testName);
      expect(JSON.stringify(await testFunction(testParameters))).toEqual(JSON.stringify(expectedResult));
    });
});
