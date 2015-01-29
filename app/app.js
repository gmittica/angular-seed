'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.view1',
  'cloudparty.realtime',
  'myApp.version',
  'cr.aws'
])

.value("config", {
  google: {
     "clientId":"144948772400-hq98sgltijaqmguf8nuukt5pdnas33ss"
  }
})
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
