define(['backbone'], function(Backbone){
  var map = Backbone.Model.extend({

    initialize: function(options){
      google.maps.visualRefresh = true;
      this.createMap();
      this.setCurrentMarker();
      this.socketSetup();
    },

    // Map options
    mapOptions: {
      center: new google.maps.LatLng(37.7837749, -122.4167),
      minZoom: 19,
      maxZoom: 21,
      draggable: false,
      panControl: false,
      zoomControl: false
    },

    styles: [
      {
        stylers: [
          { hue: "#6699cc" },
          { saturation: -20 }
        ]
      },{
        featureType: "road",
        elementType: "geometry",
        stylers: [
          { lightness: 100 },
          { visibility: "simplified" }
        ]
      },{
        featureType: "road",
        elementType: "labels",
        stylers: [
          { visibility: "off" }
        ]
      }
    ],

    gpsOptions: {
      enableHighAccuracy: true,
      // timeout: 10000,
      maximumAge: 5000
    },

    markers: [],

    powerUp: null,

    // Map functions
    createMap: function(){
      this.map = new google.maps.Map($("#map-canvas")[0], this.mapOptions);
      this.map.setOptions({styles: this.styles});
    },

    createMarker: function(data){
      var latLng = new google.maps.LatLng(data.location.lat, data.location.lng);

      var image = {
        url: 'img/evil.png',
        size: new google.maps.Size(25, 25),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(12, 12)
      };

      var marker = new google.maps.Marker({
        position: latLng,
        map: this.map,
        visible: false,
        icon: image
      });
      marker.id = data.name;
      this.markers.push(marker);
      var that = this;
      if(marker.id === this.get('currentPlayer').get('name')){
        this.watchLocation(marker);
        marker.setVisible(true);
        image.url = 'img/wink.png';
        marker.setIcon(image);
      }else{
        setInterval(function(){that.markerRadarDisplay(marker);}, 5000);
      }
    },

    setCurrentMarker: function(){
      var that = this;
      var setCurrentPosition = function(position){
        var currentPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        that.map.setCenter(currentPosition);
        that.map.setZoom(21);

        var playerLocation = {};
        var player = that.get('currentPlayer');
        playerLocation.name = player.get('name');
        playerLocation.roomID = player.get('roomID');
        playerLocation.location = {lat: position.coords.latitude, lng:position.coords.longitude};
        var currentTime = Date.now();
        player.startTime = currentTime;
        playerLocation.time = currentTime;
        that.get('socket').emit('newPlayerMarker', playerLocation);
        that.get('socket').emit('generatePowerUp', playerLocation);
      };
      navigator.geolocation.getCurrentPosition(setCurrentPosition, that.handleError, that.gpsOptions);
    },

    updateMarkers: function(locations){
      var marker;
      for(var i = 0; i < this.markers.length; i++){
        marker = this.markers[i];
        if(marker.id !== this.get('currentPlayer').get('name')){
          marker.setPosition(new google.maps.LatLng(locations[marker.id].lat, locations[marker.id].lng));
          this.setDistanceFromUser(marker);
          console.log('distance from current player is: ', marker.distanceFromCurrentPlayer);
          if(locations[marker.id]){
            marker.setPosition(new google.maps.LatLng(locations[marker.id].lat, locations[marker.id].lng));
          }
        }
      }
    },

    setDistanceFromUser: function(marker){
      marker.distanceFromCurrentPlayer = google.maps.geometry.spherical.computeDistanceBetween(this.currentPlayerMarker.position, marker.position);
    },

    removeMarker: function(data){
      var playerName = data.username;
      var newLocations = data.newLocations;
      var markers = this.markers;
      for( var i = 0; i < markers.length; i++ ){
        var marker = markers[i];
        if( marker.id === playerName ){
          marker.setMap(null);
          markers.splice(i, 1);
        }
      }
      this.updateMarkers(newLocations);
    },

    hideMarker: function(data){
      var playerName = data;
      var markers = this.markers;
      var map = this.map;
      for( var i = 0; i < markers.length; i++ ){
        var marker = markers[i];
        if( marker.id === playerName ){
          marker.setMap(null);
          setTimeout(function(){
            console.log("10 SECS");
            marker.setMap(map);
          }, 10000);
        }
      }
    },

    addPowerUpToMap: function(powerUp){
      var that = this;
      var lat = powerUp.lat;
      var lng = powerUp.lng;
      var title = powerUp.name;

      var myLatlng = new google.maps.LatLng(lat, lng);
      var marker = new google.maps.Marker({
        position: myLatlng,
        map: that.map,
        title: title
      });
      var powerUpRadius = {
        strokeColor: 'yellow',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: 'yellow',
        fillOpacity: 0.35,
        map: that.map,
        center: myLatlng,
        radius: 13
      };

      marker.setIcon('img/power.png');
      powerUpCircle = new google.maps.Circle(powerUpRadius);
      this.powerUp = {marker: marker, name: title, circle: powerUpCircle };
    },

    handleError: function(err){
      console.warn('ERROR(' + err.code + '): ' + err.message);
    },

    watchLocation: function(marker){
      var that = this;

      var watchCurrentPosition = function(position){
        console.log("watchCurrentPosition is getting called");
        var socket = that.get('socket');
        var currentPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        var playerLocation = {};
        playerLocation.name = that.get('currentPlayer').get('name');
        playerLocation.roomID = that.get('currentPlayer').get('roomID');
        playerLocation.location = {lat: position.coords.latitude, lng:position.coords.longitude};

        that.currentPlayerMarker = marker;
        that.map.panTo(currentPosition);
        marker.setPosition(currentPosition);
        socket.emit('sendLocationFromPlayer', playerLocation);
      };
      navigator.geolocation.watchPosition(watchCurrentPosition, that.handleError, that.gpsOptions);
    },

    alive: true,

    generatePacman: function(location){
      var latLng = new google.maps.LatLng(location.lat, location.lng),
          direction = location.direction,
          movement = {},
          icon = {},
          distance,
          newPosition,
          timer,
          that = this;

      movement.left = -0.000008;
      movement.right = 0.000008;
      icon.left = 'img/pacmanLeft.gif';
      icon.right = 'img/pacmanRight.gif';
      this.pacmanMarker = new google.maps.Marker({
        position: latLng,
        map: this.map,
        optimized: false,
        icon: icon[direction]
      });
      timer = setInterval(function(){
        // Set new position for Pacman
        newPosition = new google.maps.LatLng(that.pacmanMarker.position.ob, that.pacmanMarker.position.pb + movement[direction]);
        that.pacmanMarker.setPosition(newPosition);
        distance = google.maps.geometry.spherical.computeDistanceBetween(that.pacmanMarker.position, that.currentPlayerMarker.position);

        // Determine if Pacman killed the current user
        if(distance < 8 && that.alive){
          that.get('socket').emit('setPlayerDead', {name: that.get('currentPlayer').get('name'), roomID: that.get('currentPlayer').get('roomID')});
          that.alive = false;

          // Respawn for the current player after 10 seconds
          setTimeout(function(){
            that.get('socket').emit('setPlayerAlive', {name: that.get('currentPlayer').get('name'), roomID: that.get('currentPlayer').get('roomID')});
            that.alive = true;
          }, 10000);
        }

      }, 50);

      // Remove pacman after 10 seconds
      setTimeout(function(){
        clearInterval(timer);
        that.pacmanMarker.setMap(null);
      }, 4000);
    },

    checkItemsToPowerUp: function(){
      var marker = this.powerUp.marker;
      marker.distanceFromCurrentPlayer = google.maps.geometry.spherical.computeDistanceBetween(this.currentPlayerMarker.position, marker.position);
      if( marker && marker.distanceFromCurrentPlayer <= 13 ){
        var data = { player: this.get('currentPlayer').get('name'), roomID: this.get('currentPlayer').get('roomID'), item: this.powerUp.name };
        this.get('socket').emit('addItemToPlayer', data);
        this.powerUp.marker.setMap(null);
        this.powerUp.circle.setMap(null);
        this.powerUp = null;
      }
    },

    checkPlayersToTag: function(){
      var tagged = [],
          marker,
          player,
          response;

      for(var i = 0; i < this.markers.length; i++){
        marker = this.markers[i];
        if(marker.distanceFromCurrentPlayer < 10 && marker.id !== this.get('currentPlayer').get('name')){
          player = {player: marker.id, roomID: this.get('currentPlayer').get('roomID')};
          tagged.push(player);
        }
      }
      response = {
        taggedPlayers: tagged,
        tagger: this.get('currentPlayer').get('name'),
        roomID: this.get('currentPlayer').get('roomID')
      };
      this.get('socket').emit('tagPlayers', response);
    },

    tagAnimate: function(name){
      var center = this.currentPlayerMarker.position,
          strokeColor = '#FF0000',
          that = this,
          radius = 0,
          marker;
      if(name && name !== this.get('currentPlayer').get('name')){
        for(var i = 0; i < this.markers.length; i++){
          marker = this.markers[i];
          if(marker.id === name){
            center = marker.position;
            strokeColor = '#3777D8';
          }
        }
      }
      var circleOptions = {
        strokeColor: strokeColor,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: strokeColor,
        fillOpacity: 0.35,
        map: that.map,
        center: center,
        radius: radius
      };
      that.circle = new google.maps.Circle(circleOptions);
      var timer = setInterval(function(){
        radius+=0.25;
        that.circle.setRadius(radius);
        if(radius >= 10){
          clearInterval(timer);
          that.circle.setMap(null);
        }
      }, 25);
    },

    tagCountdown: function(){
      $('button.tag').prop('disabled',true);
      setTimeout(function(){
        clearInterval(timer);
        $('button.tag').html('TAG');
        $('button.tag').prop('disabled',false);
      }, 10000);
      var count = 10;
      var timer = setInterval(function(){
        count--;
        $('button.tag').html(count);
      }, 1000);
    },

    setPlayerDead: function(player){
      var marker;
      if(player.name === this.get('currentPlayer').get('name')){
        this.tagCountdown();
        return this.currentPlayerMarker.setIcon('img/heart-broken.png');
      }
      for(var i = 0; i < this.markers.length; i++){
        marker = this.markers[i];
        if(marker.id === player.name){
          marker.setIcon('img/heart-broken.png');
          return;
        }
      }
    },

    setPlayerAlive: function(player){
      var marker;
      if(player.name === this.get('currentPlayer').get('name')){
        return this.currentPlayerMarker.setIcon('img/wink.png');
      }

      for(var i = 0; i < this.markers.length; i++){
        marker = this.markers[i];
        if(marker.id === player.name){
          return marker.setIcon('img/evil.png');
        }
      }
    },

    socketSetup: function(){
      var that = this;
      this.get('socket').on('createMarker', function(data){ that.createMarker(data); });
      this.get('socket').on('sendLocationsToPlayer', function(data){ that.updateMarkers(data); });
      this.get('socket').on('playerAlive', function(data){ that.setPlayerAlive(data); });
      this.get('socket').on('playerDead', function(data){ that.setPlayerDead(data); });
      this.get('socket').on('addPacmanToMap', function(data){ that.generatePacman(data); });
      this.get('socket').on('addPowerUpToMap', function(data){ that.addPowerUpToMap(data); });
      this.get('socket').on('someoneLeft', function(data){ that.removeMarker(data); });
      this.get('socket').on('someonePoweredUp', function(data){ that.hideMarker(data); });
    },

    markerRadarDisplay: function(marker){
      if(marker.id !== this.get('currentPlayer').get('name')){
        if(marker.timer){clearInterval(marker.timer);}
        timeShown = marker.distanceFromCurrentPlayer / 150 * 5000;
        if(timeShown < 800){
          timeShown = 800;
        }else if(timeShown >= 5000){
          timeShown = 5000;
        }
        var that = this;
        marker.setVisible(true);
        // console.log('The time shown should be: '+ timeShown + 'ms');
        var timer = setInterval(function(){marker.setVisible(false);}, timeShown);
        marker.timer = timer;
      }
    },

    zoomOut: function(){
      this.map.setZoom(17);
    },

    zoomIn: function(){
      this.map.setZoom(19);
    },

    centerMap: function(){
      this.map.setCenter(this.currentPlayerMarker.position);
    }
  });
  return map;
});
