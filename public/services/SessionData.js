'use strict';

define([
    'definitions',
], function(angular) {
    angular.module('walletApp.services').service('sessionData', [function() {
        var networkId = undefined;
        var nisPort = 0;
        var rememberedKey = undefined;
        var nisNode = undefined;
        return {
            setNetworkId: function setNetworkId(id) {
                networkId = id;
            },
            getNetworkId: function getNetworkId() {
                return networkId;
            },
            setNode: function setNode(node) {
                nisNode = node;
            },
            getNode: function getNode() {
                return nisNode;
            },
            setNisPort: function setNisPort(port) {
                nisPort = port;
            },
            getNisPort: function getNisPort() {
                return nisPort;
            },
            setRememberedKey: function setRememberedKey(data) {
                rememberedKey = data
            },
            getRememberedKey: function getRememberedKey() {
                return rememberedKey;
            }
        };
    }])
});
