// @flow

export type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';

const FETCH_UTILS_USE_WINDOW = true;

/**
 * Utility class to handle fetch requests for the Attivio REST
 * APIs. Attempts to handle SAML-related redirects to log into
 * the identity provider by redirecting to the special "login"
 * page served by the Attivio servlet, which redirects to the
 * URI the browser is currently showing after successfully
 * logging in (if the user is already logged into the
 * identity provider from the client application, the logging
 * in should happen without the need for the user's intervention.
*/
export default class FetchUtils {
  /**
   * Make a fetch call to the REST API. Ensure that all requests
   * are handled in a similar way.
   *
   * @param baseUri              the base part of the URI to reach the
   *                             Attivio server (this should end in a /)
   * @param endpointUri          the endpoint-specific part of the URI
   *                             to contact (appended to the baseUri)
   * @param payload              an object to send in the request body,
   *                             or null if not applicable
   * @param callback             a function to call when the request
   *                             completes. If the request is successful,
   *                             the response parameter is set to the JSON
   *                             response, otherwise the error parameter
   *                             is set to a reason for the failure.
   * @param method               the HTTP method to use (e.g. GET or PUT);
   *                             should be an uppercase string (see the
   *                             HttpMethod type)
   * @param defaultErrorMessage  the default error message to return if
   *                             the fetch call doesn't provide one of its own.
   */
  static fetch(
    baseUri: string,
    endpointUri: string,
    payload: any | null,
    callback: (response: any | null, error: string | null) => void,
    method: HttpMethod,
    defaultErrorMessage: string
  ) {
    const uri = `${baseUri}${endpointUri}`;
    const headers = new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    });

    const body = payload ? JSON.stringify(payload) : null;
    const params = {
      method,
      headers,
      body,
      mode: 'cors',
      redirect: 'follow',
      credentials: 'include'
    };

    const fetchRequest = new Request(uri, params);

    fetch(fetchRequest).then(
      (response: Response) => {
        if (response.ok) {
          const contentType = response.headers.get('content-type');

          if (!contentType || contentType.indexOf('text/html') === -1) {
            response.json().then((jsonResponse: any) => {
              callback(jsonResponse, null);
            }).catch((error: any) => {
              // Catch errors from converting the response's JSON
              callback(null, FetchUtils.getErrorMessage(error, defaultErrorMessage));
            });
          } else {
            // If the response content-type is HTML then reload the page because user's session likely timed out.
            // SAML tries to redirect but we can't deal with that in Ajax.
            FetchUtils.forward(baseUri);
          }
        } else {
          // The request came back other than a 200-type response code
          // There should be JSON describing it...
          response.json().then((searchException: any) => {
            const exceptionMessage = searchException.message ? searchException.message : '';
            const exceptionCode = searchException.errorCode ? ` (${(searchException.errorCode: string)
        })` : '';
            const finalExceptionMessage = `${defaultErrorMessage} ${exceptionMessage} ${exceptionCode} `;

            callback(null, finalExceptionMessage);
          }).catch((badJsonError: any) => {
            callback(null, FetchUtils.getErrorMessage(badJsonError, defaultErrorMessage));
          });
        }
      },
      () => {
        // Catch network-type errors from the main fetch() call and reload the page.
        FetchUtils.forward(baseUri);
      },
    ).catch((error: any) => {
      // Catch exceptions from the main "then" function
      callback(null, FetchUtils.getErrorMessage(error, defaultErrorMessage));
    });
  }

  /**
   * Called to forward failed fetch calls through the special login
   * endpoint to force a re-up of the SAML authentication.
   *
   * @param baseUri   the base URI for the Attivio server
   */
  static forward(baseUri: string) {
    if (FETCH_UTILS_USE_WINDOW) {
      const closerUrl = `${baseUri}closer.html`;
      const newWindow = window.open(closerUrl, 'attivio_validation', 'alwaysLowered=1,titlebar=0,dependent=1,location=0');
      newWindow.blur();
      window.focus();
    } else {
      const currentUri = window.location.href;
      const encodedUri = encodeURIComponent(currentUri);
      const newUri = `${baseUri}rest/login?uri=${encodedUri}`;

      window.location = newUri;
    }
  }

  /**
   * Get an error message to display to the user.
   *
   * @param error               the error received
   * @param defaultErrorMessage a default message to show if error doesn't say anything
   * @return                    a string representing the error that occurred
   */
  static getErrorMessage(error: any, defaultErrorMessage: string): string {
    let message;

    if (error && error.message) {
      message = error.message;
    } else {
      message = defaultErrorMessage;
    }
    return message;
  }
}
