/*global console:true, require:true*/
/*jslint indent:2*/
var assert = require('assert');
var IniReader = require('inireader').IniReader;
var GoogleClientLogin = require('googleclientlogin').GoogleClientLogin;
var userini = new IniReader('/home/ajnasz/.google.ini');
userini.on('fileParse', function () {
  var account = this.param('account'), googleAuth;
  googleAuth = new GoogleClientLogin({
    email: account.email,
    password: account.password,
    service: 'contacts',
    accountType: account.type
  });
  googleAuth.on(GoogleClientLogin.events.login, function () {
    assert.equal(this.getSID().length, 267, 'Something wrong with the SID length');
    assert.equal(this.getLSID().length, 267, 'Something wrong with the LSID length');
    assert.equal(this.getAuthId().length, 267, 'Something wrong with the AuthId length');
    console.log('test 1 finished');
    // do things with google services
  });
  googleAuth.on(GoogleClientLogin.events.error, function (e) {
    console.log(e.message);
    // damn..
  });
  googleAuth.login();
});
userini.load();


var googleAuth = new GoogleClientLogin({
  email: 'ajnasz@gmail.com',
  password: 'foobar',
  service: 'contacts',
  accountType: GoogleClientLogin.accountTypes.google
});
googleAuth.on(GoogleClientLogin.events.login, function () {
  console.log('login success');
});
googleAuth.on(GoogleClientLogin.events.error, function (e) {
  assert.equal(e.message, GoogleClientLogin.errors.loginFailed);
  assert.equal(this.getError(), 'BadAuthentication', 'Wrong error returned');
  console.log('test 2 finished');
  // damn..
});
googleAuth.login();
