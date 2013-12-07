define(['backbone', 'Hammer', 'routers/MainRouter'], function(Backbone, Hammer, Router){
  var AppView = Backbone.View.extend({

    el: $('body'),

    initialize: function(){
      this.router = new Router({app: this.model});
      // this.router.on('route', function(){console.log(this.model.get('user'));}, this);
      this.model.on('loggedIn', this.renderHomeView, this);
      this.model.on('renderGameViews', this.renderGameView, this);
      this.hammerSetup();
      Backbone.history.start({pushState: false});
    },

    events: {
      'submit': 'login',
      'renderGameViews': 'renderGameView',
    },

    hammerSetup: function(){
      var hammertime = this.$el.hammer();
      // Login events
      hammertime.on('tap', 'button.logout', this.logout.bind(this));

      // View render events
      hammertime.on('tap', 'button.home', this.renderHomeView.bind(this));
      hammertime.on('tap', 'button.leaderboard', this.renderLeaderboardView.bind(this));
      hammertime.on('tap', 'button.join', this.renderJoinView.bind(this));
      hammertime.on('tap', 'button.game', this.renderGameView.bind(this));

      // Game events
      // hammertime.on('tap', 'button.start', this.sendStartGame.bind(this));
      hammertime.on('tap', 'button.power-up', this.powerUp.bind(this));
      // hammertime.on('tap', 'button.power-up', this.powerUpInventory.bind(this));
      hammertime.on('tap', 'button.tag', this.tag.bind(this));
      hammertime.on('tap', 'button.toggle-menu', this.renderInventoryView.bind(this));
      hammertime.on('swipeleft swiperight', '#map-canvas', this.renderInventoryView.bind(this));
      hammertime.on('tap', 'button.quit', this.quitGame.bind(this));

      // Map control events
      hammertime.on('pinchin', '#map-canvas', this.zoomOut.bind(this));
      hammertime.on('pinchout', '#map-canvas', this.zoomIn.bind(this));
      hammertime.on('tap', 'button.toggleModal', this.toggleModal.bind(this));
      hammertime.on('tap', 'button.center-map', this.centerMap.bind(this));

    // var container = $('#container');
    // Hammer(this.$el).on('tap','input', function(event){
    //   debugger;
    //   console.log("input is being clicked");
    // });
    // Hammer(container).on('swipeup', function(event){
    //   console.log('swipeup!');
    // });

    },

    // Login/Logout functions
    login: function(e){
      e && e.preventDefault();
      // Todo send it to the server
      this.model.trigger('setUser');
    },

    logout: function(){
      this.router.navigate('/', {trigger:true});
      // var that = this;
      // $.get('/logout', function(){
      //   that.model.set('user', null);
      //   that.router.navigate('/', {trigger:true});
      // });
    },

    // checkAuth: function(){
    //   if(!this.model.get('user')){
    //     this.model.trigger('createPlayer');
    //   }
    // },

    quitGame: function(e){
      e && e.preventDefault();
      var gameID = this.model.get('currentGame').get('gameID');
      var username = this.model.get('user');
      var obj = { gameID: gameID, username: username };
      this.model.socket.emit('leaveGame', obj);
      this.router.navigate('/', {trigger:true});
    },

    renderHomeView: function(e){
      e && e.preventDefault();
      this.router.navigate('/home', {trigger:true});
    },

    renderLeaderboardView: function(e){
      e && e.preventDefault();
      this.router.navigate('/leaderboard', {trigger:true});
    },

    renderJoinView: function(e){
      e && e.preventDefault();
      this.router.navigate('/join', {trigger:true});
    },

    renderGameView: function(e){
      e && e.preventDefault();
      this.router.navigate('/game', {trigger:true});
    },

    renderInventoryView: function(e){
      e && e.preventDefault();
      $('.menu').toggleClass('closed');
    },

    // checkAuth: function(){
    //   if(!this.model.get('user')){
    //     this.model.trigger('createPlayer');
    //   }
    // },

    // Game functions
    // sendStartGame: function(e){
    //   e && e.preventDefault();
    //   this.model.socket.emit('startGame', this.model.get('currentGame').get('gameID'));
    // },

    tag: function(e){
      e && e.preventDefault();
      this.model.get('currentGame').trigger('tag');
      this.tagCountdown();
    },

    tagCountdown: function(){
      $('button.tag').prop('disabled',true);
      setTimeout(function(){
        clearInterval(timer);
        $('button.tag').html('TAG');
        $('button.tag').prop('disabled',false);
      }, 15000);
      var count = 15;
      var timer = setInterval(function(){
        count--;
        $('button.tag').html(count);
      }, 1000);
    },

    powerUpInventory: function(e){
      e && e.preventDefault();
      console.log('PowerUp Inventory is clicked:', e.currentTarget);
    },

    // Map functions
    toggleModal: function(e){
      e && e.preventDefault();
      console.log('modalToggled');
      $('.modal').toggleClass('closed');
    },

    zoomOut: function(e){
      e && e.preventDefault();
      this.model.get('currentGame').trigger('zoomOut');
    },

    zoomIn: function(e){
      e && e.preventDefault();
      this.model.get('currentGame').trigger('zoomIn');
    },

    powerUp: function(e){
      e && e.preventDefault();
      console.log('Pick Up clicked');
      this.model.get('currentGame').trigger('powerUp');
    },

    centerMap: function(e){
      e && e.preventDefault();
      console.log("centerMap");
      this.model.get('currentGame').trigger('centerMap');
    }

  });
  return AppView;
});
