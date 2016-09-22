//angular stuffs


var app = angular.module("ssadevhelp", ["ngRoute"]);

app.config(function ($routeProvider) {
    $routeProvider.when("/Friends", {
        templateUrl: "static/Templates/friends.html"
    }).when("/", {
        templateUrl: "static/Templates/feed.html"
    }).otherwise({
        templateUrl: 'static/Templates/feed.html'
    });
});

app.controller('SSADevHelpCtrl', function ($scope, $http) {
    $scope.getPictures = function () {
        var userObj = {
            "userName": $scope.userName,
            "password": $scope.password
        };
        $http.post("/login/", userObj, { cache: false }).then(function (response) {
            location = location.origin + "/";
        });
    };

    $scope.registerUser = function () {
        var userObj = {
            userName: $scope.userName,
            password: $scope.password,
            profileName: $scope.profileName
        };
        $http.post("/insertUser/", userObj).then(function (response) {
            window.location = "/#/";
        }, function (error) {
            console.log(error);
            alert(error.data.errmsg);
        });
    }
});

app.controller('NavController', function ($scope, $location, $http) {
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    $scope.logout = function (){
        $http.post("/logout/");
    }
});

