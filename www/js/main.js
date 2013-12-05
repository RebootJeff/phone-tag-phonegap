$(document).ready(function(){
  // if (window.location.hash && window.location.hash == '#_=_') {
  //   if (window.history && history.pushState) {
  //     window.history.pushState('', document.title, window.location.pathname);
  //   }else{
  //     // Prevent scrolling by storing the page's current scroll offset
  //     var scroll = {
  //       top: document.body.scrollTop,
  //       left: document.body.scrollLeft
  //     };
  //     window.location.hash = '';
  //     // Restore the scroll offset, should be flicker free
  //     document.body.scrollTop = scroll.top;
  //     document.body.scrollLeft = scroll.left;
  //   }
  // }
  if(AppView){
    $('#tester').append('<p>AppView exists</p>');
  } else {
    $('#tester').append('<p>AppView nooooo</p>');
  }
  if(App){
    $('#tester').append('<p>App exists</p>');
  } else {
    $('#tester').append('<p>App nooooo</p>');
  }
  new AppView({model: new App()});
  $('#tester').append('test-post-start');
});

