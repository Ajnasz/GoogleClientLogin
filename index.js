/*jslint indent: 2*/
/*global require: true*/
var EventEmitter = require('events').EventEmitter,
    util = require('util');

const userAgent = 'GCLNodejs';
const ver = '0.1.4';
const loginURL = '/accounts/ClientLogin';
const googleHost = 'www.google.com';

// http://code.google.com/apis/gdata/faq.html#clientlogin
const services = {
  analytics: 'analytics',
  apps: 'apps',
  base: 'gbase',
  sites: 'jotspot',
  blogger: 'blogger',
  book: 'print',
  calendar: 'cl',
  codesearch: 'codesearch',
  contacts: 'cp',
  docs: 'writely',
  finance: 'finance',
  mail: 'mail',
  health: 'health',
  weaver: 'weaver',
  maps: 'local',
  picasaweb: 'lh2',
  reader: 'reader',
  sidewiki: 'annotateweb',
  spreadsheets: 'wise',
  webmastertools: 'sitemaps',
  youtube: 'youtube',
  c2dm: 'ac2dm',
  voice: 'grandcentral'
};


/**
 * Helps to log in to any google service with the clientlogin method
 * Google returns 3 values when login was success:
 * Auth, SID, LSID
 *
 * After the login you need to include the Auth value into
 * the Authorization HTTP header on each request:
 *
 * client.request('GET', '...', {
 *   ...,
 *   'Authorization':'GoogleLogin auth=' + googleClientLoginInstance.getAuthId()
 * })
 *
 * @class GoogleClientLogin
 * @constructor
 * @param Object conf An object, with two properties: email and password
 */
var GoogleClientLogin = function (conf) {
  this.conf = conf || {};
  // stores the authentication data
  this.auths = {};
  this.loginProcessing = false;
};
GoogleClientLogin.prototype = {};
util.inherits(GoogleClientLogin, EventEmitter);

GoogleClientLogin.prototype._parseData = function (data) {
  data.split('\n').forEach(function (dataStr) {
    var data = dataStr.split('=');
    this.auths[data[0]] = data[1];
  }.bind(this));
};

GoogleClientLogin.prototype._parseLoginResponse = function (response) {

  var data = '';

  response.on('data', function (chunk) {
    data += chunk;
  }.bind(this));

  response.on('error', function (e) {
    this.emit('error', e);
  }.bind(this));

  response.on('end', function () {
    this.loginProcessing = false;
    var statusCode = response.statusCode, error;
    if (statusCode >= 200 && statusCode < 300) {
      this._parseData(data);
      /**
       * Fires when login was success
       * @event login
       */
      this.emit('login');
    } else {
      /**
       * Fires when login was not success
       * @event loginFailed
       */
      error = new Error('Login failed: ' + statusCode);
      error.data = data;
      error.response = response;
      this.emit('error', error);
    }
  }.bind(this));
};

GoogleClientLogin.prototype._getRequestContent = function () {
  return require('querystring').stringify({
    accountType: 'HOSTED_OR_GOOGLE',
    Email: this.conf.email,
    Passwd: this.conf.password,
    service: services[this.conf.service],
    source: userAgent + '_' + ver
  });
}

/**
 * Logs in the user
 * @method login
 */
GoogleClientLogin.prototype.login = function () {
  // don't try to log in, if one is already in progress
  if (!this.loginProcessing) {
    this.loginProcessing = true;

    var content, request;
    content = this._getRequestContent();
    request = require('https').request(
      {
        host: 'www.google.com',
        port: 443,
        path: loginURL,
        method: 'POST',
        headers: {
          'Content-Length': content.length,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      },
      this._parseLoginResponse.bind(this)
    );
    request.write(content);
    request.end();
  }
};

/**
 * Returns the value of the Auth property
 * @method getAuthId
 */
GoogleClientLogin.prototype.getAuthId = function () {
  return this.auths.Auth;
};

/**
 * Returns the value of the SID property
 * @method getSID
 */
GoogleClientLogin.prototype.getSID = function () {
  return this.auths.SID;
};

/**
  * Returns the value of the LSID property
  * @method getSID
  */
GoogleClientLogin.prototype.getLSID = function () {
  return this.auths.LSID;
};

exports.GoogleClientLogin = GoogleClientLogin;
