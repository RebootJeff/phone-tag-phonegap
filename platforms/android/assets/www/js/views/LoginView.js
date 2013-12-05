var LoginView = Backbone.View.extend({
  template: Handlebars.compile(loginTemplate),

  initialize: function(){
    this.render();
  },

  render: function(){
    $('#container').html(this.template);
    return this;
  }
});
