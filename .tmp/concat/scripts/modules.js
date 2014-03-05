/**
 * @license AngularJS v1.2.15-build.2365+sha.d07101d
 * (c) 2010-2014 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function (window, angular, undefined) {
  'use strict';
  var $resourceMinErr = angular.$$minErr('$resource');
  // Helper functions and regex to lookup a dotted path on an object
  // stopping at undefined/null.  The path must be composed of ASCII
  // identifiers (just like $parse)
  var MEMBER_NAME_REGEX = /^(\.[a-zA-Z_$][0-9a-zA-Z_$]*)+$/;
  function isValidDottedPath(path) {
    return path != null && path !== '' && path !== 'hasOwnProperty' && MEMBER_NAME_REGEX.test('.' + path);
  }
  function lookupDottedPath(obj, path) {
    if (!isValidDottedPath(path)) {
      throw $resourceMinErr('badmember', 'Dotted member path "@{0}" is invalid.', path);
    }
    var keys = path.split('.');
    for (var i = 0, ii = keys.length; i < ii && obj !== undefined; i++) {
      var key = keys[i];
      obj = obj !== null ? obj[key] : undefined;
    }
    return obj;
  }
  /**
 * Create a shallow copy of an object and clear other fields from the destination
 */
  function shallowClearAndCopy(src, dst) {
    dst = dst || {};
    angular.forEach(dst, function (value, key) {
      delete dst[key];
    });
    for (var key in src) {
      if (src.hasOwnProperty(key) && !(key.charAt(0) === '$' && key.charAt(1) === '$')) {
        dst[key] = src[key];
      }
    }
    return dst;
  }
  /**
 * @ngdoc module
 * @name ngResource
 * @description
 *
 * # ngResource
 *
 * The `ngResource` module provides interaction support with RESTful services
 * via the $resource service.
 *
 *
 * <div doc-module-components="ngResource"></div>
 *
 * See {@link ngResource.$resource `$resource`} for usage.
 */
  /**
 * @ngdoc service
 * @name $resource
 * @requires $http
 *
 * @description
 * A factory which creates a resource object that lets you interact with
 * [RESTful](http://en.wikipedia.org/wiki/Representational_State_Transfer) server-side data sources.
 *
 * The returned resource object has action methods which provide high-level behaviors without
 * the need to interact with the low level {@link ng.$http $http} service.
 *
 * Requires the {@link ngResource `ngResource`} module to be installed.
 *
 * @param {string} url A parametrized URL template with parameters prefixed by `:` as in
 *   `/user/:username`. If you are using a URL with a port number (e.g.
 *   `http://example.com:8080/api`), it will be respected.
 *
 *   If you are using a url with a suffix, just add the suffix, like this:
 *   `$resource('http://example.com/resource.json')` or `$resource('http://example.com/:id.json')`
 *   or even `$resource('http://example.com/resource/:resource_id.:format')`
 *   If the parameter before the suffix is empty, :resource_id in this case, then the `/.` will be
 *   collapsed down to a single `.`.  If you need this sequence to appear and not collapse then you
 *   can escape it with `/\.`.
 *
 * @param {Object=} paramDefaults Default values for `url` parameters. These can be overridden in
 *   `actions` methods. If any of the parameter value is a function, it will be executed every time
 *   when a param value needs to be obtained for a request (unless the param was overridden).
 *
 *   Each key value in the parameter object is first bound to url template if present and then any
 *   excess keys are appended to the url search query after the `?`.
 *
 *   Given a template `/path/:verb` and parameter `{verb:'greet', salutation:'Hello'}` results in
 *   URL `/path/greet?salutation=Hello`.
 *
 *   If the parameter value is prefixed with `@` then the value of that parameter is extracted from
 *   the data object (useful for non-GET operations).
 *
 * @param {Object.<Object>=} actions Hash with declaration of custom action that should extend
 *   the default set of resource actions. The declaration should be created in the format of {@link
 *   ng.$http#usage_parameters $http.config}:
 *
 *       {action1: {method:?, params:?, isArray:?, headers:?, ...},
 *        action2: {method:?, params:?, isArray:?, headers:?, ...},
 *        ...}
 *
 *   Where:
 *
 *   - **`action`** – {string} – The name of action. This name becomes the name of the method on
 *     your resource object.
 *   - **`method`** – {string} – HTTP request method. Valid methods are: `GET`, `POST`, `PUT`,
 *     `DELETE`, and `JSONP`.
 *   - **`params`** – {Object=} – Optional set of pre-bound parameters for this action. If any of
 *     the parameter value is a function, it will be executed every time when a param value needs to
 *     be obtained for a request (unless the param was overridden).
 *   - **`url`** – {string} – action specific `url` override. The url templating is supported just
 *     like for the resource-level urls.
 *   - **`isArray`** – {boolean=} – If true then the returned object for this action is an array,
 *     see `returns` section.
 *   - **`transformRequest`** –
 *     `{function(data, headersGetter)|Array.<function(data, headersGetter)>}` –
 *     transform function or an array of such functions. The transform function takes the http
 *     request body and headers and returns its transformed (typically serialized) version.
 *   - **`transformResponse`** –
 *     `{function(data, headersGetter)|Array.<function(data, headersGetter)>}` –
 *     transform function or an array of such functions. The transform function takes the http
 *     response body and headers and returns its transformed (typically deserialized) version.
 *   - **`cache`** – `{boolean|Cache}` – If true, a default $http cache will be used to cache the
 *     GET request, otherwise if a cache instance built with
 *     {@link ng.$cacheFactory $cacheFactory}, this cache will be used for
 *     caching.
 *   - **`timeout`** – `{number|Promise}` – timeout in milliseconds, or {@link ng.$q promise} that
 *     should abort the request when resolved.
 *   - **`withCredentials`** - `{boolean}` - whether to set the `withCredentials` flag on the
 *     XHR object. See
 *     [requests with credentials](https://developer.mozilla.org/en/http_access_control#section_5)
 *     for more information.
 *   - **`responseType`** - `{string}` - see
 *     [requestType](https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#responseType).
 *   - **`interceptor`** - `{Object=}` - The interceptor object has two optional methods -
 *     `response` and `responseError`. Both `response` and `responseError` interceptors get called
 *     with `http response` object. See {@link ng.$http $http interceptors}.
 *
 * @returns {Object} A resource "class" object with methods for the default set of resource actions
 *   optionally extended with custom `actions`. The default set contains these actions:
 *   ```js
 *   { 'get':    {method:'GET'},
 *     'save':   {method:'POST'},
 *     'query':  {method:'GET', isArray:true},
 *     'remove': {method:'DELETE'},
 *     'delete': {method:'DELETE'} };
 *   ```
 *
 *   Calling these methods invoke an {@link ng.$http} with the specified http method,
 *   destination and parameters. When the data is returned from the server then the object is an
 *   instance of the resource class. The actions `save`, `remove` and `delete` are available on it
 *   as  methods with the `$` prefix. This allows you to easily perform CRUD operations (create,
 *   read, update, delete) on server-side data like this:
 *   ```js
 *   var User = $resource('/user/:userId', {userId:'@id'});
 *   var user = User.get({userId:123}, function() {
 *     user.abc = true;
 *     user.$save();
 *   });
 *   ```
 *
 *   It is important to realize that invoking a $resource object method immediately returns an
 *   empty reference (object or array depending on `isArray`). Once the data is returned from the
 *   server the existing reference is populated with the actual data. This is a useful trick since
 *   usually the resource is assigned to a model which is then rendered by the view. Having an empty
 *   object results in no rendering, once the data arrives from the server then the object is
 *   populated with the data and the view automatically re-renders itself showing the new data. This
 *   means that in most cases one never has to write a callback function for the action methods.
 *
 *   The action methods on the class object or instance object can be invoked with the following
 *   parameters:
 *
 *   - HTTP GET "class" actions: `Resource.action([parameters], [success], [error])`
 *   - non-GET "class" actions: `Resource.action([parameters], postData, [success], [error])`
 *   - non-GET instance actions:  `instance.$action([parameters], [success], [error])`
 *
 *   Success callback is called with (value, responseHeaders) arguments. Error callback is called
 *   with (httpResponse) argument.
 *
 *   Class actions return empty instance (with additional properties below).
 *   Instance actions return promise of the action.
 *
 *   The Resource instances and collection have these additional properties:
 *
 *   - `$promise`: the {@link ng.$q promise} of the original server interaction that created this
 *     instance or collection.
 *
 *     On success, the promise is resolved with the same resource instance or collection object,
 *     updated with data from server. This makes it easy to use in
 *     {@link ngRoute.$routeProvider resolve section of $routeProvider.when()} to defer view
 *     rendering until the resource(s) are loaded.
 *
 *     On failure, the promise is resolved with the {@link ng.$http http response} object, without
 *     the `resource` property.
 *
 *   - `$resolved`: `true` after first server interaction is completed (either with success or
 *      rejection), `false` before that. Knowing if the Resource has been resolved is useful in
 *      data-binding.
 *
 * @example
 *
 * # Credit card resource
 *
 * ```js
     // Define CreditCard class
     var CreditCard = $resource('/user/:userId/card/:cardId',
      {userId:123, cardId:'@id'}, {
       charge: {method:'POST', params:{charge:true}}
      });

     // We can retrieve a collection from the server
     var cards = CreditCard.query(function() {
       // GET: /user/123/card
       // server returns: [ {id:456, number:'1234', name:'Smith'} ];

       var card = cards[0];
       // each item is an instance of CreditCard
       expect(card instanceof CreditCard).toEqual(true);
       card.name = "J. Smith";
       // non GET methods are mapped onto the instances
       card.$save();
       // POST: /user/123/card/456 {id:456, number:'1234', name:'J. Smith'}
       // server returns: {id:456, number:'1234', name: 'J. Smith'};

       // our custom method is mapped as well.
       card.$charge({amount:9.99});
       // POST: /user/123/card/456?amount=9.99&charge=true {id:456, number:'1234', name:'J. Smith'}
     });

     // we can create an instance as well
     var newCard = new CreditCard({number:'0123'});
     newCard.name = "Mike Smith";
     newCard.$save();
     // POST: /user/123/card {number:'0123', name:'Mike Smith'}
     // server returns: {id:789, number:'0123', name: 'Mike Smith'};
     expect(newCard.id).toEqual(789);
 * ```
 *
 * The object returned from this function execution is a resource "class" which has "static" method
 * for each action in the definition.
 *
 * Calling these methods invoke `$http` on the `url` template with the given `method`, `params` and
 * `headers`.
 * When the data is returned from the server then the object is an instance of the resource type and
 * all of the non-GET methods are available with `$` prefix. This allows you to easily support CRUD
 * operations (create, read, update, delete) on server-side data.

   ```js
     var User = $resource('/user/:userId', {userId:'@id'});
     var user = User.get({userId:123}, function() {
       user.abc = true;
       user.$save();
     });
   ```
 *
 * It's worth noting that the success callback for `get`, `query` and other methods gets passed
 * in the response that came from the server as well as $http header getter function, so one
 * could rewrite the above example and get access to http headers as:
 *
   ```js
     var User = $resource('/user/:userId', {userId:'@id'});
     User.get({userId:123}, function(u, getResponseHeaders){
       u.abc = true;
       u.$save(function(u, putResponseHeaders) {
         //u => saved user object
         //putResponseHeaders => $http header getter
       });
     });
   ```

 * # Creating a custom 'PUT' request
 * In this example we create a custom method on our resource to make a PUT request
 * ```js
 *		var app = angular.module('app', ['ngResource', 'ngRoute']);
 *
 *		// Some APIs expect a PUT request in the format URL/object/ID
 *		// Here we are creating an 'update' method
 *		app.factory('Notes', ['$resource', function($resource) {
 *    return $resource('/notes/:id', null,
 *        {
 *            'update': { method:'PUT' }
 *        });
 *		}]);
 *
 *		// In our controller we get the ID from the URL using ngRoute and $routeParams
 *		// We pass in $routeParams and our Notes factory along with $scope
 *		app.controller('NotesCtrl', ['$scope', '$routeParams', 'Notes',
                                      function($scope, $routeParams, Notes) {
 *    // First get a note object from the factory
 *    var note = Notes.get({ id:$routeParams.id });
 *    $id = note.id;
 *
 *    // Now call update passing in the ID first then the object you are updating
 *    Notes.update({ id:$id }, note);
 *
 *    // This will PUT /notes/ID with the note object in the request payload
 *		}]);
 * ```
 */
  angular.module('ngResource', ['ng']).factory('$resource', [
    '$http',
    '$q',
    function ($http, $q) {
      var DEFAULT_ACTIONS = {
          'get': { method: 'GET' },
          'save': { method: 'POST' },
          'query': {
            method: 'GET',
            isArray: true
          },
          'remove': { method: 'DELETE' },
          'delete': { method: 'DELETE' }
        };
      var noop = angular.noop, forEach = angular.forEach, extend = angular.extend, copy = angular.copy, isFunction = angular.isFunction;
      /**
     * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
     * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
     * segments:
     *    segment       = *pchar
     *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
     *    pct-encoded   = "%" HEXDIG HEXDIG
     *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
     *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
     *                     / "*" / "+" / "," / ";" / "="
     */
      function encodeUriSegment(val) {
        return encodeUriQuery(val, true).replace(/%26/gi, '&').replace(/%3D/gi, '=').replace(/%2B/gi, '+');
      }
      /**
     * This method is intended for encoding *key* or *value* parts of query component. We need a
     * custom method because encodeURIComponent is too aggressive and encodes stuff that doesn't
     * have to be encoded per http://tools.ietf.org/html/rfc3986:
     *    query       = *( pchar / "/" / "?" )
     *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
     *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
     *    pct-encoded   = "%" HEXDIG HEXDIG
     *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
     *                     / "*" / "+" / "," / ";" / "="
     */
      function encodeUriQuery(val, pctEncodeSpaces) {
        return encodeURIComponent(val).replace(/%40/gi, '@').replace(/%3A/gi, ':').replace(/%24/g, '$').replace(/%2C/gi, ',').replace(/%20/g, pctEncodeSpaces ? '%20' : '+');
      }
      function Route(template, defaults) {
        this.template = template;
        this.defaults = defaults || {};
        this.urlParams = {};
      }
      Route.prototype = {
        setUrlParams: function (config, params, actionUrl) {
          var self = this, url = actionUrl || self.template, val, encodedVal;
          var urlParams = self.urlParams = {};
          forEach(url.split(/\W/), function (param) {
            if (param === 'hasOwnProperty') {
              throw $resourceMinErr('badname', 'hasOwnProperty is not a valid parameter name.');
            }
            if (!new RegExp('^\\d+$').test(param) && param && new RegExp('(^|[^\\\\]):' + param + '(\\W|$)').test(url)) {
              urlParams[param] = true;
            }
          });
          url = url.replace(/\\:/g, ':');
          params = params || {};
          forEach(self.urlParams, function (_, urlParam) {
            val = params.hasOwnProperty(urlParam) ? params[urlParam] : self.defaults[urlParam];
            if (angular.isDefined(val) && val !== null) {
              encodedVal = encodeUriSegment(val);
              url = url.replace(new RegExp(':' + urlParam + '(\\W|$)', 'g'), function (match, p1) {
                return encodedVal + p1;
              });
            } else {
              url = url.replace(new RegExp('(/?):' + urlParam + '(\\W|$)', 'g'), function (match, leadingSlashes, tail) {
                if (tail.charAt(0) == '/') {
                  return tail;
                } else {
                  return leadingSlashes + tail;
                }
              });
            }
          });
          // strip trailing slashes and set the url
          url = url.replace(/\/+$/, '') || '/';
          // then replace collapse `/.` if found in the last URL path segment before the query
          // E.g. `http://url.com/id./format?q=x` becomes `http://url.com/id.format?q=x`
          url = url.replace(/\/\.(?=\w+($|\?))/, '.');
          // replace escaped `/\.` with `/.`
          config.url = url.replace(/\/\\\./, '/.');
          // set params - delegate param encoding to $http
          forEach(params, function (value, key) {
            if (!self.urlParams[key]) {
              config.params = config.params || {};
              config.params[key] = value;
            }
          });
        }
      };
      function resourceFactory(url, paramDefaults, actions) {
        var route = new Route(url);
        actions = extend({}, DEFAULT_ACTIONS, actions);
        function extractParams(data, actionParams) {
          var ids = {};
          actionParams = extend({}, paramDefaults, actionParams);
          forEach(actionParams, function (value, key) {
            if (isFunction(value)) {
              value = value();
            }
            ids[key] = value && value.charAt && value.charAt(0) == '@' ? lookupDottedPath(data, value.substr(1)) : value;
          });
          return ids;
        }
        function defaultResponseInterceptor(response) {
          return response.resource;
        }
        function Resource(value) {
          shallowClearAndCopy(value || {}, this);
        }
        forEach(actions, function (action, name) {
          var hasBody = /^(POST|PUT|PATCH)$/i.test(action.method);
          Resource[name] = function (a1, a2, a3, a4) {
            var params = {}, data, success, error;
            /* jshint -W086 */
            /* (purposefully fall through case statements) */
            switch (arguments.length) {
            case 4:
              error = a4;
              success = a3;
            //fallthrough
            case 3:
            case 2:
              if (isFunction(a2)) {
                if (isFunction(a1)) {
                  success = a1;
                  error = a2;
                  break;
                }
                success = a2;
                error = a3;  //fallthrough
              } else {
                params = a1;
                data = a2;
                success = a3;
                break;
              }
            case 1:
              if (isFunction(a1))
                success = a1;
              else if (hasBody)
                data = a1;
              else
                params = a1;
              break;
            case 0:
              break;
            default:
              throw $resourceMinErr('badargs', 'Expected up to 4 arguments [params, data, success, error], got {0} arguments', arguments.length);
            }
            /* jshint +W086 */
            /* (purposefully fall through case statements) */
            var isInstanceCall = this instanceof Resource;
            var value = isInstanceCall ? data : action.isArray ? [] : new Resource(data);
            var httpConfig = {};
            var responseInterceptor = action.interceptor && action.interceptor.response || defaultResponseInterceptor;
            var responseErrorInterceptor = action.interceptor && action.interceptor.responseError || undefined;
            forEach(action, function (value, key) {
              if (key != 'params' && key != 'isArray' && key != 'interceptor') {
                httpConfig[key] = copy(value);
              }
            });
            if (hasBody)
              httpConfig.data = data;
            route.setUrlParams(httpConfig, extend({}, extractParams(data, action.params || {}), params), action.url);
            var promise = $http(httpConfig).then(function (response) {
                var data = response.data, promise = value.$promise;
                if (data) {
                  // Need to convert action.isArray to boolean in case it is undefined
                  // jshint -W018
                  if (angular.isArray(data) !== !!action.isArray) {
                    throw $resourceMinErr('badcfg', 'Error in resource configuration. Expected ' + 'response to contain an {0} but got an {1}', action.isArray ? 'array' : 'object', angular.isArray(data) ? 'array' : 'object');
                  }
                  // jshint +W018
                  if (action.isArray) {
                    value.length = 0;
                    forEach(data, function (item) {
                      value.push(new Resource(item));
                    });
                  } else {
                    shallowClearAndCopy(data, value);
                    value.$promise = promise;
                  }
                }
                value.$resolved = true;
                response.resource = value;
                return response;
              }, function (response) {
                value.$resolved = true;
                (error || noop)(response);
                return $q.reject(response);
              });
            promise = promise.then(function (response) {
              var value = responseInterceptor(response);
              (success || noop)(value, response.headers);
              return value;
            }, responseErrorInterceptor);
            if (!isInstanceCall) {
              // we are creating instance / collection
              // - set the initial promise
              // - return the instance / collection
              value.$promise = promise;
              value.$resolved = false;
              return value;
            }
            // instance call
            return promise;
          };
          Resource.prototype['$' + name] = function (params, success, error) {
            if (isFunction(params)) {
              error = success;
              success = params;
              params = {};
            }
            var result = Resource[name].call(this, params, this, success, error);
            return result.$promise || result;
          };
        });
        Resource.bind = function (additionalParamDefaults) {
          return resourceFactory(url, extend({}, paramDefaults, additionalParamDefaults), actions);
        };
        return Resource;
      }
      return resourceFactory;
    }
  ]);
}(window, window.angular));
/**
 * @license AngularJS v1.2.15-build.2365+sha.d07101d
 * (c) 2010-2014 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function (window, angular, undefined) {
  'use strict';
  /**
 * @ngdoc module
 * @name ngRoute
 * @description
 *
 * # ngRoute
 *
 * The `ngRoute` module provides routing and deeplinking services and directives for angular apps.
 *
 * ## Example
 * See {@link ngRoute.$route#example $route} for an example of configuring and using `ngRoute`.
 *
 *
 * <div doc-module-components="ngRoute"></div>
 */
  /* global -ngRouteModule */
  var ngRouteModule = angular.module('ngRoute', ['ng']).provider('$route', $RouteProvider);
  /**
 * @ngdoc provider
 * @name $routeProvider
 * @function
 *
 * @description
 *
 * Used for configuring routes.
 *
 * ## Example
 * See {@link ngRoute.$route#example $route} for an example of configuring and using `ngRoute`.
 *
 * ## Dependencies
 * Requires the {@link ngRoute `ngRoute`} module to be installed.
 */
  function $RouteProvider() {
    function inherit(parent, extra) {
      return angular.extend(new (angular.extend(function () {
      }, { prototype: parent }))(), extra);
    }
    var routes = {};
    /**
   * @ngdoc method
   * @name $routeProvider#when
   *
   * @param {string} path Route path (matched against `$location.path`). If `$location.path`
   *    contains redundant trailing slash or is missing one, the route will still match and the
   *    `$location.path` will be updated to add or drop the trailing slash to exactly match the
   *    route definition.
   *
   *    * `path` can contain named groups starting with a colon: e.g. `:name`. All characters up
   *        to the next slash are matched and stored in `$routeParams` under the given `name`
   *        when the route matches.
   *    * `path` can contain named groups starting with a colon and ending with a star:
   *        e.g.`:name*`. All characters are eagerly stored in `$routeParams` under the given `name`
   *        when the route matches.
   *    * `path` can contain optional named groups with a question mark: e.g.`:name?`.
   *
   *    For example, routes like `/color/:color/largecode/:largecode*\/edit` will match
   *    `/color/brown/largecode/code/with/slashes/edit` and extract:
   *
   *    * `color: brown`
   *    * `largecode: code/with/slashes`.
   *
   *
   * @param {Object} route Mapping information to be assigned to `$route.current` on route
   *    match.
   *
   *    Object properties:
   *
   *    - `controller` – `{(string|function()=}` – Controller fn that should be associated with
   *      newly created scope or the name of a {@link angular.Module#controller registered
   *      controller} if passed as a string.
   *    - `controllerAs` – `{string=}` – A controller alias name. If present the controller will be
   *      published to scope under the `controllerAs` name.
   *    - `template` – `{string=|function()=}` – html template as a string or a function that
   *      returns an html template as a string which should be used by {@link
   *      ngRoute.directive:ngView ngView} or {@link ng.directive:ngInclude ngInclude} directives.
   *      This property takes precedence over `templateUrl`.
   *
   *      If `template` is a function, it will be called with the following parameters:
   *
   *      - `{Array.&lt;Object&gt;}` - route parameters extracted from the current
   *        `$location.path()` by applying the current route
   *
   *    - `templateUrl` – `{string=|function()=}` – path or function that returns a path to an html
   *      template that should be used by {@link ngRoute.directive:ngView ngView}.
   *
   *      If `templateUrl` is a function, it will be called with the following parameters:
   *
   *      - `{Array.&lt;Object&gt;}` - route parameters extracted from the current
   *        `$location.path()` by applying the current route
   *
   *    - `resolve` - `{Object.<string, function>=}` - An optional map of dependencies which should
   *      be injected into the controller. If any of these dependencies are promises, the router
   *      will wait for them all to be resolved or one to be rejected before the controller is
   *      instantiated.
   *      If all the promises are resolved successfully, the values of the resolved promises are
   *      injected and {@link ngRoute.$route#$routeChangeSuccess $routeChangeSuccess} event is
   *      fired. If any of the promises are rejected the
   *      {@link ngRoute.$route#$routeChangeError $routeChangeError} event is fired. The map object
   *      is:
   *
   *      - `key` – `{string}`: a name of a dependency to be injected into the controller.
   *      - `factory` - `{string|function}`: If `string` then it is an alias for a service.
   *        Otherwise if function, then it is {@link auto.$injector#invoke injected}
   *        and the return value is treated as the dependency. If the result is a promise, it is
   *        resolved before its value is injected into the controller. Be aware that
   *        `ngRoute.$routeParams` will still refer to the previous route within these resolve
   *        functions.  Use `$route.current.params` to access the new route parameters, instead.
   *
   *    - `redirectTo` – {(string|function())=} – value to update
   *      {@link ng.$location $location} path with and trigger route redirection.
   *
   *      If `redirectTo` is a function, it will be called with the following parameters:
   *
   *      - `{Object.<string>}` - route parameters extracted from the current
   *        `$location.path()` by applying the current route templateUrl.
   *      - `{string}` - current `$location.path()`
   *      - `{Object}` - current `$location.search()`
   *
   *      The custom `redirectTo` function is expected to return a string which will be used
   *      to update `$location.path()` and `$location.search()`.
   *
   *    - `[reloadOnSearch=true]` - {boolean=} - reload route when only `$location.search()`
   *      or `$location.hash()` changes.
   *
   *      If the option is set to `false` and url in the browser changes, then
   *      `$routeUpdate` event is broadcasted on the root scope.
   *
   *    - `[caseInsensitiveMatch=false]` - {boolean=} - match routes without being case sensitive
   *
   *      If the option is set to `true`, then the particular route can be matched without being
   *      case sensitive
   *
   * @returns {Object} self
   *
   * @description
   * Adds a new route definition to the `$route` service.
   */
    this.when = function (path, route) {
      routes[path] = angular.extend({ reloadOnSearch: true }, route, path && pathRegExp(path, route));
      // create redirection for trailing slashes
      if (path) {
        var redirectPath = path[path.length - 1] == '/' ? path.substr(0, path.length - 1) : path + '/';
        routes[redirectPath] = angular.extend({ redirectTo: path }, pathRegExp(redirectPath, route));
      }
      return this;
    };
    /**
    * @param path {string} path
    * @param opts {Object} options
    * @return {?Object}
    *
    * @description
    * Normalizes the given path, returning a regular expression
    * and the original path.
    *
    * Inspired by pathRexp in visionmedia/express/lib/utils.js.
    */
    function pathRegExp(path, opts) {
      var insensitive = opts.caseInsensitiveMatch, ret = {
          originalPath: path,
          regexp: path
        }, keys = ret.keys = [];
      path = path.replace(/([().])/g, '\\$1').replace(/(\/)?:(\w+)([\?\*])?/g, function (_, slash, key, option) {
        var optional = option === '?' ? option : null;
        var star = option === '*' ? option : null;
        keys.push({
          name: key,
          optional: !!optional
        });
        slash = slash || '';
        return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (star && '(.+?)' || '([^/]+)') + (optional || '') + ')' + (optional || '');
      }).replace(/([\/$\*])/g, '\\$1');
      ret.regexp = new RegExp('^' + path + '$', insensitive ? 'i' : '');
      return ret;
    }
    /**
   * @ngdoc method
   * @name $routeProvider#otherwise
   *
   * @description
   * Sets route definition that will be used on route change when no other route definition
   * is matched.
   *
   * @param {Object} params Mapping information to be assigned to `$route.current`.
   * @returns {Object} self
   */
    this.otherwise = function (params) {
      this.when(null, params);
      return this;
    };
    this.$get = [
      '$rootScope',
      '$location',
      '$routeParams',
      '$q',
      '$injector',
      '$http',
      '$templateCache',
      '$sce',
      function ($rootScope, $location, $routeParams, $q, $injector, $http, $templateCache, $sce) {
        /**
     * @ngdoc service
     * @name $route
     * @requires $location
     * @requires $routeParams
     *
     * @property {Object} current Reference to the current route definition.
     * The route definition contains:
     *
     *   - `controller`: The controller constructor as define in route definition.
     *   - `locals`: A map of locals which is used by {@link ng.$controller $controller} service for
     *     controller instantiation. The `locals` contain
     *     the resolved values of the `resolve` map. Additionally the `locals` also contain:
     *
     *     - `$scope` - The current route scope.
     *     - `$template` - The current route template HTML.
     *
     * @property {Array.<Object>} routes Array of all configured routes.
     *
     * @description
     * `$route` is used for deep-linking URLs to controllers and views (HTML partials).
     * It watches `$location.url()` and tries to map the path to an existing route definition.
     *
     * Requires the {@link ngRoute `ngRoute`} module to be installed.
     *
     * You can define routes through {@link ngRoute.$routeProvider $routeProvider}'s API.
     *
     * The `$route` service is typically used in conjunction with the
     * {@link ngRoute.directive:ngView `ngView`} directive and the
     * {@link ngRoute.$routeParams `$routeParams`} service.
     *
     * @example
       This example shows how changing the URL hash causes the `$route` to match a route against the
       URL, and the `ngView` pulls in the partial.

       Note that this example is using {@link ng.directive:script inlined templates}
       to get it working on jsfiddle as well.

     <example name="$route-service" module="ngRouteExample" deps="angular-route.js" fixBase="true">
       <file name="index.html">
         <div ng-controller="MainCntl">
           Choose:
           <a href="Book/Moby">Moby</a> |
           <a href="Book/Moby/ch/1">Moby: Ch1</a> |
           <a href="Book/Gatsby">Gatsby</a> |
           <a href="Book/Gatsby/ch/4?key=value">Gatsby: Ch4</a> |
           <a href="Book/Scarlet">Scarlet Letter</a><br/>

           <div ng-view></div>
           <hr />

           <pre>$location.path() = {{$location.path()}}</pre>
           <pre>$route.current.templateUrl = {{$route.current.templateUrl}}</pre>
           <pre>$route.current.params = {{$route.current.params}}</pre>
           <pre>$route.current.scope.name = {{$route.current.scope.name}}</pre>
           <pre>$routeParams = {{$routeParams}}</pre>
         </div>
       </file>

       <file name="book.html">
         controller: {{name}}<br />
         Book Id: {{params.bookId}}<br />
       </file>

       <file name="chapter.html">
         controller: {{name}}<br />
         Book Id: {{params.bookId}}<br />
         Chapter Id: {{params.chapterId}}
       </file>

       <file name="script.js">
         angular.module('ngRouteExample', ['ngRoute'])

         .config(function($routeProvider, $locationProvider) {
           $routeProvider.when('/Book/:bookId', {
             templateUrl: 'book.html',
             controller: BookCntl,
             resolve: {
               // I will cause a 1 second delay
               delay: function($q, $timeout) {
                 var delay = $q.defer();
                 $timeout(delay.resolve, 1000);
                 return delay.promise;
               }
             }
           });
           $routeProvider.when('/Book/:bookId/ch/:chapterId', {
             templateUrl: 'chapter.html',
             controller: ChapterCntl
           });

           // configure html5 to get links working on jsfiddle
           $locationProvider.html5Mode(true);
         });

         function MainCntl($scope, $route, $routeParams, $location) {
           $scope.$route = $route;
           $scope.$location = $location;
           $scope.$routeParams = $routeParams;
         }

         function BookCntl($scope, $routeParams) {
           $scope.name = "BookCntl";
           $scope.params = $routeParams;
         }

         function ChapterCntl($scope, $routeParams) {
           $scope.name = "ChapterCntl";
           $scope.params = $routeParams;
         }
       </file>

       <file name="protractor.js" type="protractor">
         it('should load and compile correct template', function() {
           element(by.linkText('Moby: Ch1')).click();
           var content = element(by.css('[ng-view]')).getText();
           expect(content).toMatch(/controller\: ChapterCntl/);
           expect(content).toMatch(/Book Id\: Moby/);
           expect(content).toMatch(/Chapter Id\: 1/);

           element(by.partialLinkText('Scarlet')).click();

           content = element(by.css('[ng-view]')).getText();
           expect(content).toMatch(/controller\: BookCntl/);
           expect(content).toMatch(/Book Id\: Scarlet/);
         });
       </file>
     </example>
     */
        /**
     * @ngdoc event
     * @name $route#$routeChangeStart
     * @eventType broadcast on root scope
     * @description
     * Broadcasted before a route change. At this  point the route services starts
     * resolving all of the dependencies needed for the route change to occur.
     * Typically this involves fetching the view template as well as any dependencies
     * defined in `resolve` route property. Once  all of the dependencies are resolved
     * `$routeChangeSuccess` is fired.
     *
     * @param {Object} angularEvent Synthetic event object.
     * @param {Route} next Future route information.
     * @param {Route} current Current route information.
     */
        /**
     * @ngdoc event
     * @name $route#$routeChangeSuccess
     * @eventType broadcast on root scope
     * @description
     * Broadcasted after a route dependencies are resolved.
     * {@link ngRoute.directive:ngView ngView} listens for the directive
     * to instantiate the controller and render the view.
     *
     * @param {Object} angularEvent Synthetic event object.
     * @param {Route} current Current route information.
     * @param {Route|Undefined} previous Previous route information, or undefined if current is
     * first route entered.
     */
        /**
     * @ngdoc event
     * @name $route#$routeChangeError
     * @eventType broadcast on root scope
     * @description
     * Broadcasted if any of the resolve promises are rejected.
     *
     * @param {Object} angularEvent Synthetic event object
     * @param {Route} current Current route information.
     * @param {Route} previous Previous route information.
     * @param {Route} rejection Rejection of the promise. Usually the error of the failed promise.
     */
        /**
     * @ngdoc event
     * @name $route#$routeUpdate
     * @eventType broadcast on root scope
     * @description
     *
     * The `reloadOnSearch` property has been set to false, and we are reusing the same
     * instance of the Controller.
     */
        var forceReload = false, $route = {
            routes: routes,
            reload: function () {
              forceReload = true;
              $rootScope.$evalAsync(updateRoute);
            }
          };
        $rootScope.$on('$locationChangeSuccess', updateRoute);
        return $route;
        /////////////////////////////////////////////////////
        /**
     * @param on {string} current url
     * @param route {Object} route regexp to match the url against
     * @return {?Object}
     *
     * @description
     * Check if the route matches the current url.
     *
     * Inspired by match in
     * visionmedia/express/lib/router/router.js.
     */
        function switchRouteMatcher(on, route) {
          var keys = route.keys, params = {};
          if (!route.regexp)
            return null;
          var m = route.regexp.exec(on);
          if (!m)
            return null;
          for (var i = 1, len = m.length; i < len; ++i) {
            var key = keys[i - 1];
            var val = 'string' == typeof m[i] ? decodeURIComponent(m[i]) : m[i];
            if (key && val) {
              params[key.name] = val;
            }
          }
          return params;
        }
        function updateRoute() {
          var next = parseRoute(), last = $route.current;
          if (next && last && next.$$route === last.$$route && angular.equals(next.pathParams, last.pathParams) && !next.reloadOnSearch && !forceReload) {
            last.params = next.params;
            angular.copy(last.params, $routeParams);
            $rootScope.$broadcast('$routeUpdate', last);
          } else if (next || last) {
            forceReload = false;
            $rootScope.$broadcast('$routeChangeStart', next, last);
            $route.current = next;
            if (next) {
              if (next.redirectTo) {
                if (angular.isString(next.redirectTo)) {
                  $location.path(interpolate(next.redirectTo, next.params)).search(next.params).replace();
                } else {
                  $location.url(next.redirectTo(next.pathParams, $location.path(), $location.search())).replace();
                }
              }
            }
            $q.when(next).then(function () {
              if (next) {
                var locals = angular.extend({}, next.resolve), template, templateUrl;
                angular.forEach(locals, function (value, key) {
                  locals[key] = angular.isString(value) ? $injector.get(value) : $injector.invoke(value);
                });
                if (angular.isDefined(template = next.template)) {
                  if (angular.isFunction(template)) {
                    template = template(next.params);
                  }
                } else if (angular.isDefined(templateUrl = next.templateUrl)) {
                  if (angular.isFunction(templateUrl)) {
                    templateUrl = templateUrl(next.params);
                  }
                  templateUrl = $sce.getTrustedResourceUrl(templateUrl);
                  if (angular.isDefined(templateUrl)) {
                    next.loadedTemplateUrl = templateUrl;
                    template = $http.get(templateUrl, { cache: $templateCache }).then(function (response) {
                      return response.data;
                    });
                  }
                }
                if (angular.isDefined(template)) {
                  locals['$template'] = template;
                }
                return $q.all(locals);
              }
            }).then(function (locals) {
              if (next == $route.current) {
                if (next) {
                  next.locals = locals;
                  angular.copy(next.params, $routeParams);
                }
                $rootScope.$broadcast('$routeChangeSuccess', next, last);
              }
            }, function (error) {
              if (next == $route.current) {
                $rootScope.$broadcast('$routeChangeError', next, last, error);
              }
            });
          }
        }
        /**
     * @returns {Object} the current active route, by matching it against the URL
     */
        function parseRoute() {
          // Match a route
          var params, match;
          angular.forEach(routes, function (route, path) {
            if (!match && (params = switchRouteMatcher($location.path(), route))) {
              match = inherit(route, {
                params: angular.extend({}, $location.search(), params),
                pathParams: params
              });
              match.$$route = route;
            }
          });
          // No route matched; fallback to "otherwise" route
          return match || routes[null] && inherit(routes[null], {
            params: {},
            pathParams: {}
          });
        }
        /**
     * @returns {string} interpolation of the redirect path with the parameters
     */
        function interpolate(string, params) {
          var result = [];
          angular.forEach((string || '').split(':'), function (segment, i) {
            if (i === 0) {
              result.push(segment);
            } else {
              var segmentMatch = segment.match(/(\w+)(.*)/);
              var key = segmentMatch[1];
              result.push(params[key]);
              result.push(segmentMatch[2] || '');
              delete params[key];
            }
          });
          return result.join('');
        }
      }
    ];
  }
  ngRouteModule.provider('$routeParams', $RouteParamsProvider);
  /**
 * @ngdoc service
 * @name $routeParams
 * @requires $route
 *
 * @description
 * The `$routeParams` service allows you to retrieve the current set of route parameters.
 *
 * Requires the {@link ngRoute `ngRoute`} module to be installed.
 *
 * The route parameters are a combination of {@link ng.$location `$location`}'s
 * {@link ng.$location#search `search()`} and {@link ng.$location#path `path()`}.
 * The `path` parameters are extracted when the {@link ngRoute.$route `$route`} path is matched.
 *
 * In case of parameter name collision, `path` params take precedence over `search` params.
 *
 * The service guarantees that the identity of the `$routeParams` object will remain unchanged
 * (but its properties will likely change) even when a route change occurs.
 *
 * Note that the `$routeParams` are only updated *after* a route change completes successfully.
 * This means that you cannot rely on `$routeParams` being correct in route resolve functions.
 * Instead you can use `$route.current.params` to access the new route's parameters.
 *
 * @example
 * ```js
 *  // Given:
 *  // URL: http://server.com/index.html#/Chapter/1/Section/2?search=moby
 *  // Route: /Chapter/:chapterId/Section/:sectionId
 *  //
 *  // Then
 *  $routeParams ==> {chapterId:1, sectionId:2, search:'moby'}
 * ```
 */
  function $RouteParamsProvider() {
    this.$get = function () {
      return {};
    };
  }
  ngRouteModule.directive('ngView', ngViewFactory);
  ngRouteModule.directive('ngView', ngViewFillContentFactory);
  /**
 * @ngdoc directive
 * @name ngView
 * @restrict ECA
 *
 * @description
 * # Overview
 * `ngView` is a directive that complements the {@link ngRoute.$route $route} service by
 * including the rendered template of the current route into the main layout (`index.html`) file.
 * Every time the current route changes, the included view changes with it according to the
 * configuration of the `$route` service.
 *
 * Requires the {@link ngRoute `ngRoute`} module to be installed.
 *
 * @animations
 * enter - animation is used to bring new content into the browser.
 * leave - animation is used to animate existing content away.
 *
 * The enter and leave animation occur concurrently.
 *
 * @scope
 * @priority 400
 * @param {string=} onload Expression to evaluate whenever the view updates.
 *
 * @param {string=} autoscroll Whether `ngView` should call {@link ng.$anchorScroll
 *                  $anchorScroll} to scroll the viewport after the view is updated.
 *
 *                  - If the attribute is not set, disable scrolling.
 *                  - If the attribute is set without value, enable scrolling.
 *                  - Otherwise enable scrolling only if the `autoscroll` attribute value evaluated
 *                    as an expression yields a truthy value.
 * @example
    <example name="ngView-directive" module="ngViewExample"
             deps="angular-route.js;angular-animate.js"
             animations="true" fixBase="true">
      <file name="index.html">
        <div ng-controller="MainCtrl as main">
          Choose:
          <a href="Book/Moby">Moby</a> |
          <a href="Book/Moby/ch/1">Moby: Ch1</a> |
          <a href="Book/Gatsby">Gatsby</a> |
          <a href="Book/Gatsby/ch/4?key=value">Gatsby: Ch4</a> |
          <a href="Book/Scarlet">Scarlet Letter</a><br/>

          <div class="view-animate-container">
            <div ng-view class="view-animate"></div>
          </div>
          <hr />

          <pre>$location.path() = {{main.$location.path()}}</pre>
          <pre>$route.current.templateUrl = {{main.$route.current.templateUrl}}</pre>
          <pre>$route.current.params = {{main.$route.current.params}}</pre>
          <pre>$route.current.scope.name = {{main.$route.current.scope.name}}</pre>
          <pre>$routeParams = {{main.$routeParams}}</pre>
        </div>
      </file>

      <file name="book.html">
        <div>
          controller: {{book.name}}<br />
          Book Id: {{book.params.bookId}}<br />
        </div>
      </file>

      <file name="chapter.html">
        <div>
          controller: {{chapter.name}}<br />
          Book Id: {{chapter.params.bookId}}<br />
          Chapter Id: {{chapter.params.chapterId}}
        </div>
      </file>

      <file name="animations.css">
        .view-animate-container {
          position:relative;
          height:100px!important;
          position:relative;
          background:white;
          border:1px solid black;
          height:40px;
          overflow:hidden;
        }

        .view-animate {
          padding:10px;
        }

        .view-animate.ng-enter, .view-animate.ng-leave {
          -webkit-transition:all cubic-bezier(0.250, 0.460, 0.450, 0.940) 1.5s;
          transition:all cubic-bezier(0.250, 0.460, 0.450, 0.940) 1.5s;

          display:block;
          width:100%;
          border-left:1px solid black;

          position:absolute;
          top:0;
          left:0;
          right:0;
          bottom:0;
          padding:10px;
        }

        .view-animate.ng-enter {
          left:100%;
        }
        .view-animate.ng-enter.ng-enter-active {
          left:0;
        }
        .view-animate.ng-leave.ng-leave-active {
          left:-100%;
        }
      </file>

      <file name="script.js">
        angular.module('ngViewExample', ['ngRoute', 'ngAnimate'],
          function($routeProvider, $locationProvider) {
            $routeProvider.when('/Book/:bookId', {
              templateUrl: 'book.html',
              controller: BookCtrl,
              controllerAs: 'book'
            });
            $routeProvider.when('/Book/:bookId/ch/:chapterId', {
              templateUrl: 'chapter.html',
              controller: ChapterCtrl,
              controllerAs: 'chapter'
            });

            // configure html5 to get links working on jsfiddle
            $locationProvider.html5Mode(true);
        });

        function MainCtrl($route, $routeParams, $location) {
          this.$route = $route;
          this.$location = $location;
          this.$routeParams = $routeParams;
        }

        function BookCtrl($routeParams) {
          this.name = "BookCtrl";
          this.params = $routeParams;
        }

        function ChapterCtrl($routeParams) {
          this.name = "ChapterCtrl";
          this.params = $routeParams;
        }
      </file>

      <file name="protractor.js" type="protractor">
        it('should load and compile correct template', function() {
          element(by.linkText('Moby: Ch1')).click();
          var content = element(by.css('[ng-view]')).getText();
          expect(content).toMatch(/controller\: ChapterCtrl/);
          expect(content).toMatch(/Book Id\: Moby/);
          expect(content).toMatch(/Chapter Id\: 1/);

          element(by.partialLinkText('Scarlet')).click();

          content = element(by.css('[ng-view]')).getText();
          expect(content).toMatch(/controller\: BookCtrl/);
          expect(content).toMatch(/Book Id\: Scarlet/);
        });
      </file>
    </example>
 */
  /**
 * @ngdoc event
 * @name ngView#$viewContentLoaded
 * @eventType emit on the current ngView scope
 * @description
 * Emitted every time the ngView content is reloaded.
 */
  ngViewFactory.$inject = [
    '$route',
    '$anchorScroll',
    '$animate'
  ];
  function ngViewFactory($route, $anchorScroll, $animate) {
    return {
      restrict: 'ECA',
      terminal: true,
      priority: 400,
      transclude: 'element',
      link: function (scope, $element, attr, ctrl, $transclude) {
        var currentScope, currentElement, previousElement, autoScrollExp = attr.autoscroll, onloadExp = attr.onload || '';
        scope.$on('$routeChangeSuccess', update);
        update();
        function cleanupLastView() {
          if (previousElement) {
            previousElement.remove();
            previousElement = null;
          }
          if (currentScope) {
            currentScope.$destroy();
            currentScope = null;
          }
          if (currentElement) {
            $animate.leave(currentElement, function () {
              previousElement = null;
            });
            previousElement = currentElement;
            currentElement = null;
          }
        }
        function update() {
          var locals = $route.current && $route.current.locals, template = locals && locals.$template;
          if (angular.isDefined(template)) {
            var newScope = scope.$new();
            var current = $route.current;
            // Note: This will also link all children of ng-view that were contained in the original
            // html. If that content contains controllers, ... they could pollute/change the scope.
            // However, using ng-view on an element with additional content does not make sense...
            // Note: We can't remove them in the cloneAttchFn of $transclude as that
            // function is called before linking the content, which would apply child
            // directives to non existing elements.
            var clone = $transclude(newScope, function (clone) {
                $animate.enter(clone, null, currentElement || $element, function onNgViewEnter() {
                  if (angular.isDefined(autoScrollExp) && (!autoScrollExp || scope.$eval(autoScrollExp))) {
                    $anchorScroll();
                  }
                });
                cleanupLastView();
              });
            currentElement = clone;
            currentScope = current.scope = newScope;
            currentScope.$emit('$viewContentLoaded');
            currentScope.$eval(onloadExp);
          } else {
            cleanupLastView();
          }
        }
      }
    };
  }
  // This directive is called during the $transclude call of the first `ngView` directive.
  // It will replace and compile the content of the element with the loaded template.
  // We need this directive so that the element content is already filled when
  // the link function of another directive on the same element as ngView
  // is called.
  ngViewFillContentFactory.$inject = [
    '$compile',
    '$controller',
    '$route'
  ];
  function ngViewFillContentFactory($compile, $controller, $route) {
    return {
      restrict: 'ECA',
      priority: -400,
      link: function (scope, $element) {
        var current = $route.current, locals = current.locals;
        $element.html(locals.$template);
        var link = $compile($element.contents());
        if (current.controller) {
          locals.$scope = scope;
          var controller = $controller(current.controller, locals);
          if (current.controllerAs) {
            scope[current.controllerAs] = controller;
          }
          $element.data('$ngControllerController', controller);
          $element.children().data('$ngControllerController', controller);
        }
        link(scope);
      }
    };
  }
}(window, window.angular));
/**
 * @license AngularJS v1.2.15-build.2365+sha.d07101d
 * (c) 2010-2014 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function (window, angular, undefined) {
  'use strict';
  /**
 * @ngdoc module
 * @name ngTouch
 * @description
 *
 * # ngTouch
 *
 * The `ngTouch` module provides touch events and other helpers for touch-enabled devices.
 * The implementation is based on jQuery Mobile touch event handling
 * ([jquerymobile.com](http://jquerymobile.com/)).
 *
 *
 * See {@link ngTouch.$swipe `$swipe`} for usage.
 *
 * <div doc-module-components="ngTouch"></div>
 *
 */
  // define ngTouch module
  /* global -ngTouch */
  var ngTouch = angular.module('ngTouch', []);
  /* global ngTouch: false */
  /**
     * @ngdoc service
     * @name $swipe
     *
     * @description
     * The `$swipe` service is a service that abstracts the messier details of hold-and-drag swipe
     * behavior, to make implementing swipe-related directives more convenient.
     *
     * Requires the {@link ngTouch `ngTouch`} module to be installed.
     *
     * `$swipe` is used by the `ngSwipeLeft` and `ngSwipeRight` directives in `ngTouch`, and by
     * `ngCarousel` in a separate component.
     *
     * # Usage
     * The `$swipe` service is an object with a single method: `bind`. `bind` takes an element
     * which is to be watched for swipes, and an object with four handler functions. See the
     * documentation for `bind` below.
     */
  ngTouch.factory('$swipe', [function () {
      // The total distance in any direction before we make the call on swipe vs. scroll.
      var MOVE_BUFFER_RADIUS = 10;
      function getCoordinates(event) {
        var touches = event.touches && event.touches.length ? event.touches : [event];
        var e = event.changedTouches && event.changedTouches[0] || event.originalEvent && event.originalEvent.changedTouches && event.originalEvent.changedTouches[0] || touches[0].originalEvent || touches[0];
        return {
          x: e.clientX,
          y: e.clientY
        };
      }
      return {
        bind: function (element, eventHandlers) {
          // Absolute total movement, used to control swipe vs. scroll.
          var totalX, totalY;
          // Coordinates of the start position.
          var startCoords;
          // Last event's position.
          var lastPos;
          // Whether a swipe is active.
          var active = false;
          element.on('touchstart mousedown', function (event) {
            startCoords = getCoordinates(event);
            active = true;
            totalX = 0;
            totalY = 0;
            lastPos = startCoords;
            eventHandlers['start'] && eventHandlers['start'](startCoords, event);
          });
          element.on('touchcancel', function (event) {
            active = false;
            eventHandlers['cancel'] && eventHandlers['cancel'](event);
          });
          element.on('touchmove mousemove', function (event) {
            if (!active)
              return;
            // Android will send a touchcancel if it thinks we're starting to scroll.
            // So when the total distance (+ or - or both) exceeds 10px in either direction,
            // we either:
            // - On totalX > totalY, we send preventDefault() and treat this as a swipe.
            // - On totalY > totalX, we let the browser handle it as a scroll.
            if (!startCoords)
              return;
            var coords = getCoordinates(event);
            totalX += Math.abs(coords.x - lastPos.x);
            totalY += Math.abs(coords.y - lastPos.y);
            lastPos = coords;
            if (totalX < MOVE_BUFFER_RADIUS && totalY < MOVE_BUFFER_RADIUS) {
              return;
            }
            // One of totalX or totalY has exceeded the buffer, so decide on swipe vs. scroll.
            if (totalY > totalX) {
              // Allow native scrolling to take over.
              active = false;
              eventHandlers['cancel'] && eventHandlers['cancel'](event);
              return;
            } else {
              // Prevent the browser from scrolling.
              event.preventDefault();
              eventHandlers['move'] && eventHandlers['move'](coords, event);
            }
          });
          element.on('touchend mouseup', function (event) {
            if (!active)
              return;
            active = false;
            eventHandlers['end'] && eventHandlers['end'](getCoordinates(event), event);
          });
        }
      };
    }]);
  /* global ngTouch: false */
  /**
 * @ngdoc directive
 * @name ngClick
 *
 * @description
 * A more powerful replacement for the default ngClick designed to be used on touchscreen
 * devices. Most mobile browsers wait about 300ms after a tap-and-release before sending
 * the click event. This version handles them immediately, and then prevents the
 * following click event from propagating.
 *
 * Requires the {@link ngTouch `ngTouch`} module to be installed.
 *
 * This directive can fall back to using an ordinary click event, and so works on desktop
 * browsers as well as mobile.
 *
 * This directive also sets the CSS class `ng-click-active` while the element is being held
 * down (by a mouse click or touch) so you can restyle the depressed element if you wish.
 *
 * @element ANY
 * @param {expression} ngClick {@link guide/expression Expression} to evaluate
 * upon tap. (Event object is available as `$event`)
 *
 * @example
    <example>
      <file name="index.html">
        <button ng-click="count = count + 1" ng-init="count=0">
          Increment
        </button>
        count: {{ count }}
      </file>
    </example>
 */
  ngTouch.config([
    '$provide',
    function ($provide) {
      $provide.decorator('ngClickDirective', [
        '$delegate',
        function ($delegate) {
          // drop the default ngClick directive
          $delegate.shift();
          return $delegate;
        }
      ]);
    }
  ]);
  ngTouch.directive('ngClick', [
    '$parse',
    '$timeout',
    '$rootElement',
    function ($parse, $timeout, $rootElement) {
      var TAP_DURATION = 750;
      // Shorter than 750ms is a tap, longer is a taphold or drag.
      var MOVE_TOLERANCE = 12;
      // 12px seems to work in most mobile browsers.
      var PREVENT_DURATION = 2500;
      // 2.5 seconds maximum from preventGhostClick call to click
      var CLICKBUSTER_THRESHOLD = 25;
      // 25 pixels in any dimension is the limit for busting clicks.
      var ACTIVE_CLASS_NAME = 'ng-click-active';
      var lastPreventedTime;
      var touchCoordinates;
      // TAP EVENTS AND GHOST CLICKS
      //
      // Why tap events?
      // Mobile browsers detect a tap, then wait a moment (usually ~300ms) to see if you're
      // double-tapping, and then fire a click event.
      //
      // This delay sucks and makes mobile apps feel unresponsive.
      // So we detect touchstart, touchmove, touchcancel and touchend ourselves and determine when
      // the user has tapped on something.
      //
      // What happens when the browser then generates a click event?
      // The browser, of course, also detects the tap and fires a click after a delay. This results in
      // tapping/clicking twice. So we do "clickbusting" to prevent it.
      //
      // How does it work?
      // We attach global touchstart and click handlers, that run during the capture (early) phase.
      // So the sequence for a tap is:
      // - global touchstart: Sets an "allowable region" at the point touched.
      // - element's touchstart: Starts a touch
      // (- touchmove or touchcancel ends the touch, no click follows)
      // - element's touchend: Determines if the tap is valid (didn't move too far away, didn't hold
      //   too long) and fires the user's tap handler. The touchend also calls preventGhostClick().
      // - preventGhostClick() removes the allowable region the global touchstart created.
      // - The browser generates a click event.
      // - The global click handler catches the click, and checks whether it was in an allowable region.
      //     - If preventGhostClick was called, the region will have been removed, the click is busted.
      //     - If the region is still there, the click proceeds normally. Therefore clicks on links and
      //       other elements without ngTap on them work normally.
      //
      // This is an ugly, terrible hack!
      // Yeah, tell me about it. The alternatives are using the slow click events, or making our users
      // deal with the ghost clicks, so I consider this the least of evils. Fortunately Angular
      // encapsulates this ugly logic away from the user.
      //
      // Why not just put click handlers on the element?
      // We do that too, just to be sure. The problem is that the tap event might have caused the DOM
      // to change, so that the click fires in the same position but something else is there now. So
      // the handlers are global and care only about coordinates and not elements.
      // Checks if the coordinates are close enough to be within the region.
      function hit(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) < CLICKBUSTER_THRESHOLD && Math.abs(y1 - y2) < CLICKBUSTER_THRESHOLD;
      }
      // Checks a list of allowable regions against a click location.
      // Returns true if the click should be allowed.
      // Splices out the allowable region from the list after it has been used.
      function checkAllowableRegions(touchCoordinates, x, y) {
        for (var i = 0; i < touchCoordinates.length; i += 2) {
          if (hit(touchCoordinates[i], touchCoordinates[i + 1], x, y)) {
            touchCoordinates.splice(i, i + 2);
            return true;  // allowable region
          }
        }
        return false;  // No allowable region; bust it.
      }
      // Global click handler that prevents the click if it's in a bustable zone and preventGhostClick
      // was called recently.
      function onClick(event) {
        if (Date.now() - lastPreventedTime > PREVENT_DURATION) {
          return;  // Too old.
        }
        var touches = event.touches && event.touches.length ? event.touches : [event];
        var x = touches[0].clientX;
        var y = touches[0].clientY;
        // Work around desktop Webkit quirk where clicking a label will fire two clicks (on the label
        // and on the input element). Depending on the exact browser, this second click we don't want
        // to bust has either (0,0) or negative coordinates.
        if (x < 1 && y < 1) {
          return;  // offscreen
        }
        // Look for an allowable region containing this click.
        // If we find one, that means it was created by touchstart and not removed by
        // preventGhostClick, so we don't bust it.
        if (checkAllowableRegions(touchCoordinates, x, y)) {
          return;
        }
        // If we didn't find an allowable region, bust the click.
        event.stopPropagation();
        event.preventDefault();
        // Blur focused form elements
        event.target && event.target.blur();
      }
      // Global touchstart handler that creates an allowable region for a click event.
      // This allowable region can be removed by preventGhostClick if we want to bust it.
      function onTouchStart(event) {
        var touches = event.touches && event.touches.length ? event.touches : [event];
        var x = touches[0].clientX;
        var y = touches[0].clientY;
        touchCoordinates.push(x, y);
        $timeout(function () {
          // Remove the allowable region.
          for (var i = 0; i < touchCoordinates.length; i += 2) {
            if (touchCoordinates[i] == x && touchCoordinates[i + 1] == y) {
              touchCoordinates.splice(i, i + 2);
              return;
            }
          }
        }, PREVENT_DURATION, false);
      }
      // On the first call, attaches some event handlers. Then whenever it gets called, it creates a
      // zone around the touchstart where clicks will get busted.
      function preventGhostClick(x, y) {
        if (!touchCoordinates) {
          $rootElement[0].addEventListener('click', onClick, true);
          $rootElement[0].addEventListener('touchstart', onTouchStart, true);
          touchCoordinates = [];
        }
        lastPreventedTime = Date.now();
        checkAllowableRegions(touchCoordinates, x, y);
      }
      // Actual linking function.
      return function (scope, element, attr) {
        var clickHandler = $parse(attr.ngClick), tapping = false, tapElement,
          // Used to blur the element after a tap.
          startTime,
          // Used to check if the tap was held too long.
          touchStartX, touchStartY;
        function resetState() {
          tapping = false;
          element.removeClass(ACTIVE_CLASS_NAME);
        }
        element.on('touchstart', function (event) {
          tapping = true;
          tapElement = event.target ? event.target : event.srcElement;
          // IE uses srcElement.
          // Hack for Safari, which can target text nodes instead of containers.
          if (tapElement.nodeType == 3) {
            tapElement = tapElement.parentNode;
          }
          element.addClass(ACTIVE_CLASS_NAME);
          startTime = Date.now();
          var touches = event.touches && event.touches.length ? event.touches : [event];
          var e = touches[0].originalEvent || touches[0];
          touchStartX = e.clientX;
          touchStartY = e.clientY;
        });
        element.on('touchmove', function (event) {
          resetState();
        });
        element.on('touchcancel', function (event) {
          resetState();
        });
        element.on('touchend', function (event) {
          var diff = Date.now() - startTime;
          var touches = event.changedTouches && event.changedTouches.length ? event.changedTouches : event.touches && event.touches.length ? event.touches : [event];
          var e = touches[0].originalEvent || touches[0];
          var x = e.clientX;
          var y = e.clientY;
          var dist = Math.sqrt(Math.pow(x - touchStartX, 2) + Math.pow(y - touchStartY, 2));
          if (tapping && diff < TAP_DURATION && dist < MOVE_TOLERANCE) {
            // Call preventGhostClick so the clickbuster will catch the corresponding click.
            preventGhostClick(x, y);
            // Blur the focused element (the button, probably) before firing the callback.
            // This doesn't work perfectly on Android Chrome, but seems to work elsewhere.
            // I couldn't get anything to work reliably on Android Chrome.
            if (tapElement) {
              tapElement.blur();
            }
            if (!angular.isDefined(attr.disabled) || attr.disabled === false) {
              element.triggerHandler('click', [event]);
            }
          }
          resetState();
        });
        // Hack for iOS Safari's benefit. It goes searching for onclick handlers and is liable to click
        // something else nearby.
        element.onclick = function (event) {
        };
        // Actual click handler.
        // There are three different kinds of clicks, only two of which reach this point.
        // - On desktop browsers without touch events, their clicks will always come here.
        // - On mobile browsers, the simulated "fast" click will call this.
        // - But the browser's follow-up slow click will be "busted" before it reaches this handler.
        // Therefore it's safe to use this directive on both mobile and desktop.
        element.on('click', function (event, touchend) {
          scope.$apply(function () {
            clickHandler(scope, { $event: touchend || event });
          });
        });
        element.on('mousedown', function (event) {
          element.addClass(ACTIVE_CLASS_NAME);
        });
        element.on('mousemove mouseup', function (event) {
          element.removeClass(ACTIVE_CLASS_NAME);
        });
      };
    }
  ]);
  /* global ngTouch: false */
  /**
 * @ngdoc directive
 * @name ngSwipeLeft
 *
 * @description
 * Specify custom behavior when an element is swiped to the left on a touchscreen device.
 * A leftward swipe is a quick, right-to-left slide of the finger.
 * Though ngSwipeLeft is designed for touch-based devices, it will work with a mouse click and drag
 * too.
 *
 * Requires the {@link ngTouch `ngTouch`} module to be installed.
 *
 * @element ANY
 * @param {expression} ngSwipeLeft {@link guide/expression Expression} to evaluate
 * upon left swipe. (Event object is available as `$event`)
 *
 * @example
    <example>
      <file name="index.html">
        <div ng-show="!showActions" ng-swipe-left="showActions = true">
          Some list content, like an email in the inbox
        </div>
        <div ng-show="showActions" ng-swipe-right="showActions = false">
          <button ng-click="reply()">Reply</button>
          <button ng-click="delete()">Delete</button>
        </div>
      </file>
    </example>
 */
  /**
 * @ngdoc directive
 * @name ngSwipeRight
 *
 * @description
 * Specify custom behavior when an element is swiped to the right on a touchscreen device.
 * A rightward swipe is a quick, left-to-right slide of the finger.
 * Though ngSwipeRight is designed for touch-based devices, it will work with a mouse click and drag
 * too.
 *
 * Requires the {@link ngTouch `ngTouch`} module to be installed.
 *
 * @element ANY
 * @param {expression} ngSwipeRight {@link guide/expression Expression} to evaluate
 * upon right swipe. (Event object is available as `$event`)
 *
 * @example
    <example>
      <file name="index.html">
        <div ng-show="!showActions" ng-swipe-left="showActions = true">
          Some list content, like an email in the inbox
        </div>
        <div ng-show="showActions" ng-swipe-right="showActions = false">
          <button ng-click="reply()">Reply</button>
          <button ng-click="delete()">Delete</button>
        </div>
      </file>
    </example>
 */
  function makeSwipeDirective(directiveName, direction, eventName) {
    ngTouch.directive(directiveName, [
      '$parse',
      '$swipe',
      function ($parse, $swipe) {
        // The maximum vertical delta for a swipe should be less than 75px.
        var MAX_VERTICAL_DISTANCE = 75;
        // Vertical distance should not be more than a fraction of the horizontal distance.
        var MAX_VERTICAL_RATIO = 0.3;
        // At least a 30px lateral motion is necessary for a swipe.
        var MIN_HORIZONTAL_DISTANCE = 30;
        return function (scope, element, attr) {
          var swipeHandler = $parse(attr[directiveName]);
          var startCoords, valid;
          function validSwipe(coords) {
            // Check that it's within the coordinates.
            // Absolute vertical distance must be within tolerances.
            // Horizontal distance, we take the current X - the starting X.
            // This is negative for leftward swipes and positive for rightward swipes.
            // After multiplying by the direction (-1 for left, +1 for right), legal swipes
            // (ie. same direction as the directive wants) will have a positive delta and
            // illegal ones a negative delta.
            // Therefore this delta must be positive, and larger than the minimum.
            if (!startCoords)
              return false;
            var deltaY = Math.abs(coords.y - startCoords.y);
            var deltaX = (coords.x - startCoords.x) * direction;
            return valid && deltaY < MAX_VERTICAL_DISTANCE && deltaX > 0 && deltaX > MIN_HORIZONTAL_DISTANCE && deltaY / deltaX < MAX_VERTICAL_RATIO;
          }
          $swipe.bind(element, {
            'start': function (coords, event) {
              startCoords = coords;
              valid = true;
            },
            'cancel': function (event) {
              valid = false;
            },
            'end': function (coords, event) {
              if (validSwipe(coords)) {
                scope.$apply(function () {
                  element.triggerHandler(eventName);
                  swipeHandler(scope, { $event: event });
                });
              }
            }
          });
        };
      }
    ]);
  }
  // Left is negative X-coordinate, right is positive.
  makeSwipeDirective('ngSwipeLeft', -1, 'swipeleft');
  makeSwipeDirective('ngSwipeRight', 1, 'swiperight');
}(window, window.angular));