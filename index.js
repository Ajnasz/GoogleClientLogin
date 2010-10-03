(function(gl) {
  var http = require('http');
  var events = require('events');

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
    this.client =  http.createClient(443, 'www.google.com', true);
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
                  + '&source=ajnaszNodeJSSearch1.0';
    var request = this.client.request('POST', '/accounts/ClientLogin', {
      'host': 'www.google.com',
      'Content-Length': content.length,
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    request.on('response', function(response) {
      var resp = '';
      response.on('data', function (chunk) {
          resp += chunk;
      });
      response.on('end', function() {
        if(response.statusCode >= 200 && response.statusCode < 300) {
          var responses = (resp).split('\n');
          for (var i = 0, rl = responses.length, data; i < rl; i++) {
            data = responses[i].split('=');
            clientLogin.auths[data[0]] = data[1];
          }
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
          clientLogin.emit('loginFailed');
        }
      })
    });
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
})();
