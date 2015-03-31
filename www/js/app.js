angular.module('jufa-videos', ['ionic', 'jufa-videos.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('login', {
      url: '/',
      templateUrl: "templates/login.html",
      controller: 'LoginCtrl'
    })

    .state('update', {
      url: '/update-needed',
      templateUrl: "templates/update.html",
      controller: 'UpdateCtrl'
    })

    .state('forgot-password', {
      url: "/forgot-password",
      templateUrl: "templates/forgot-password.html",
      controller: 'ForgotPasswordCtrl'
    })

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    })

    .state('app.videos', {
      url: "/videos",
      views: {
        'menuContent' :{
          templateUrl: "templates/videos/list.html",
          controller: 'VideosCtrl'
        }
      }
    })

    .state('app.video', {
      url: "/videos/:videoId",
      views: {
        'menuContent': {
          templateUrl: "templates/videos/detail.html",
          controller: "VideoCtrl"
        }
      }
    })

    ;

  $urlRouterProvider.otherwise('/');

})