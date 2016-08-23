'use strict';

define([
    'angular',
    'angularRoute',
    'angularAnimate',
    'angularSanitize',
    'angularUib'
], function(angular, angularRoute) {
    angular.module('walletApp.services', []);
    angular.module('walletApp.directives', []);
    angular.module('walletApp.filters', []);
    angular.module('walletApp.controllers', ['ngRoute', 'ui.bootstrap', 'ngAnimate', 'ngSanitize', 'walletApp.filters']);
    angular.module('walletApp', ['ngRoute', 'walletApp.controllers', 'walletApp.services', 'walletApp.directives']);

    Storage.prototype.setObject = function setObject(key, value) {
        this.setItem(key, JSON.stringify(value));
        // backward compatibility
        this.removeItem('ngStorage-' + key);
    };

    Storage.prototype.getObject = function getObject(key) {
        var value = this.getItem(key);
        if (!value) {
            // backward compatibility
            value = this.getItem('ngStorage-' + key);
        }
        return value && JSON.parse(value);
    };

    Storage.prototype.setDefault = function(key, obj) {
        if (! this.getObject(key)) {
            this.setObject(key, obj);
        }
    };

    return angular;
});
