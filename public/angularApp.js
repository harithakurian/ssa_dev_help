//angular stuffs


var app = angular.module("ssadevhelp", ["ngRoute"]);

app.config(function($routeProvider) {
    $routeProvider.when("/Friends", {
        templateUrl : "static/Templates/friends.html"
    }).when("/", {
        templateUrl: "static/Templates/feed.html"
    }).otherwise({
        templateUrl: 'static/Templates/feed.html'
    });
});
        
app.controller('SSADevHelpCtrl', function ($scope, $http) {
    $scope.getPictures = function(){
    var userObj = {
            "userName": $scope.userName,
            "password": $scope.password
        };
        $http.post("/login/", userObj, {cache: false}).then(function(response) {
            location = location.origin + "/";
            //console.log($scope.userName);
            //$scope.pictures = response.data;
        });
    };
});

app.controller('NavController', function ($scope, $location) 
{ 
    $scope.isActive = function (viewLocation) { 
        return viewLocation === $location.path();
    };
});

