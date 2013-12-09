define(['backbone'], function(Backbone){
  var currentPlayer = Backbone.Model.extend({
    initialize: function(){
      // Add game states
      this.set('alive', true);
    }
  });
  return currentPlayer;
});
