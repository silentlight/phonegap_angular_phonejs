'use strict';

angular.module('chaiApp')
  .controller('MainCtrl', function ($scope, CordovaService) {
    $scope.libs = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    
    CordovaService.ready.then(function() {
		$scope.libs.push("Cordova");
    });
  });
