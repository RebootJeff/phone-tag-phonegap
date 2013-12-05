var HomeView = Backbone.View.extend({
  template: Handlebars.compile(homeTemplate),

  initialize: function(){
    this.render();
  },

  render: function(){
    $('#container').html(this.template);
    return this;
  }
});
