var OtherPlayer = Backbone.Model.extend({
  initialize: function(options){
    this.set('name', options.name);
    this.set('id', options.id);
    this.set('position', null);
  }
});
