# @attivio/fetch-utils

Library to use when accessing Attivio REST APIs with SAML-based authentication from a serverless web application such as a React single-page application.

To use it:

Add it to you project:

```
npm install --save @attivio/fetch-utils
```

And import the FetchUtils class into your application code:

```
import FetchUtils from '@attivio/fetch-utils';
```

Finally, use the `fetch()` method to access the REST APIs you need:

```
const baseUri = 'http://myhost:8080/searchui/';
const restEndpoint = 'rest/serverDetailsApi/user';
const callback = (result: any | null, error: string | null) => {
  if (result) {
    console.log('The API call returned this result', result);
  } else if (error) {
    console.log('The API call returned this error', error);
  }
};

FetchUtils.fetch(baseUri, restEndpoint, null, callback, 'GET', 'An error occured.');
 
```
