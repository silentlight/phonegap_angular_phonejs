'use strict';

angular.module('chaiApp', [
  'ngResource',
  'ngRoute',
  'ngTouch',
  'fsCordova'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
