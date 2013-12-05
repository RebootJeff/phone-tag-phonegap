var MapView = Backbone.View.extend({
  template: Handlebars.compile(mapTemplate)(),

  initialize: function(options){
    this.render();
    this.model = new Map({currentPlayer: options.currentPlayer, socket: options.socket});
  },

  render: function(){
    $('#game .content').prepend(this.template);
    return this;
  }

});
