'use strict';

define([
    'definitions',
    'jquery',
    'utils/CryptoHelpers',
    'utils/Address',

    'filters/filters',
    'services/Transactions'
], function(angular, $, CryptoHelpers, Address) {
    var mod = angular.module('walletApp.controllers');

    mod.controller('TxTransferCtrl',
        ["$scope", "$window", "$http", "$q", "$timeout", "Transactions", 'walletScope',
        function($scope, $window, $http, $q, $timeout, Transactions, walletScope) {
            $scope.walletScope = walletScope;
            $scope.encryptDisabled = false;
            $scope.storage = $window.localStorage;
            $scope.storage.setDefault('txTransferDefaults', {});

            // load data from storage
            $scope.common = {
                'requiresKey': $scope.walletScope.sessionData.getRememberedKey() === undefined,
                'password': '',
                'privatekey': '',
            };
            $scope.txTransferData = {
                'recipient': $scope.storage.getObject('txTransferDefaults').recipient || '',
                'amount': $scope.storage.getObject('txTransferDefaults').amount,
                'fee': $scope.storage.getObject('txTransferDefaults').fee || 0,
                'innerFee': 0,
                'due': $scope.storage.getObject('txTransferDefaults').due || 60,
                'message': $scope.storage.getObject('txTransferDefaults').message || '',
                'encryptMessage': $scope.storage.getObject('txTransferDefaults').encryptMessage || false,
                'isMultisig': ($scope.storage.getObject('txTransferDefaults').isMultisig && walletScope.accountData.meta.cosignatoryOf.length > 0) || false,
                'multisigAccount': walletScope.accountData.meta.cosignatoryOf.length == 0?'':walletScope.accountData.meta.cosignatoryOf[0]
            };

            function updateFee() {
                var entity = Transactions.prepareTransfer($scope.common, $scope.txTransferData);
                $scope.txTransferData.fee = entity.fee;
                if ($scope.txTransferData.isMultisig) {
                    $scope.txTransferData.innerFee = entity.otherTrans.fee;
                }
            }

            $scope.$watchGroup(['txTransferData.amount', 'txTransferData.message', 'txTransferData.isMultisig'], function(nv, ov){
                updateFee();
                if ($scope.txTransferData.isMultisig) {
                    $scope.txTransferData.encryptMessage = false;
                    $scope.encryptDisabled = true;
                } else {
                    $scope.encryptDisabled = false;
                }
            });

            $scope.$watchGroup(['common.password', 'common.privatekey'], function(nv,ov){
                $scope.invalidKeyOrPassword = false;
            });

            $scope.recipientCache = {};
            $scope.$watch('txTransferData.recipient', function(nv, ov){
                if (! nv) {
                    return;
                }

                var recipientAddress = nv.toUpperCase().replace(/-/g, '');
                var nisPort = $scope.walletScope.nisPort;
                var obj = {'params':{'address':recipientAddress}};
                if (! (recipientAddress in $scope.recipientCache)) {
                    var _uriParser = document.createElement('a');
                    _uriParser.href = $scope.walletScope.sessionData.getNode().uri;
                    if (Address.isFromNetwork(recipientAddress, $scope.walletScope.networkId)) {
                        console.log(recipientAddress, $scope.walletScope.networkId);
                        $http.get('http://'+_uriParser.hostname+':'+nisPort+'/account/get', obj).then(function (data){
                            $scope.recipientCache[recipientAddress] = data.data.account.publicKey;
                        });
                    }
                }
            });
            $scope.okPressed = false;
            $scope.ok = function txTransferOk() {
                $scope.okPressed = true;
                $timeout(function txTransferDeferred(){
                    $scope._ok().then(function(){
                        $scope.okPressed = false;
                    }, function(){ 
                        $scope.okPressed = false;
                    });
                }); // timeout 
            };
            $scope._ok = function txTransfer_Ok() {
                // save most recent data
                // BUG: tx data is saved globally not per wallet...
                var orig = $scope.storage.getObject('txTransferDefaults');
                $.extend(orig, {
                    'recipient':$scope.txTransferData.recipient,
                    'amount':$scope.txTransferData.amount,
                    'fee':$scope.txTransferData.fee,
                    'due':$scope.txTransferData.due,
                    'message':$scope.txTransferData.message,
                    'encryptMessage':$scope.txTransferData.encryptMessage,
                    'isMultisig':$scope.txTransferData.isMultisig,
                });
                $scope.storage.setObject('txTransferDefaults', orig);

                var recipientAddress = $scope.txTransferData.recipient.toUpperCase().replace(/-/g, '');
                $scope.txTransferData.recipientPubKey = $scope.recipientCache[recipientAddress];
                if ($scope.txTransferData.encryptMessage && !$scope.txTransferData.recipientPubKey) {
                    return $scope.walletScope.displayWarning("Encrypted message selected, but couldn't find public key of a recipient");
                }

                var rememberedKey = $scope.walletScope.sessionData.getRememberedKey();
                if (rememberedKey) {
                    $scope.common.privatekey = CryptoHelpers.decrypt(rememberedKey);
                } else {
                    if (! CryptoHelpers.passwordToPrivatekey($scope.common, $scope.walletScope.networkId, $scope.walletScope.walletAccount) ) {
                        $scope.invalidKeyOrPassword = true;
                        return $q.resolve(0);
                    }
                }

                var entity = Transactions.prepareTransfer($scope.common, $scope.txTransferData);
                return Transactions.serializeAndAnnounceTransaction(entity, $scope.common, $scope.txTransferData, $scope.walletScope.nisPort,
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
