var JoinView = Backbone.View.extend({
  template: Handlebars.compile(joinTemplate),

  initialize: function(options){
    this.model.on('joinRender', this.render, this);
    this.render();
  },

  render: function(){
    $('#container').html(this.template);
    var playerList = this.model.get('otherPlayers').models;
    for (var i = 0; i < playerList.length; i++) {
      $('tbody').append('<tr><td>' + playerList[i].get('name') + '</td></tr>');
    }
    return this;
  }

});
