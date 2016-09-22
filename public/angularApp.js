//angular stuffs


var app = angular.module("ssadevhelp", ["ngRoute"]);

app.config(function($routeProvider) {
    $routeProvider.when("/Friends", {
        templateUrl : "static/Templates/friends.html"
    }).when("/", {
        templateUrl: "static/Templates/feed.html"
    }).when("/insertQuestion/", {
        templateUrl: "static/Templates/insertQuestion.html"
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

app.controller('FeedController', function ($scope, $location) 
{ 
$http.get("/getQuestions/", {cache: false}).success(function(response) {
            // location = location.origin + "/";
            //console.log($scope.userName);
            $scope.questions = response.data;
         });     
});

app.controller('insertQuestionController', function ($scope, $location) 
{ 
$http.post("/insertQuestion/").success(function(response) {
            // location = location.origin + "/";
            //console.log($scope.userName);
            $scope.question = response.data;
         });      
});