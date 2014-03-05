'use strict';

angular.module('chaiApp', [
  'ngResource',
  'ngRoute',
  'ngTouch',
  'fsCordova',
  'dx'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/path-to-insight', {
        templateUrl: 'views/path_to_insight.html',
        controller: 'PathToInsightCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
