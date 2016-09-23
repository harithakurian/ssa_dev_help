//angular stuffs


var app = angular.module("ssadevhelp", ["ngRoute"]);

app.config(function ($routeProvider) {
    $routeProvider.when("/ViewAllQuestions", {
        templateUrl: "static/Templates/viewAllQuestions.html"
    }).when("/InsertQuestion", {
        templateUrl: "static/Templates/insertQuestion.html"
    }).when("/view-question/:questionId", {
        templateUrl: "static/Templates/view-question.html"
    }).when("/user/:userName", {
        templateUrl: "static/Templates/feed.html"
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
        $http.post("/logout/").then(function (response){
            window.location = "/";
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
        console.log(response.data);
    });     
});

app.controller('getQuestionController', function ($scope, $http, $routeParams, $q) 
{ 
    var questionId = $routeParams.questionId;

    $scope.questionGet = $http.get("/api/getQuestion/" + questionId, { cache: false });
    $scope.answerGet  = $http.get("/api/getAnswersByQuestion/" + questionId, { cache: false });

    $q.all([$scope.questionGet, $scope.answerGet]).then(function(values) {
        console.log(values[0].data);
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

    $scope.acceptAnswer = function (questionId, answerId) {
        var question = {
            questionId: questionId,
            answerId: answerId
        };
        $http.post("/updateQuestion/", question).then(function (response) {
            location.reload();
        }, function(err) {
            alert(error.data)
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

app.controller('viewAllQuestionsController', function ($scope, $http, $routeParams) 
{
    $http.get("/viewAllQuestions/", { cache: false }).then(function (response) {
        $scope.questions = response.data;
        console.log(response.data);
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