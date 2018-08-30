# @attivio/fetch-utils

This ia a library to use when accessing Attivio REST APIs with SAML-based authentication from a serverless web application such as a React single-page application. It contains a single function, `FetchUtils.fetch()` which you can use instead of calling the built-in `fetch()` API directly. This method does a few useful things for you:

* It sets the headers and parameters to the `fetch()` call in a consistent manner
* It handles cases where the `fetch()` call fails because of a potentially missing authentication token, redirecting to the special login API call on the servlet to trigger the authentication
* It provides a consistent way to receive results and error messages

## Using the Library

To use `@attivio/fetch-utils`:

1. Add it as a dependency to your project:

```
npm install --save @attivio/fetch-utils
```

2. Import the FetchUtils class into your application code where you will need to access the Attivio REST APIs:

```javascript
import FetchUtils from '@attivio/fetch-utils';
```

3. Finally, use it to access the REST APIs you need:

```javascript
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

## Using the `FetchUtils.fetch()` Method

The `FetchUtils.fetch()` method takes the following parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| baseUri   | string | the base URI for the Attivio servlet, up to and including the servlet context part of the path, including the trailing slash (e.g., /searchui/) |
| endpointUri | string | the part of the URI specific to the REST endpoint you want to access |
| payload | any | a JavaScript object containing the palyload to pass as parameters to the REST call; will be converted into a JSON string -- pass null if no payload is needed |
| callback | function (see below) | the function called when the fetch() call returns a result or an error |
| method | HttpMethod (see below) | the HTTP method to use when making the fetch request |
| defaultErrorMessage | string | the message that should be passed to the callback if an error occurs but no message can be obtained from the fetch() call |

The **callback** function takes two parameters and has no return value:

| Parameter | Type | Description |
|-----------|------|-------------|
| result | any \| null | a JavaScript object containing the result of a successful fetch() call; if an error occurred, this will be null |
| error | string \| null | the error message describing what went wrong if the fetch() call didn't succeed; if it did succeed, this will be null |

The type **HttpMethod** is one of the following strings: 'GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', or 'PATCH'.
