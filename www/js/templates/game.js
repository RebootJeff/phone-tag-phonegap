define(function(){
  /*jshint multistr: true */
  return "<section id='loadingView' class='page center'> \
    <header class='header'> \
    </header> \
    <section class='content'> \
      <h1>Loading</h1> \
      <img src='img/loading.gif'> \
    </section> \
  </section> \
  \
  <section id='game' class='page right'> \
    <section class='content'> \
    </section> \
      <button class='topcoat-button toggleModal'><img src='img/map.png'></button> \
      <button class='topcoat-button tag'>Tag</button> \
      <button class='topcoat-button powerUp'><img src='img/lightning.png'</button> \
    <header class='header'> \
      <button class='topcoat-button quit'><img src='img/exit.png'></button> \
      <button class='topcoat-button inventory'><img src='img/cabinet.png'></button> \
    </header> \
  </section> \
  \
  <section id='inventory' class='page right'> \
    <header class='header'> \
      <h1>Inventory</h1> \
      <button class='topcoat-button game'>Back</button> \
    </header> \
    <section class='content'> \
      <ul> \
        <li>Invisibility</li> \
        <li>Invincibility</li> \
        <li>Bombs</li> \
        <li>Ken</li> \
      </ul> \
    </section> \
  </section> \
  \
  <section class='modal closed'> \
    <h1>Search Controls</h1> \
    <button class='topcoat-button toggleModal'><img src='img/cancel-circle.png'></button> \
    <button class='topcoat-button centerMap'><img src='img/map-center.png'></button> \
    <button class='topcoat-button zoomOut'><img src='img/minus.png'></button> \
    <button class='topcoat-button zoomIn'><img src='img/plus.png'></button> \
  </section>";
});
