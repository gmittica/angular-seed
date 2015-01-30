'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.view1',
  'cloudparty.realtime',
  'myApp.version',
  'cr.aws',
  'pusher-angular'
])
.config(['crAwsProvider', function config(crAwsProvider){
	  crAwsProvider.setCognito({
	   AccountId: '728936874646',
	   IdentityPoolId: 'eu-west-1:716e19a5-32f0-47b6-8e36-86f2ba1f1d9f',
	   RoleArnUnauth: 'arn:aws:iam::728936874646:role/Cognito_cloudappUnauth_DefaultRole',
	   RoleArnAuth: 'arn:aws:iam::728936874646:role/Cognito_cloudappAuth_DefaultRole'
	 });

}])
.value("config", {
  google: {
     "clientId":"144948772400-hq98sgltijaqmguf8nuukt5pdnas33ss"
  },
  pusher: {
	  "appKey": "fa94738e3991c672c0e3",
	  "channel": "private-beer-stream",
	  "authEndpoint": "http://local.git/php-pusher-test/public/auth.php"
  }
})
.run(['$rootScope', '$pusher', 'config', function run($rootScope, $pusher, config){
	//start pusher client
	var client = new Pusher(config.pusher.appKey, { authEndpoint: config.pusher.authEndpoint });
	window.pusher = $pusher(client);
	//subscribe to private channel  
	window.pusherChannel = window.pusher.subscribe(config.pusher.channel);
	//waiting for events  
	window.pusher.bind('client-new-post', function(data) {
		$rootScope.$broadcast('new-post', data);
	});
	//trigger events after local event binding
	window.pusherChannel.bind('pusher:subscription_succeeded', function() {
		$rootScope.$on('beer-changed', function(event, data) {
		window.pusherChannel.trigger('client-new-post', data);
	});
});
  
  
  
  
}])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
