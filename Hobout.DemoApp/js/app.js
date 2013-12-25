'use strict';

var application = angular.module('hobout', []);

application.controller('demoCtrl', function($scope, $location, $http) {
    var query = $location.search();
    $scope.login = function(user){
        console.log(user);
    };

    $scope.loginFb = function(){
        var url = location.origin + '/auth/facebook';
        location.href = url;
    };

    $scope.loginSuccess = query.login || false;
    $scope.token = query.code;
    $scope.data = "You successfully login to the system! Congratulations!"
    $http.defaults.headers.common['Authorization'] = "Bearer " + $scope.token;

    $scope.requestUserData = function(url){
        $http.get(url)
            .success(function(data){$scope.data = data.data})
            .error(function(){console.log("Error occurred =("); console.dir(arguments)});
    }
});


