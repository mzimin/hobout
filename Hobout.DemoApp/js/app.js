'use strict';

var application = angular.module('hobout', []);

application.controller('loginCtrl', function($scope, $http) {
    $scope.login = function(user){
        console.log(user);
    };

    $scope.loginFb = function(){
            $http.jsonp('/auth/facebook')
            .success(function(data){
                console.log(data.found);
            });
    };

});

