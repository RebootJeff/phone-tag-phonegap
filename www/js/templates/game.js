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
    <header class='header'> \
      <button class='quit'><img src='img/exit.png'></button> \
      <button class='inventory'><img src='img/cabinet.png'></button> \
    </header> \
    <section class='content'> \
      <button class='toggleModal'><img src='img/map.png'></button> \
      <button class='tag'>Tag</button> \
      <button class='powerUp'><img src='img/lightning.png'</button> \
    </section> \
  </section> \
  \
  <section id='inventory' class='page right'> \
    <header class='header'> \
      <h1>Inventory</h1> \
      <a class='game'>Back</a> \
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
    <button class='toggleModal'><img src='img/cancel-circle.png'></button> \
    <button class='centerMap'><img src='img/map-center.png'></button> \
    <button class='zoomOut'><img src='img/minus.png'></button> \
    <button class='zoomIn'><img src='img/plus.png'></button> \
  </section>";
});
