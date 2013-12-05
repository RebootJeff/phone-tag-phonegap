var App = Backbone.Model.extend({
  initialize: function(){
      $('#tester').append('<p>app init</p>');
    if(io){
      $('#tester').append('<p>io exists</p>');
    } else {
      $('#tester').append('<p>io nooo</p>');
    }
    var that = this;
    this.on('setUser', this.setUser, this);
    this.socket = io.connect('http://hadooken.herokuapp.com');
    $('#tester').append('<p>post io.connect</p>');
    this.socket.on('renderGameViews', function(){
      that.trigger('renderGameViews');
    });
  },

  setUser: function(){
    this.set('user', $('input').val());
    this.trigger('loggedIn');
  }
});
