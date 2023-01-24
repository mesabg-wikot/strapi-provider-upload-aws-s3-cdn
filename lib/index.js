'use strict';

/**
 * Module dependencies
 */

/* eslint-disable no-unused-vars */
// Public node modules.
const _ = require('lodash');
const AWS = require('aws-sdk');

module.exports = {
  init(config) {
    // Custom configuration
    let { prefix, cdnUrl } = config;
    prefix = prefix ? prefix : '';
    cdnUrl = cdnUrl ? cdnUrl : '';
    delete config.prefix;
    delete config.cdnUrl;

    // S3 configuration
    const S3 = new AWS.S3({
      apiVersion: '2006-03-01',
      ...config,
    });

    return {
      upload(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          // upload file on S3 bucket
          S3.upload(
            {
              Key: `${prefix}${file.hash}${file.ext}`,
              Body: Buffer.from(file.buffer, 'binary'),
              ContentType: file.mime,
              ...customParams,
            },
            (err, data) => {
              if (err) {
                return reject(err);
              }

              // set the bucket file url
              file.url = `${cdnUrl}/${prefix}${file.hash}${file.ext}`;
              resolve();
            }
          );
        });
      },
      delete(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          S3.deleteObject(
            {
              Key: `${prefix}${file.hash}${file.ext}`,
              ...customParams,
            },
            (err, data) => {
              if (err) {
                return reject(err);
              }
              resolve();
            }
          );
        });
      },
    };
  },
};
