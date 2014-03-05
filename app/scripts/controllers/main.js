'use strict';

angular.module('chaiApp')
  .controller('MainCtrl', function ($scope, $location, CordovaService) {
    $scope.buttonOptions = {
		text: 'Button',
		clickAction: function() {
			$location.path('/path-to-insight')
		}
	}
	
    CordovaService.ready.then(function() {
		$scope.libs.push("Cordova");
    });
    
  }).$inject = ["$scope", "$location", "CordovaService"];

