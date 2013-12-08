define(function(){
  /*jshint multistr: true */
  return "<section id='loadingView' class='page center'> \
    <header class='header'> \
    </header> \
    <section class='content'> \
      <h1>Switching GPS to fun mode...</h1> \
      <img src='img/loading.gif'> \
      <aside class='loading-text'> \
        Instructions: \
        <ul class='instructions'> \
          <li>Run within <strong>10 meters</strong> to hit enemies with your tag button</li> \
          <li>Run to the blue circle after getting tagged</li> \
          <li>Run to green icons (power-ups!)</li> \
          <li>Swipe right/left to use menu</li> \
          <li>Run <strong>away</strong> from Pac-Man</li> \
        </ul> \
      </aside> \
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
      <button class='topcoat-button power-up invincibility'></button> \
      <button class='topcoat-button toggle-menu'></button> \
    </aside> \
    <aside class='bottom-controls'> \
      <button class='topcoat-button tag hidden'>TAG</button> \
    </aside> \
  </section>";
});
