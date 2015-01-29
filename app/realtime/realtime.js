'use strict';

angular.module('cloudparty.realtime', ['ngRoute', 'cr.aws'])

.config(['$routeProvider', 'crAwsProvider', function($routeProvider, crAwsProvider) {
  $routeProvider.when('/realtime', {
    templateUrl: 'realtime/realtime.html',
    controller: 'RealtimeCtrl'
  });


  crAwsProvider.setCognito({
   AccountId: '728936874646',
   IdentityPoolId: 'eu-west-1:716e19a5-32f0-47b6-8e36-86f2ba1f1d9f',
   RoleArnUnauth: 'arn:aws:iam::728936874646:role/Cognito_cloudappUnauth_DefaultRole',
   RoleArnAuth: 'arn:aws:iam::728936874646:role/Cognito_cloudappAuth_DefaultRole'
 });



}])


.controller('RealtimeCtrl', ['$rootScope', '$scope', '$http', 'config', 'crAws', 'crAwsCognitoService', function($rootScope, $scope, $http, config, crAws, crAwsCognitoService) {

  $scope.myBeers = [];
  $scope.dbBeers = [];
  $scope.identityId = false;
  console.log("xyz", crAws.cognito);

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

            dataset.get("beers").then(function(result) {
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



  $scope.star = function(index) {
    $scope.myBeers[index].starred = true;
    $scope.syncMyBeers();
  };
  $scope.unStar = function(index) {
    $scope.myBeers[index].starred = false;
    $scope.syncMyBeers();
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
