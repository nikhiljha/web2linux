'use strict';

define([
    'definitions',
    'jquery',
    'utils/CryptoHelpers',
    'sinks',

    'filters/filters',
    'services/Transactions'
], function(angular, $, CryptoHelpers, sinks) {
    var mod = angular.module('walletApp.controllers');

    mod.controller('TxNamespaceCtrl',
        ["$scope", "$window", "$q", "$timeout", "Transactions", 'walletScope',
        function($scope, $window, $q, $timeout, Transactions, walletScope) {
            $scope.walletScope = walletScope;
            $scope.storage = $window.localStorage;
            $scope.storage.setDefault('txNamespaceDefaults', {});

            // begin tracking currently selected account
            $scope._updateCurrentAccount = function() {
                var acct = $scope.walletScope.accountData.account.address
                if ($scope.txNamespaceData.isMultisig) {
                    acct = $scope.txNamespaceData.multisigAccount.address;
                }
                $scope.currentAccount = acct;
            };

            $scope.selectTab = function selectTab(v) {
                if (v === 'multisig') {
                    $scope.txNamespaceData.isMultisig = true;
                } else {
                    $scope.txNamespaceData.isMultisig = false;
                }
                $scope._updateCurrentAccount();
            };
            // end begin tracking currently selected account

            // load data from storage
            $scope.common = {
                'requiresKey': $scope.walletScope.sessionData.getRememberedKey() === undefined,
                'password': '',
                'privatekey': '',
            };
            $scope.txNamespaceData = {
                'rentalFeeSink': '',
                'rentalFee': 0,
                'namespaceName': '',
                'namespaceParent': null,
                'fee': 0,
                'innerFee': 0,
                'due': $scope.storage.getObject('txNamespaceDefaults').due || 60,
                'isMultisig': ($scope.storage.getObject('txNamespaceDefaults').isMultisig  && walletScope.accountData.meta.cosignatoryOf.length > 0) || false,
                'multisigAccount': walletScope.accountData.meta.cosignatoryOf.length == 0?'':walletScope.accountData.meta.cosignatoryOf[0]
            };
            $scope.txNamespaceData.rentalFeeSink = sinks.namespace[$scope.walletScope.networkId];

            $scope.namespaceLevel3 = function(elem) {
                return elem.fqn.split('.').length < 3
            };

            function updateFee() {
                var entity = Transactions.prepareNamespace($scope.common, $scope.txNamespaceData);
                $scope.txNamespaceData.fee = entity.fee;
                if ($scope.txNamespaceData.isMultisig) {
                    $scope.txNamespaceData.innerFee = entity.otherTrans.fee;
                }
            }

            $scope.$watchGroup(['txNamespaceData.namespaceName', 'txNamespaceData.namespaceParent', 'txNamespaceData.isMultisig'], function(nv, ov){
                updateFee();
            });
            $scope.$watchGroup(['common.password', 'common.privatekey'], function(nv,ov){
                $scope.invalidKeyOrPassword = false;
            });
            $scope.$watch('txNamespaceData.namespaceParent', function(nv, ov){
                if ($scope.txNamespaceData.namespaceParent) {
                    $scope.txNamespaceData.rentalFee = 5000 * 1000000;
                } else {
                    $scope.txNamespaceData.rentalFee = 50000 * 1000000;
                }
            });

            $scope._updateCurrentAccount();

            $scope.okPressed = false;
            $scope.ok = function txNamespaceOk() {
                $scope.okPressed = true;
                $timeout(function txNamespaceDeferred(){
                    $scope._ok().then(function(){
                        $scope.okPressed = false;
                    }, function(){ 
                        $scope.okPressed = false;
                    });
                });
            };
            $scope._ok = function txNamespace_Ok() {
                var orig = $scope.storage.getObject('txNamespaceDefaults');
                $.extend(orig, {
                    'due': $scope.txNamespaceData.due,
                    'isMultisig': $scope.txNamespaceData.isMultisig,
                });
                $scope.storage.setObject('txNamespaceDefaults', orig);

                var rememberedKey = $scope.walletScope.sessionData.getRememberedKey();
                if (rememberedKey) {
                    $scope.common.privatekey = CryptoHelpers.decrypt(rememberedKey);
                } else {
                    if (! CryptoHelpers.passwordToPrivatekey($scope.common, $scope.walletScope.networkId, $scope.walletScope.walletAccount) ) {
                        $scope.invalidKeyOrPassword = true;
                        return $q.resolve(0);
                    }
                }
                var entity = Transactions.prepareNamespace($scope.common, $scope.txNamespaceData);
                return Transactions.serializeAndAnnounceTransaction(entity, $scope.common, $scope.txNamespaceData, $scope.walletScope.nisPort,
                    function(data) {
                        if (data.status === 200) {
                            if (data.data.code >= 2) {
                                alert('failed when trying to send tx: ' + data.data.message);
                            } else {
                                $scope.$close();
                            }
                        }
                        if (rememberedKey) { delete $scope.common.privatekey; }
                    },
                    function(operation, data) {
                        // will do for now, will change it to modal later
                        alert('failed at '+operation + " " + data.data.error + " " + data.data.message);
                        if (rememberedKey) { delete $scope.common.privatekey; }
                    }
                );
            }; // $scope._ok

            $scope.cancel = function () {
                $scope.$dismiss();
            };
        }
    ]);
});
