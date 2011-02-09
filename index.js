var https = require('https'),
    events = require('events');

const userAgent  = 'GCLNodejs';
const version    = 0.1;
const loginURL   = '/accounts/ClientLogin';
const googleHost = 'www.google.com';

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
var GoogleClientLogin = function(conf) {
  this.conf = conf || {};
  // stores the authentication data
  this.auths = {};
  this.client = require('https');
  console.log('new client login');
  this.on('error', function () {
    console.log('an error occured in clientlogin');
  });
};
GoogleClientLogin.prototype = new events.EventEmitter();
/**
  * Logs in the user
  * @method login
  */
GoogleClientLogin.prototype.login = function() {
  var clientLogin = this;

  var content = 'accountType=HOSTED_OR_GOOGLE'
              + '&Email=' + this.conf.email
              + '&Passwd=' + this.conf.password
              + '&service=cp'
              + '&source=' + userAgent + '_' + version;


  var request = this.client.request(
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
    function(response) {
      var resp = '';

      response.on('data', function(chunk) {
          resp += chunk;
      });
      response.on('error', function (e) {
        console.log('error on request: ', e);
      });

      response.on('end', function() {
        var statusCode = response.statusCode;
        if(statusCode >= 200 && statusCode < 300) {
          (resp).split('\n').forEach(function(dataStr) {
            var data = dataStr.split('=');
            clientLogin.auths[data[0]] = data[1];
          });
          /**
          * Fires when login was success
          * @event login
          */
          clientLogin.emit('login');
        } else {
          /**
          * Fires when login was not success
          * @event loginFailed
          */
          console.log('client login failed', resp);
          clientLogin.emit('loginFailed');
        }
      });
    }
  );
  request.write(content);
  request.end();
};
/**
  * Returns the value of the Auth property
  * @method getAuthId
  */
GoogleClientLogin.prototype.getAuthId = function() {
  return this.auths.Auth;
};
/**
  * Returns the value of the SID property
  * @method getSID
  */
GoogleClientLogin.prototype.getSID = function() {
  return this.auths.SID;
};
/**
  * Returns the value of the LSID property
  * @method getSID
  */
GoogleClientLogin.prototype.getLSID = function() {
  return this.auths.LSID;
};
exports.GoogleClientLogin = GoogleClientLogin;
