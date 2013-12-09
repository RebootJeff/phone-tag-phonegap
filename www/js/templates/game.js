define(function(){
  /*jshint multistr: true */
  return "<section id='loadingView' class='page center'> \
    <header class='header'> \
    </header> \
    <section class='content'> \
      <h1>Loading...</h1> \
      <img src='img/loading.gif'> \
    </section> \
  </section> \
  \
  <section id='game' class='page left'> \
    <section class='content'> \
      <!-- This is where map is added --> \
    </section> \
    <aside class='timer'>10:00</aside> \
    <aside class='menu closed'> \
      <p>Quit</p> \
      <button class='topcoat-button quit'></button> \
      <p>Re-center Map</p> \
      <button class='topcoat-button center-map'></button> \
      <p>Inventory</p> \
      <button class='topcoat-button toggle-menu'></button> \
    </aside> \
    <aside class='bottom-controls'> \
      <button class='topcoat-button tag hidden'>TAG</button> \
    </aside> \
  </section>";
});
