**Note**: The only dependency upon this repo is by github-push-event, so when that repo is retired, this one should be too.

# byu-oauth
Handles the OAuth2.0 flow for BYU APIs

## Examples
```JavaScript
var OAuth = require("byu-oauth");

OAuth.getAccessToken(OAuth.grant_type.AUTHORIZATION_CODE, {
  client_id: /*client id*/,
  client_secret: /*client secret*/,
  code: /*authorization code*/,
  redirect_uri: /*redirect uri--where WSO2 redirected user after user validated your app*/
}).then(function (token) {
  
  //  use token here
  console.log(token);

}).catch(function (err) {
  
  //  handle error here
  console.error(err);
});

OAuth.getAccessToken(OAuth.grant_type.CLIENT_CREDENTIALS, {
  client_id: /*client id*/,
  client_secret: /*client secret*/
}).then(function (token) {
  
  //  use token here
  console.log(token);

}).catch(function (err) {
  
  //  handle error here
  console.error(err);
});

OAuth.getAccessToken(OAuth.grant_type.REFRESH_TOKEN, {
  client_id: /*client id*/,
  client_secret: /*client secret*/
  refresh_token: /*refresh token*/
}).then(function (token) {
  
  //  use token here
  console.log(token);

}).catch(function (err) {
  
  //  handle error here
  console.error(err);
});

OAuth.getAccessToken(OAuth.grant_type.RESOURCE_OWNER, {
  client_id: /*client id*/,
  client_secret: /*client secret*/,
  password: /*password for NetID*/,
  username: /*NetID*/
}).then(function (token) {
  
  //  use token here
  console.log(token);

}).catch(function (err) {
  
  //  handle error here
  console.error(err);
});

OAuth.generateAuthorizationURL(OAuth.grant_type.AUTHORIZATION_CODE, /*client id*/, /*redirect uri*/)
.then(function (authorization_url) {
  
  //  use authorization URL here
  console.log(authorization_url);

}).catch(function (err) {
  
  //  handle error here
  console.error(err);
});

OAuth.generateAuthorizationURL(OAuth.grant_type.IMPLICIT, /*client id*/, /*redirect uri*/)
.then(function (authorization_url) {
  
  //  use authorization URL here
  console.log(authorization_url);

}).catch(function (err) {
  
  //  handle error here
  console.error(err);
});

```
