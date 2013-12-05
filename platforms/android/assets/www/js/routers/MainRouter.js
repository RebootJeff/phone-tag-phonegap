var Router = Backbone.Router.extend({
  initialize: function(options){
    $('body').prepend('<aside>test-router</aside>');
    this.app = options.app;
  },

  routes: {
    '': 'login',
    'home': 'home',
    'leaderboard': 'leaderboard',
    'join': 'join',
    'game': 'game',
    'inventory': 'inventory'
  },

  login: function(){
    $('body').prepend('<aside>test-login</aside>');
    new LoginView();
  },

  home: function(){
    if($('#home').length === 0){
      new HomeView();
    } else {
      this.slidePageFrom($('#leaderboard'), $('#home'), 'left');
    }
  },

  join: function(){
    this.app.set('game', new Game({currentPlayer: this.app.get('user'), socket: this.app.socket}));
    new JoinView({model: this.app.get('game'), user: this.app.get('user')});
  },

  leaderboard: function(){
    this.slidePageFrom($('#home'), $('#leaderboard'), 'right');
  },

  game: function(){
    if($('#game').length === 0){
      var game = this.app.get('game');
      new GameView({model: game, socket: game.socket});
    } else {
      this.slidePageFrom($('#inventory'), $('#game'), 'left');
    }
  },

  inventory: function(){
    this.slidePageFrom($('#game'), $('#inventory'), 'right');
  },

  slidePageFrom: function(start, end, slideDirection) {
    end.removeClass().addClass('page transition center');
    var startClass = (slideDirection === 'left') ? 'right' : 'left';
    start.removeClass().addClass('page transition ' + startClass);
  }
});
