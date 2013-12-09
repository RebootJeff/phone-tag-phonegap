define(['backbone'], function(Backbone){
  var currentPlayer = Backbone.Model.extend({
    initialize: function(){
      // Add current player's state
      this.set('alive', true);
      this.set('invincible', false);
    }
  });
  return currentPlayer;
});
