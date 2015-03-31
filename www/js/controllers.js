var DOMAIN = 'http://videolog.herokuapp.com';
// var DOMAIN = 'http://192.168.0.99:8000';
var APP_VERSION = 0.1;

var LoginCtrl = function(User, $scope, $state, $timeout, $http) {
  $scope.user = {app_version: APP_VERSION}
  $scope.loginError = {message: "", show: false};
  $scope.loginRunning = false

  $scope.$on("UserAuthenticated", function() {
    $scope.loginRunning = false;
    $state.go('app.videos', {}, {reload: true});
  });

  $scope.$on("UserNotAuthenticated", function() {
    $scope.loginError = {message: 'Email e/ou Senha não encontrados!', show: true};
    $timeout(hideLoginError, 3000);
    $scope.loginRunning = false;
    $state.go('login');
  })

  $scope.$on("AppVersionUpdateNeeded", function() {
    $state.go('update');
  });

  if (User.get() != undefined) {
    $scope.$emit("UserAuthenticated");
  }

  var hideLoginError = function() {
    $scope.loginError.show = false;
  }

  $scope.signIn = function(user) {
    $scope.loginRunning = true
    if (user == undefined || user.email == undefined || user.password == undefined || user.email == "" || user.password == "") {
      $scope.$emit("UserNotAuthenticated");
    } else {
      User.auth(user, $scope, $http)
    }
  };
}

var ForgotPasswordCtrl = function($scope) {}

var VideosCtrl = function(Video, $scope) {
  $scope.$on("VideoListUpdate", function() {
    $scope.videos = Video.all();
  });
  $scope.$emit("VideoListUpdate");
}

var VideoCtrl = function(Video, $scope, $stateParams, $log) {
  $scope.video_id = $stateParams.videoId;
  $scope.video = Video.all().filter(function(video) {return video.id == $scope.video_id})[0];
}

var AppCtrl = function(User, Video, $scope, $state, $ionicModal, $timeout, $http, $sce) {
  $scope.refresh_icon = 'ion-refresh';
  $scope.refreshVideos = function() {
    $scope.refresh_icon = 'ion-refreshing'
    Video.refresh($scope, $http);
  };
  $scope.logOut = function() {
    User.clear();
    $state.go('login');
  }
  $scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }
}

var ContentController = function($scope, $ionicSideMenuDelegate) {
  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };
}

angular.module('jufa-videos.controllers', [])
.factory('User', function() {
  var get = function() {
    var current_user = window.localStorage['current_user'];
    if (current_user) {
      var user = angular.fromJson(current_user);
      window.localStorage['current_user-token'] = user.token;
      return user
    }
    return undefined;
  };
  var save = function(user) {
    window.localStorage['current_user-token'] = user.token;
    window.localStorage['current_user'] = angular.toJson(user);
  };

  var clear = function() {
    delete window.localStorage['current_user-token'];
    delete window.localStorage['current_user'];
  };

  return {
    clear: clear,
    save: save,
    get: get,
    auth: function(user, $scope, $http) {
      $http.post(DOMAIN + '/auth/', user)
        .success(function (result) {
          if (result.error == true) {
            $scope.$broadcast("UserNotAuthenticated");
          } else {
            if (result.version_error) {
              $scope.$broadcast("AppVersionUpdateNeeded");
            } else {
              save(result.user);
              $scope.$broadcast("UserAuthenticated");
            }
          }
        })
    }
  }
})
.factory('Video', function() {
  var pub = {};

  pub.all = function() {
    var videoString = window.localStorage['videos'];
    if(videoString) {
      return angular.fromJson(videoString);
    }
    return [];
  }

  pub.save = function(videos) {
    window.localStorage['videos'] = angular.toJson(videos);
  }

  return {
    all: pub.all,
    save: pub.save,
    refresh: function($scope, $http) {
      $http.get(DOMAIN + '/videos/?format=json')
        .success(function (result) {
          pub.save(result.results);
          $scope.$broadcast("VideoListUpdate");
          $scope.refresh_icon = 'ion-refresh';
        })
        .error(function() {
          $scope.refresh_icon = 'ion-refresh';
        })
    },
    newVideo: function(videoTitle) {
      // Add a new video
      return {
        title: videoTitle,
        id: Video.all().length+1
      };
    },
    getLastActiveIndex: function() {
      return parseInt(window.localStorage['lastActiveVideo']) || 0;
    },
    setLastActiveIndex: function(index) {
      window.localStorage['lastActiveVideo'] = index;
    }
  }
})

.factory('authInterceptor', function ($rootScope, $q, $window) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      if (window.localStorage['current_user-token']) {
        config.headers.Authorization = "Token "+ window.localStorage['current_user-token'];
      }
      return config;
    },
    response: function (response) {
      if (response.status === 401) {
        // handle the case where the user is not authenticated
      }
      return response || $q.when(response);
    }
  };
})

.config(function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
})

.controller('AppCtrl', AppCtrl)
.controller('LoginCtrl', LoginCtrl)
.controller('VideosCtrl', VideosCtrl)
.controller('VideoCtrl', VideoCtrl)
.controller('ContentController', ContentController)
;