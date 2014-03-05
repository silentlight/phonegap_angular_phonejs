'use strict';

angular.module('chaiApp')
  .controller('PathToInsightCtrl', function ($scope, CordovaService) {
	
	$scope.categories = [
		{
			name: "Relationships"
		},
		{
			name: "Self"
		},
		{
			name: "Mental/Emotional"
		},
		{
			name: "Money"
		},
		{
			name: "Wild"
		}
	];    
	
    CordovaService.ready.then(function() {
    	//
    });
  });
