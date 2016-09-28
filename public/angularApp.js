//angular stuffs


var app = angular.module("ssadevhelp", ["ngRoute", 'ui.tinymce']);

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
    }).when("/edit-question/:questionId", {
        templateUrl: "static/Templates/edit-question.html"
    }).when("/updated-questions", {
        templateUrl: "static/Templates/view-new-answered-questions.html"
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
        $scope.login2 = function () {
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
                    $scope.errMsg = "Incorrect userName/password.";
                    //location.reload();
                    $q.reject(err);
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

app.controller('NavController', function ($scope, $location, $http, $interval) {
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };

    var socket = io();
    $scope.newAnswerCount = 0;

    $http.get("/api/getUserInfo").then((res) => {
        $scope.user = res.data;
        socket.emit('initial', $scope.user.userName);
    });

    socket.on("new-answered-questions", function (questionList) {
        $scope.newAnswerCount = questionList.length;
        $scope.$root.newAnswers = questionList;
        $scope.$apply();
    });

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

app.controller('getQuestionsController', function ($scope, $http, $routeParams, $sce) 
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
        $scope.questions = response.data;
        for (var question of $scope.questions) {
            question.content = $sce.trustAsHtml(question.content);
        }
    });     
});

app.controller('getQuestionController', function ($scope, $http, $routeParams, $q, $rootScope, $sce)
{
    $http.get("/getSessionUser/").then(function (response) {
        $rootScope.user =  response.data;
    }, function(err) {
        alert(err.data);
    });
    
    var questionId = $routeParams.questionId;

    $scope.questionGet = $http.get("/api/getQuestion/" + questionId, { cache: false });
    $scope.answerGet  = $http.get("/api/getAnswersByQuestion/" + questionId, { cache: false });
    var updateQuestionLastAccessedDate = $http.post("/api/updateQuestionLastAccessedDate", {questionId: questionId, updatedKeyValue : { lastAccessedDate: new Date() } });

    $q.all([$scope.questionGet, $scope.answerGet, updateQuestionLastAccessedDate]).then(function(values) {
        $scope.question = values[0].data;
        $scope.question.content = $sce.trustAsHtml($scope.question.content);
        $scope.answers = values[1].data;
        for (var answer of $scope.answers) {
            answer.content = $sce.trustAsHtml(answer.content);
        }
    });

    $scope.insertAnswer = function () {
        var answer = {
            questionId: $scope.question._id,
            content: $scope.answer,
            dateTime: new Date()
        };
        var postAnswer = $http.post("/api/postAnswer/", answer);
        var updateQuestionLastAnsweredDate = $http.post("/api/updateQuestionLastAnsweredDate", {questionId: questionId, updatedKeyValue : { lastAnsweredDate: new Date() } });

        $q.all([postAnswer, updateQuestionLastAnsweredDate]).then((response) => {
            var answer = response[0].data.ops[0];
            answer.content = $sce.trustAsHtml(answer.content);
            $scope.answers.push(answer);
        }, (error) => {
            alert(error.data);
        });
    }

    $scope.acceptAnswer = function (questionId, answerId) {
        var question = {
            questionId: questionId,
            answerId: answerId
        };
        $http.post("/updateQuestion/", question).then(function (response) {
            location.reload(true);
        }, function(err) {
            alert(err.data)
        });
    }

    $scope.deselectAnswer = function (questionId, answerId) {
        var question = {
            questionId: questionId,
            answerId: null
        };
        $http.post("/updateQuestion/", question).then(function (response) {
            location.reload(true);
        }, function(err) {
            alert(err.data)
        });
    }

});

app.controller('insertQuestionController', function ($scope, $http, $location) 
{ 
    $scope.required = true;
    $scope.insertQuestion = function () {
        var question = {
            title: $scope.title,
            content: $scope.content
        };
        $http.post("/insertQuestion/", question).then(function (response) {
            $location.path("/view-question/" + response.data.insertedIds[0]);
        }, function (error) {
            console.log(error);
            alert(error.data.errmsg);
        });
    } 
});

app.controller('viewAllQuestionsController', function ($scope, $http, $routeParams, $rootScope, $location, $sce)
{
    $scope.letterLimit = 20;

    $http.get("/viewAllQuestions/", { cache: false }).then(function (response) {
       // $scope.questions = chunk(response.data, 3);
        $scope.questions = response.data;
        for (var question of $scope.questions) {    
            var s = question.content;
            if (!s) {
                s = '';
            }
            const charLimit = 20;
            question.content = $sce.trustAsHtml(s);
            if (s.length > charLimit) {
                s = s.substring(0, charLimit) + '...';
                question.content20 = $sce.trustAsHtml(s);
            } else {
                question.content20 = question.content;
            }
        }
        //console.log(response.data);
    });     
});

app.controller('viewUserProfileController', function ($scope, $http, $routeParams, $q) 
{
        var username = {userName: $routeParams.userName};
        $scope.userProfile = $http.post("/getUserProfileInfo/", username, { cache: false });
        $scope.numberOfQuestions = $http.post("/getNumberOfQuestions/", username, { cache: false });
        $scope.numberOfAnswers = $http.post("/getNumberOfAnswers/", username, { cache: false });
        $q.all([$scope.userProfile, $scope.numberOfQuestions, $scope.numberOfAnswers]).then(function (values){
        $scope.profile = values[0].data;
        $scope.questionCount = values[1].data;
        $scope.answerCount = values[2].data;
    }, function (err) {
        if (err) {
            console.log("Getting user profile failed!");
            $q.reject(err);
        }
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

app.run(function ($rootScope, $location) {
    $rootScope.goToPath = function (path) {
        $location.path(path);
    }
});