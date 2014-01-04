'use strict';
var client_id = "52c2e979dbc461f41b000002";

var application = angular.module('hobout', []);

application.controller('demoCtrl', function($scope, $location, $http) {

    $scope.setToken = function(token){
        var data = JSON.parse(localStorage.getItem('hobout_data')) || {};
        data.token = token;
        localStorage.setItem('hobout_data', JSON.stringify(data));
        $scope.token = token;
        $http.defaults.headers.common['Authorization'] = "Bearer " + $scope.token;
    };

    $scope.signup = function(user){
        user.client_id = client_id;
        $http.post('/users', user).success(function(data){
            if(data.status === "success"){
                $scope.signin({username: user.email, password: user.password});
            }
        });
    };

    $scope.signin = function(user){

        user.client_id = client_id;
        user.grant_type = 'password';
        $http.post('/auth/mtoken', user)
            .success(function(data){
                console.dir(data);
                $scope.setToken(data.access_token);
                $scope.page = 'data';

            })
            .error(function(err){
                console.dir(err);
            });

    }

    $scope.setPage = function(page){
        $scope.page = page;
    }

    window.assignHoboutToken = function(token){

        $scope.$apply(function(){
            $scope.setToken(token);
            $scope.page = "data";
        });

    };

    $scope.loginFb = function(){

        function popupwindow(url, title, width, height) {
            var left = (screen.width/2)-(width/2);
            var top = (screen.height/2)-(height/2);
            return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+width+', height='+height+', top='+top+', left='+left);
        };

        var popup = popupwindow('/auth/facebook', 'SignIn', 500, 300);
        popup.focus();
        return false;

    };

    $scope.data = "You successfully login to the system! Congratulations!"

    $scope.requestUserData = function(url){

        $http.get(url)
            .success(function(data){$scope.data = data.data})
            .error(function(){console.log("Error occurred =("); console.dir(arguments)});

    }

    initFromLS($scope);
    window.onunload = function(){
        //saveToLS($scope);
    }
});


function initFromLS($scope){

    var data = JSON.parse(localStorage.getItem('hobout_data'));
    if(data && data.token){
        $scope.page = data.page || 'data';
        $scope.token = data.token;
    }

};

function saveToLS($scope){

    var data = {token: $scope.token, page: $scope.page};
    localStorage.setItem('hobout_data', JSON.stringify(data));

};


