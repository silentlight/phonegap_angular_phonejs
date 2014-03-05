'use strict';
angular.module('chaiApp', [
  'ngResource',
  'ngRoute',
  'ngTouch',
  'fsCordova',
  'dx'
]).config([
  '$routeProvider',
  function ($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    }).when('/path-to-insight', {
      templateUrl: 'views/path_to_insight.html',
      controller: 'PathToInsightCtrl'
    }).otherwise({ redirectTo: '/' });
  }
]);
'use strict';
angular.module('chaiApp').controller('MainCtrl', [
  '$scope',
  '$location',
  'CordovaService',
  function ($scope, $location, CordovaService) {
    $scope.buttonOptions = {
      text: 'Button',
      clickAction: function () {
        $location.path('/path-to-insight');
      }
    };
    CordovaService.ready.then(function () {
      $scope.libs.push('Cordova');
    });
  }
]).$inject = [
  '$scope',
  '$location',
  'CordovaService'
];
'use strict';
angular.module('chaiApp').controller('PathToInsightCtrl', [
  '$scope',
  'CordovaService',
  function ($scope, CordovaService) {
    $scope.categories = [
      { name: 'Relationships' },
      { name: 'Self' },
      { name: 'Mental/Emotional' },
      { name: 'Money' },
      { name: 'Wild' }
    ];
    CordovaService.ready.then(function () {
    });
  }
]);
'use strict';
angular.module('fsCordova', []).service('CordovaService', [
  '$document',
  '$q',
  function ($document, $q) {
    var d = $q.defer(), resolved = false;
    var self = this;
    this.ready = d.promise;
    document.addEventListener('deviceready', function () {
      resolved = true;
      d.resolve(window.cordova);
    });
    // Check to make sure we didn't miss the 
    // event (just in case)
    setTimeout(function () {
      if (!resolved) {
        if (window.cordova)
          d.resolve(window.cordova);
      }
    }, 3000);
  }
]);