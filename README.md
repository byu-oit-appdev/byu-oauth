# byu-oauth
Handles the OAuth2.0 flow for BYU APIs

## Examples
```JavaScript
var OAuth = require("byu-oauth");

OAuth.getAccessToken(OAuth.grantType.AUTHORIZATION_CODE, {
  client_id: /*client id*/,
  client_secret: /*client secret*/,
  code: /*authorization code*/,
  redirect_uri: /*redirect uri--where WSO2 redirected user after user validated your app*/
}).then(function (err, token) {
  //  use access token to get resources
  console.log(token.access_token);
});

OAuth.getAccessToken(OAuth.grantType.CLIENT_CREDENTIALS, {
  client_id: /*client id*/,
  client_secret: /*client secret*/
}).then(function (err, token) {
  //  use access token to get resources
  console.log(token.access_token);
});

OAuth.getAccessToken(OAuth.grantType.RESOURCE_OWNER, {
  client_id: /*client id*/,
  client_secret: /*client secret*/,
  password: /*password for NetID*/,
  username: /*NetID*/
}).then(function (err, token) {
  //  use access token to get resources
  console.log(token.access_token);
}

OAuth.generateAuthorizationURL(OAuth.grantType.AUTHORIZATION_CODE, /*client id*/, /*redirect uri*/)
.then(function (err, url) {
  //  redirect user to URL
  //  when directed to your 'redirect_uri', authorization code will be 'code' in query string
});

OAuth.generateAuthorizationURL(OAuth.grantType.IMPLICIT, /*client id*/, /*redirect uri*/)
.then(function (err, url) {
  //  redirect user to URL
  //  when directed to your 'redirect_uri', access token will be in address bar, but you have to
  //    access it from the front end
});

```