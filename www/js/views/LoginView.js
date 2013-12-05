define(['backbone', 'handlebars', '../templates/login'], function(Backbone, Handlebars, LoginTemplate){
  var LoginView = Backbone.View.extend({
    template: LoginTemplate,

    initialize: function(){
      console.log(LoginTemplate);
      this.render();
    },

    render: function(){
      $('#container').html(this.template);
      return this;
    }
  });
  return LoginView;
});
