/* eslint-env mocha */

var multerS3 = require('../')

var fs = require('fs')
var path = require('path')
var extend = require('xtend')
var assert = require('assert')
var multer = require('multer')
var stream = require('stream')
var FormData = require('form-data')
var onFinished = require('on-finished')
var mockS3 = require('./util/mock-s3')

var defaultTransforms = () => new stream.PassThrough()

var VALID_OPTIONS = {
  bucket: 'string',
  transforms: defaultTransforms
}

var INVALID_OPTIONS = [
  ['numeric key', { key: 1337 }],
  ['string key', { key: 'string' }],
  ['numeric bucket', { bucket: 1337 }],
  ['numeric contentType', { contentType: 1337 }],
  ['transform is undefined', { transform: undefined }]
]

function submitForm (multer, form, cb) {
  form.getLength(function (err, length) {
    if (err) return cb(err)

    var req = new stream.PassThrough()

    req.complete = false
    form.once('end', function () {
      req.complete = true
    })

    form.pipe(req)
    req.headers = {
      'content-type': 'multipart/form-data; boundary=' + form.getBoundary(),
      'content-length': length
    }

    multer(req, null, function (err) {
      onFinished(req, function () { cb(err, req) })
    })
  })
}

describe('Multer S3', function () {
  it('is exposed as a function', function () {
    assert.strict.equal(typeof multerS3, 'function')
  })

  INVALID_OPTIONS.forEach(function (testCase) {
    it('throws when given ' + testCase[0], function () {
      function testBody () {
        multerS3(extend(VALID_OPTIONS, testCase[1]))
      }

      assert.throws(testBody, TypeError)
    })
  })

  it('upload files', function (done) {
    var s3 = mockS3()
    var form = new FormData()
    var storage = multerS3({ s3: s3, bucket: 'test' })
    var upload = multer({ storage: storage })
    var parser = upload.single('image')
    var image = fs.createReadStream(path.join(__dirname, 'files', 'ffffff.png'))

    form.append('name', 'Multer')
    form.append('image', image)

    submitForm(parser, form, function (err, req) {
      assert.ifError(err)

      assert.strict.equal(req.body.name, 'Multer')

      assert.strict.equal(req.file.fieldname, 'image')
      assert.strict.equal(req.file.originalname, 'ffffff.png')
      assert.strict.equal(req.file.size, 68)
      assert.strict.equal(req.file.bucket, 'test')
      assert.strict.equal(req.file.etag, 'mock-etag')
      assert.strict.equal(req.file.location, 'mock-location')

      done()
    })
  })

  it('uploads file with AES256 server-side encryption', function (done) {
    var s3 = mockS3()
    var form = new FormData()
    var storage = multerS3({ s3: s3, bucket: 'test', serverSideEncryption: 'AES256' })
    var upload = multer({ storage: storage })
    var parser = upload.single('image')
    var image = fs.createReadStream(path.join(__dirname, 'files', 'ffffff.png'))

    form.append('name', 'Multer')
    form.append('image', image)

    submitForm(parser, form, function (err, req) {
      assert.ifError(err)

      assert.strict.equal(req.body.name, 'Multer')

      assert.strict.equal(req.file.fieldname, 'image')
      assert.strict.equal(req.file.originalname, 'ffffff.png')
      assert.strict.equal(req.file.size, 68)
      assert.strict.equal(req.file.bucket, 'test')
      assert.strict.equal(req.file.etag, 'mock-etag')
      assert.strict.equal(req.file.location, 'mock-location')
      assert.strict.equal(req.file.serverSideEncryption, 'AES256')

      done()
    })
  })

  it('uploads file with AWS KMS-managed server-side encryption', function (done) {
    var s3 = mockS3()
    var form = new FormData()
    var storage = multerS3({ s3: s3, bucket: 'test', serverSideEncryption: 'aws:kms' })
    var upload = multer({ storage: storage })
    var parser = upload.single('image')
    var image = fs.createReadStream(path.join(__dirname, 'files', 'ffffff.png'))

    form.append('name', 'Multer')
    form.append('image', image)

    submitForm(parser, form, function (err, req) {
      assert.ifError(err)

      assert.strict.equal(req.body.name, 'Multer')

      assert.strict.equal(req.file.fieldname, 'image')
      assert.strict.equal(req.file.originalname, 'ffffff.png')
      assert.strict.equal(req.file.size, 68)
      assert.strict.equal(req.file.bucket, 'test')
      assert.strict.equal(req.file.etag, 'mock-etag')
      assert.strict.equal(req.file.location, 'mock-location')
      assert.strict.equal(req.file.serverSideEncryption, 'aws:kms')

      done()
    })
  })

  it('uploads PNG file with correct content-type', function (done) {
    var s3 = mockS3()
    var form = new FormData()
    var storage = multerS3({ s3: s3, bucket: 'test', serverSideEncryption: 'aws:kms', contentType: multerS3.AUTO_CONTENT_TYPE })
    var upload = multer({ storage: storage })
    var parser = upload.single('image')
    var image = fs.createReadStream(path.join(__dirname, 'files', 'ffffff.png'))

    form.append('name', 'Multer')
    form.append('image', image)

    submitForm(parser, form, function (err, req) {
      assert.ifError(err)

      assert.strict.equal(req.body.name, 'Multer')

      assert.strict.equal(req.file.fieldname, 'image')
      assert.strict.equal(req.file.contentType, 'image/png')
      assert.strict.equal(req.file.originalname, 'ffffff.png')
      assert.strict.equal(req.file.size, 68)
      assert.strict.equal(req.file.bucket, 'test')
      assert.strict.equal(req.file.etag, 'mock-etag')
      assert.strict.equal(req.file.location, 'mock-location')
      assert.strict.equal(req.file.serverSideEncryption, 'aws:kms')

      done()
    })
  })

  it('uploads SVG file with correct content-type', function (done) {
    var s3 = mockS3()
    var form = new FormData()
    var storage = multerS3({ s3: s3, bucket: 'test', serverSideEncryption: 'aws:kms', contentType: multerS3.AUTO_CONTENT_TYPE })
    var upload = multer({ storage: storage })
    var parser = upload.single('image')
    var image = fs.createReadStream(path.join(__dirname, 'files', 'test.svg'))

    form.append('name', 'Multer')
    form.append('image', image)

    submitForm(parser, form, function (err, req) {
      assert.ifError(err)

      assert.strict.equal(req.body.name, 'Multer')

      assert.strict.equal(req.file.fieldname, 'image')
      assert.strict.equal(req.file.contentType, 'image/svg+xml')
      assert.strict.equal(req.file.originalname, 'test.svg')
      assert.strict.equal(req.file.size, 100)
      assert.strict.equal(req.file.bucket, 'test')
      assert.strict.equal(req.file.etag, 'mock-etag')
      assert.strict.equal(req.file.location, 'mock-location')
      assert.strict.equal(req.file.serverSideEncryption, 'aws:kms')

      done()
    })
  })

  it('uploads file with single function transform', function (done) {
    var s3 = mockS3()
    var form = new FormData()
    var storage = multerS3({ s3: s3, bucket: 'test', serverSideEncryption: 'aws:kms', contentType: multerS3.AUTO_CONTENT_TYPE, transforms: defaultTransforms })
    var upload = multer({ storage: storage })
    var parser = upload.single('image')
    var image = fs.createReadStream(path.join(__dirname, 'files', 'test.svg'))

    form.append('name', 'Multer')
    form.append('image', image)

    submitForm(parser, form, function (err, req) {
      assert.ifError(err)

      assert.strict.equal(req.body.name, 'Multer')

      assert.strict.equal(req.file.fieldname, 'image')
      assert.strict.equal(req.file.contentType, 'image/svg+xml')
      assert.strict.equal(req.file.originalname, 'test.svg')
      assert.strict.equal(req.file.size, 100)
      assert.strict.equal(req.file.bucket, 'test')
      assert.strict.equal(req.file.etag, 'mock-etag')
      assert.strict.equal(req.file.location, 'mock-location')
      assert.strict.equal(req.file.serverSideEncryption, 'aws:kms')

      done()
    })
  })

  it('uploads file with field specific transform', function (done) {
    var transforms = {
      image: defaultTransforms
    }

    var s3 = mockS3()
    var form = new FormData()
    var storage = multerS3({ s3: s3, bucket: 'test', serverSideEncryption: 'aws:kms', contentType: multerS3.AUTO_CONTENT_TYPE, transforms })
    var upload = multer({ storage: storage })
    var parser = upload.single('image')
    var image = fs.createReadStream(path.join(__dirname, 'files', 'test.svg'))

    form.append('name', 'Multer')
    form.append('image', image)

    submitForm(parser, form, function (err, req) {
      assert.ifError(err)

      assert.strict.equal(req.body.name, 'Multer')

      assert.strict.equal(req.file.fieldname, 'image')
      assert.strict.equal(req.file.contentType, 'image/svg+xml')
      assert.strict.equal(req.file.originalname, 'test.svg')
      assert.strict.equal(req.file.size, 100)
      assert.strict.equal(req.file.bucket, 'test')
      assert.strict.equal(req.file.etag, 'mock-etag')
      assert.strict.equal(req.file.location, 'mock-location')
      assert.strict.equal(req.file.serverSideEncryption, 'aws:kms')

      done()
    })
  })
})
