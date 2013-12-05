var GameView = Backbone.View.extend({
  template: Handlebars.compile(gameTemplate),

  initialize: function(options){
    this.render();
    new MapView({currentPlayer: this.model.get('currentPlayer'), socket: options.socket});
  },

  render: function(){
    $('#container').html(this.template);
    return this;
  }

});
