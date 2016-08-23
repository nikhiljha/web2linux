'use strict';

define([
    'definitions',
	'angular',
	'angularRoute',
	'controllers/login',
	'controllers/wallet'
], function(_, angular, angularRoute, loginView, walletView) {
    var app = angular.module('walletApp');

    app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(false).hashPrefix('!');

        $routeProvider
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl',
                controllerAs: 'loginCtrl'
            })
            .when('/wallet/:walletName', {
                templateUrl: 'views/wallet.html',
                controller: 'WalletCtrl',
                controllerAs: 'walletCtrl'
            })
            .otherwise({redirectTo: '/login'});
    }]);

    return app;
});
