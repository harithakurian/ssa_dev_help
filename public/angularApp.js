//angular stuffs


var app = angular.module("ssadevhelp", ["ngRoute"]);

function chunk(arr, size) {
    var newArr = [];
    for (var i=0; i<arr.length; i+=size) {
        newArr.push(arr.slice(i, i+size));
    }
    return newArr;
}

app.config(function ($routeProvider) {
    $routeProvider.when("/ViewAllQuestions", {
        templateUrl: "static/Templates/viewAllQuestions.html"
    }).when("/InsertQuestion", {
        templateUrl: "static/Templates/insertQuestion.html"
    }).when("/view-question/:questionId", {
        templateUrl: "static/Templates/view-question.html"
    }).when("/user/:userName?", {
        templateUrl: "static/Templates/user.html"
    }).when("/", {
        templateUrl: "static/Templates/feed.html"
    }).when("/SearchResults", {
        templateUrl: "static/Templates/searchResults.html"
    }).otherwise({
        templateUrl: 'static/Templates/feed.html'
    });
});

app.controller('SSADevHelpCtrl', function ($scope, $http, $q) {
        $scope.login = function () {
            var userObj = {
                "userName": $scope.userName,
                "password": $scope.password
            };
            // $http.post("/login/", userObj, { cache: false }).then(function (response) {
            //     $scope.$root.currentUser = response.data;
            // // alert($scope.$root.currentUser);
            //     location = location.origin + "/";
            // }, function (error) {
            //     $scope.errMsg = "Incorrect userName/password."
            // });

            $scope.login = $http.post("/login/", userObj, { cache: false });
            $scope.updateUserLastLoggedIn = $http.post("/updateUserLastLoggedIn/", userObj, { cache: false });
            $q.all([$scope.login, $scope.updateUserLastLoggedIn]).then(function (values) {
                //console.log(values[0].data);
                $scope.$root.currentUser = values[0].data;
                $scope.successfulUpdate = values[1].data;
                location = location.origin + "/";
            }, function (err) {
                console.log(err);
                if (err) {
                    $scope.errMsg = "Incorrect userName/password."
                }
            });
    };

    $scope.registerUser = function () {
        var userObj = {
            userName: $scope.userName,
            password: $scope.password,
            profileName: $scope.profileName,
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
        $http.post("/logout/").then(function (response){
            window.location = "/";
        }, function (error){
            console.log(error);
        });
    };

    $scope.searchQuestions = function (){
        var searchStr = $scope.searchStr;        
        $http.post("/api/searchQuestions/", {title: searchStr}).then(function (response){
            window.location = "/#/SearchResults";
            $scope.$root.searchResults = response.data;
        }, function (error){
            console.log(error);
        });
    }
});

app.controller('getQuestionsController', function ($scope, $http, $routeParams) 
{
    $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
        $("#questions").owlCarousel({

            navigation: true, // Show next and prev buttons
            slideSpeed: 300,
            paginationSpeed: 400,
            singleItem: true,
            autoPlay:   true
        });
    })

    var userName = $routeParams.userName;
    var url = "/getQuestions/";
    if (userName) {
        url += userName;
    }
    $http.get(url, { cache: false }).then(function (response) {
        // location = location.origin + "/";
        //console.log($scope.userName);
        $scope.questions = response.data;
        //console.log(response.data);
    });     
});

app.controller('getQuestionController', function ($scope, $http, $routeParams, $q, $rootScope) 
{ 

    $http.get("/getSessionUser/").then(function (response) {
        //alert("Get Session User is " + response.data);
        $rootScope.user =  response.data;
        //alert("Inside Get Session $root scope user variable is set to " + $rootScope.user);
    }, function(err) {
        alert(err.data);
    });
    //alert("session user is "+$rootScope.user);
    
    var questionId = $routeParams.questionId;
    //alert("question ID is " + questionId);

    //$rootScope.user =  sessionUser;
    //alert("Root Scope user is " + $rootScope.user);

    //alert("In Get Question Controller Root Scope User is " + $rootScope.user);

    $scope.questionGet = $http.get("/api/getQuestion/" + questionId, { cache: false });
    $scope.answerGet  = $http.get("/api/getAnswersByQuestion/" + questionId, { cache: false });

    $q.all([$scope.questionGet, $scope.answerGet]).then(function(values) {
        //console.log(values[0].data);
        $scope.question = values[0].data;
        $scope.answers = values[1].data;
    });

    $scope.insertAnswer = function () {
        var answer = {
            questionId: $scope.question._id,
            content: $scope.answer,
            dateTime: new Date()
        };
        $http.post("/api/postAnswer/", answer).then(function (response) {
            location.reload();
        }, function(err) {
            alert(error.data);
        });
    }

    //  $scope.viewAllQuestions = function () {
    //      $http.get("/viewAllQuestions/", { cache: false }).then(function (response) {
    //      $scope.questions = response.data;
    //      console.log(response.data);
    //     });   
    //  }

    $scope.acceptAnswer = function (questionId, answerId) {
        var question = {
            questionId: questionId,
            answerId: answerId
        };
        $http.post("/updateQuestion/", question).then(function (response) {
            //$scope.$root.user = response.data;
            //alert("Root current User is: " + response.data);
            //$rootScope.user = response.data;
            //window.location = "/#/view-question/"+questionId;
            location.reload(true);
        }, function(err) {
            alert(err.data)
        });
    }
});

app.controller('insertQuestionController', function ($scope, $http) 
{ 
    $scope.required = true;
    $scope.insertQuestion = function () {
        var question = {
            title: $scope.title,
            content: $scope.content
        };
        $http.post("/insertQuestion/", question).then(function (response) {
            window.location = "/#/";
        }, function (error) {
            console.log(error);
            alert(error.data.errmsg);
        });
    }      
});

app.controller('viewAllQuestionsController', function ($scope, $http, $routeParams, $rootScope, $location)
{
    //var userName = $routeParams.userName;
    //$rootScope.user = userName;
    $scope.letterLimit = 20;
    $scope.go = function ( path ) {
        $location.path( '/view-question/' + path );
    };
    $http.get("/viewAllQuestions/", { cache: false }).then(function (response) {
       // $scope.questions = chunk(response.data, 3);
        $scope.questions = response.data;
        //console.log(response.data);
    });     
});

app.controller('viewUserProfileController', function ($scope, $http, $routeParams) 
{
        var userProfile = {userName: $routeParams.userName};
        $http.post('/getUserProfileInfo/', userProfile, { cache: false }).then(function (response){
        $scope.profile = response.data;
        //alert("$scope.profile is " + $scope.profile);
        console.log($scope.profile);
    });
});

app.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit(attr.onFinishRender);
                });
            }
        }
    }
});