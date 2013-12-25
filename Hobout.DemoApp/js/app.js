'use strict';

var application = angular.module('hobout', []);

application.controller('demoCtrl', function($scope, $location) {
    var query = $location.search();
    $scope.login = function(user){
        console.log(user);
    };

    $scope.loginFb = function(){
        var url = location.origin + '/auth/facebook';
        location.href = url;
    };

    $scope.loginSuccess = query.login || false;
    $scope.data = "You successfully login to the system! Congratulations!"
});


