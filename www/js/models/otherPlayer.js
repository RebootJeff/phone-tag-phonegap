define(['backbone'], function(Backbone){
  var otherPlayer = Backbone.Model.extend({
    initialize: function(options){
      this.set('name', options.name);
      this.set('gameID', options.id);
      this.set('position', null);
    }
  });
  return otherPlayer;
});
