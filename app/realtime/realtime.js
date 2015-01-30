'use strict';

angular.module('cloudparty.realtime', ['ngRoute', 'cr.aws', 'pusher-angular'])

.config(['$routeProvider', 'crAwsProvider', function($routeProvider, crAwsProvider) {
  $routeProvider.when('/realtime', {
    templateUrl: 'realtime/realtime.html',
    controller: 'RealtimeCtrl'
  });




}])


.controller('RealtimeCtrl', ['$rootScope', '$scope', '$http', 'config', 'crAws', 'crAwsCognitoService', '$pusher', function($rootScope, $scope, $http, config, crAws, crAwsCognitoService, $pusher) {

  $scope.myBeers = [];
  $scope.dbBeers = [];
  $scope.identityId = false;

  $http.get("http://s3-eu-west-1.amazonaws.com/cloudapp-bucket/beers.json").then(function(response) {
    $scope.dbBeers = response.data;
  });

/*
  crAws.cognito.getSync("stars").then(function(dataset){
    dataset.get("beers").then(function(result) {
      if(result) {
        $scope.myBeers = result;
      }
    });
  });*/

  $scope.getMyBeers = function() {
	  
      crAws.cognito.getSync("favourite").then(function(dataset){
        dataset.sync({
          onSuccess: function(datasetRemote, newRecords) {
        	  console.log("success");
            dataset.get("beers").then(function(result) {
          	  console.log("success2", result);
              if(result){
                $scope.myBeers = result;
              }
              else {
                $scope.myBeers = $scope.dbBeers;
              }
            });
          },
          onConflict: function(datasetRemote, conflicts, callback) {
            var resolved = [];
            for (var i=0; i<conflicts.length; i++) {
               // Take remote version.
               resolved.push(conflicts[i].resolveWithRemoteRecord());
            }
            datasetRemote.resolve(resolved, function() {
               return callback(true);
            });
          }
        });
      });
  };

  $scope.syncMyBeers = function() {
    crAws.cognito.getSync("favourite").then(function(dataset){
      dataset.set("beers", $scope.myBeers).then(function(result) {
        dataset.sync({
          onSuccess: function(dataset, newRecords) {
          },
          onFailure: function(err) {
          },
          onConflict: function(datasetRemote, conflicts, callback) {
            var resolved = [];
            for (var i=0; i<conflicts.length; i++) {
               // take local version.
               resolved.push(conflicts[i].resolveWithLocalRecord());
            }
            datasetRemote.resolve(resolved, function() {
               return callback(true);
            });

          }
        });
      });
    });
  };
  
  
  $scope.stream = [];
  $scope.$on('new-post', function(event, data) {
	  $scope.stream.push(data);
	  console.log(data.user, $scope.identityId);
	  if(data.user == $scope.identityId) {
		  $scope.getMyBeers();
	  }
  });
  



  $scope.changeBeer = function(index) {
    $scope.myBeers[index].starred = !$scope.myBeers[index].starred;
    $scope.syncMyBeers();
    $rootScope.$broadcast('beer-changed', {user: $scope.identityId, data: $scope.myBeers[index]});
  };




  $rootScope.$on('auth:login:success', function(event, data) {
    if(data.provider == "cognito" && data.auth.getIdentityId()) {
      $scope.identityId = data.auth.getIdentityId();
	  $scope.getMyBeers();
    }
  });


  $scope.googleId = config.google.clientId;
  // $rootScope.signinCallback = function(auth) {
  //   $rootScope.$broadcast('auth:login:success',{'provider': 'google', 'auth': auth});
  // }





}]);
