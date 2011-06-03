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
    service: 'contacts'
  });
  googleAuth.on('login', function () {
    console.log('login success');
    assert.equal(this.getSID().length, 267, 'Something wrong with the SID length');
    assert.equal(this.getLSID().length, 267, 'Something wrong with the LSID length');
    assert.equal(this.getAuthId().length, 246, 'Something wrong with the AuthId length');
    // do things with google services
  });
  googleAuth.on('error', function (e) {
    console.log(e.message);
    // damn..
  });
  googleAuth.login();
});
userini.load();


var googleAuth = new GoogleClientLogin({
  email: 'ajnasz@gmail.com',
  password: 'foobar',
  service: 'contacts'
});
googleAuth.on('login', function () {
  console.log('login success');
});
googleAuth.on('error', function (e) {
  console.log(e.message);
  // damn..
});
googleAuth.login();
