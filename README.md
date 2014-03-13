## Google's ClientLogin authentication implementation for Node.js

### Requires at least nodejs 0.4.1

#### Properties:
##### errors:
_That is an object, filled with the possible error messages._
##### accountTypes:
_An object, where you can set the type of account to request authorization for._
properties are: _google_, _hosted_, _hostedOrGoogle_ default is __hostedOrGoogle__

#### Events:
##### login:
_emitted when login was success_
##### error:
_emitted when an error occured. Has two parameters, the response object and the received data_

You can access to their names via constants: GoogleClientLogin.events.login or
GoogleClientLogin.events.error or you can use 'login' and 'error' as string.

#### Methods:
##### login
_Starts the login process. It has one optional parameter, which should be an object with two properties:_

__logincaptcha__, __logintoken.__

The logincaptcha is the user's answer to the captcha question

You will receive the logintoken if the login failed and the CaptchaRequired error code arrived

You must pass both the logincaptcha and logintoken if you must pass a captcha challange

##### getAuthId
_Returns the value of the authId key from the response._ If the login was success you will need to use this value to perform additional requests. You must put it into a the Authorization header like this:
  ```'Authorization': 'GoogleLogin auth=' + googleAuth.getAuthId(),```

##### getSID
_Returns the value of SID key from the response._

##### getLSID
_Returns the value of LSID key from the response._

##### isCaptchaRequired
_If the login was not success and the user need to pass a captcha challenge this method will return true_

##### getCaptchaUrl
_Url of the captcha image_

##### getCaptchaToken
_You will need to pass it back to the google with the user's answer to the captcha if the login failed and captcha authentication required._

##### getError
_If the login was not success, google will send back an error code what you can get with this method_


After the login was success, you should use the AuthId in each of your requests, see example below

http://code.google.com/apis/gdata/faq.html#clientlogin

### list of services:

Name                                               |name in googleclientlogin module |value
---------------------------------------------------|---------------------------------|---------------
Google Adwords APIs                                |adwords                          |'adwords'
Google Analytics Data APIs                         |analytics                        |'analytics'
Google Apps APIs (Domain Information & Management) |apps                             |'apps'
Google Base Data API                               |base                             |'gbase'
Google Sites Data API                              |sites                            |'jotspot'
Blogger Data API                                   |blogger                          |'blogger'
Book Search Data API                               |book                             |'print'
Calendar Data API                                  |calendar                         |'cl'
Google Code Search Data API                        |codesearch                       |'codesearch'
Contacts Data API                                  |contacts                         |'cp'
Documents List Data API                            |docs                             |'writely'
Finance Data API                                   |finance                          |'finance'
Gmail Atom feed                                    |mail                             |'mail'
Health Data API                                    |health                           |'health'
Health Data API H9 Sandbox                         |weaver                           |'weaver'
Maps Data APIs                                     |maps                             |'local'
Picasa Web Albums Data API                         |picasaweb                        |'lh2'
Sidewiki Data API                                  |sidewiki                         |'annotateweb'
Spreadsheets Data API                              |spreadsheets                     |'wise'
Webmaster Tools API                                |webmastertools                   |'sitemaps'
YouTube Data API                                   |youtube                          |'youtube'
C2DM Push Notification Service                     |c2dm                             |'ac2dm'
Google Reader Data API (unofficial)                |reader                           |'reader'
Google Voice API (unoffical)                       |voice                            |'grandcentral'
Google Music API (unoffical)                       |sj                               |'sj'


### How to use:

```javascript
var GoogleClientLogin = import('googleclientlogin').GoogleClientLogin;
var googleAuth = new GoogleClientLogin({
  email: 'yourmail@gmail.com',
  password: 'yourpassword',
  service: 'contacts',
  accountType: GoogleClientLogin.accountTypes.google
});
googleAuth.on(GoogleClientLogin.events.login, function(){
  // do things with google services
  require('https').request({
    host: 'www.google.com',
    port: 443,
    path: path,
    method: 'GET',
    headers: {
      'Authorization': 'GoogleLogin auth=' + googleAuth.getAuthId(),
      ...
    }
  });
});
googleAuth.on(GoogleClientLogin.events.error, function(e) {
    switch(e.message) {
      case GoogleClientLogin.errors.loginFailed:
        if (this.isCaptchaRequired()) {
          requestCaptchaFromUser(this.getCaptchaUrl(), this.getCaptchaToken());
        } else {
          requestLoginDetailsAgain();
        }
        break;
      case GoogleClientLogin.errors.tokenMissing:
      case GoogleClientLogin.errors.captchaMissing:
        throw new Error('You must pass the both captcha token and the captcha')
        break;
    }
    throw new Error('Unknown error');
  // damn..
});
googleAuth.login();
```
