define(['backbone'], function(Backbone){
  var Map = Backbone.Model.extend({

    initialize: function(options){
      google.maps.visualRefresh = true;
      this.createMap();
      this.socketSetup();
      this.setCurrentMarker();
      google.maps.event.addListener(this.map, 'zoom_changed', this.setPacmanIcon.bind(this));
    },

    setPacmanIcon: function(){
      if(this.pacmanMarker && this.map.zoom === 19){
        this.pacmanMarker.setIcon(this.pacmanLargeIcon);
      }else if(this.pacmanMarker && this.map.zoom === 18){
        this.pacmanMarker.setIcon(this.pacmanSmallIcon);
      }
    },

    trackPowerUpTimer: null,

    // Map options
    mapOptions: {
      center: new google.maps.LatLng(37.7837749, -122.4167),
      minZoom: 18,
      maxZoom: 19,
      draggable: false,
      disableDefaultUI: true
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
        featureType: "poi",
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

    // Markers
    playerMarkers: {},
    powerUpMarkers: {},
    powerUpCounter: 0,

    // Marker icons
    playerIcon: {
      size: new google.maps.Size(25, 25),
      origin: new google.maps.Point(0,0),
      anchor: new google.maps.Point(12, 12),
      url: 'img/map/player-alive.png'
    },

    enemyIcon: {
      size: new google.maps.Size(25, 25),
      origin: new google.maps.Point(0,0),
      anchor: new google.maps.Point(12, 12),
      url: 'img/map/player-enemy.png'
    },

    deadIcon: {
      size: new google.maps.Size(25, 25),
      origin: new google.maps.Point(0,0),
      anchor: new google.maps.Point(12, 12),
      url: 'img/map/player-dead.png'
    },

    powerUpIcon: {
      size: new google.maps.Size(25, 25),
      origin: new google.maps.Point(0,0),
      anchor: new google.maps.Point(12, 12)
    },

    pacmanSmallIcon: {
      size: new google.maps.Size(90, 90),
      origin: new google.maps.Point(0,0),
      anchor: new google.maps.Point(45, 45)
    },

    pacmanLargeIcon: {
      size: new google.maps.Size(172, 172),
      origin: new google.maps.Point(0,0),
      anchor: new google.maps.Point(86, 86)
    },

    powerUp: null,

    socketSetup: function(){
      var that = this;
      this.get('socket').on('createMarker', that.createMarker.bind(that));
      this.get('socket').on('sendLocationsToPlayer', that.updateMarkers.bind(that));
      this.get('socket').on('playerAlive', that.setPlayerAlive.bind(that));
      // this.get('socket').on('playerDead', that.setPlayerDead.bind(that));
      // this.get('socket').on('addPowerUpToMap', that.addPowerUpToMap.bind(that));
      this.get('socket').on('addPacmanToMap', that.generatePacman.bind(that));
      this.get('socket').on('removePowerUpFromMap', that.removePowerUpFromMap.bind(that));
      this.get('socket').on('someoneLeft', that.removeMarker.bind(that));
      this.get('socket').on('someonePoweredUp', that.hideMarker.bind(that));
    },

    handleError: function(err){
      console.warn('ERROR(' + err.code + '): ' + err.message);
    },

    watchLocation: function(marker){
      var that = this;
      var watchCurrentPosition = function(position){
        var socket = that.get('socket');
        var currentPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        var playerLocation = {};
        playerLocation.playerName = that.get('currentPlayer').get('name');
        playerLocation.gameID = that.get('currentPlayer').get('gameID');
        playerLocation.location = {lat: position.coords.latitude, lng:position.coords.longitude};

        that.map.panTo(currentPosition);
        marker.setPosition(currentPosition);
        socket.emit('sendLocationFromPlayer', playerLocation);
      };
      navigator.geolocation.watchPosition(watchCurrentPosition, that.handleError, that.gpsOptions);
    },

    // Map functions
    createMap: function(){
      this.map = new google.maps.Map($("#map-canvas")[0], this.mapOptions);
      this.map.setOptions({styles: this.styles});
    },

    createMarker: function(data){
      var latLng = new google.maps.LatLng(data.location.lat, data.location.lng);

      var marker = new google.maps.Marker({
        position: latLng,
        map: this.map,
        visible: false,
        icon: this.enemyIcon
      });

      marker.setIcon(this.enemyIcon);
      marker.id = data.playerName;
      this.playerMarkers[marker.id] = marker;
      var that = this;
      if(marker.id === this.get('currentPlayer').get('name')){
        this.watchLocation(marker);
        marker.setVisible(true);
        marker.setIcon(this.playerIcon);
        this.currentPlayerMarker = marker;
      }else{
        setInterval(function(){that.markerRadarDisplay(marker);}, 5000);
      }
    },

    setCurrentMarker: function(){
      var that = this;
      var setCurrentPosition = function(position){
        var currentPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        that.map.setCenter(currentPosition);
        that.map.setZoom(19);

        var playerLocation = {};
        var player = that.get('currentPlayer');
        playerLocation.playerName = player.get('name');
        playerLocation.gameID = player.get('gameID');
        playerLocation.location = {lat: position.coords.latitude, lng:position.coords.longitude};
        var currentTime = Date.now();
        player.startTime = currentTime;
        playerLocation.time = currentTime;
        that.get('socket').emit('newPlayerMarker', playerLocation);
        // that.get('socket').emit('generatePowerUp', playerLocation);
      };
      navigator.geolocation.getCurrentPosition(setCurrentPosition, that.handleError, that.gpsOptions);
    },

    updateMarkers: function(locations){
      var marker, location;

      // Loop through all players sent by the server and update their location
      for(var player in locations){
        marker = this.playerMarkers[player];
        location = locations[player];

        // Make sure not to update current player - current position is tracked with watchLocation
        // Update location if there is a lat and lng sent
        if(marker.id !== this.get('currentPlayer').get('name') && location.lat && location.lng){
          marker.setPosition(new google.maps.LatLng(location.lat, location.lng));
        }
      }
    },

    // setDistanceFromUser: function(marker){
    //   if(this.currentPlayerMarker){
    //     marker.distanceFromCurrentPlayer = google.maps.geometry.spherical.computeDistanceBetween(this.currentPlayerMarker.position, marker.position);
    //   }
    // },

    checkDistance: function(marker1, marker2, range){
      return google.maps.geometry.spherical.computeDistanceBetween(marker1.position, marker2.position) < range;
    },

    removeMarker: function(data){
      var playerName = data.name;
      var marker = this.playerMarkers[playerName];

      marker.setMap(null);
      delete this.playerMarkers[playerName];
      this.updateMarkers(data.newLocations);
    },

    hideMarker: function(data){
      var playerName = data;
      var marker = this.playerMarkers[playerName];
      marker.setMap(null);
      setTimeout(function(){ marker.setMap(this.map); }, 10000);
    },

    addPowerUpToMap: function(powerUp){
      var powerUpRadius;
      var title = powerUp.name;
      var that = this;

      this.powerUpIcon.url = ('img/map/power-up-invincibility.png');

      var myLatlng = new google.maps.LatLng(powerUp.location.lat, powerUp.location.lng);
      var marker = new google.maps.Marker({
        id: powerUp.id,
        position: myLatlng,
        map: this.map,
        title: title,
        icon: this.powerUpIcon,
        radius: powerUp.radius
      });
      if (title === 'respawn'){
        powerUpRadius = {
          strokeColor: 'blue',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: 'blue',
          fillOpacity: 0.35,
          map: this.map,
          center: myLatlng,
          radius: 25
        };
      } else {
        powerUpRadius = {
          strokeColor: 'yellow',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: 'yellow',
          fillOpacity: 0.35,
          map: this.map,
          center: myLatlng,
          radius: 15
        };
      }

      marker.powerUpCircle = new google.maps.Circle(powerUpRadius);
      marker.powerUpName = title;
      this.powerUpMarkers[marker.id] = marker;
      if (!this.powerUpCounter) {
        this.trackPowerUpTimer = setInterval(function(){
          that.trackPowerUps();
        }, 1000);
      }
      this.powerUpCounter++;
    },

    trackPowerUps: function(){
      var marker;
      var player = this.get('currentPlayer');

      for (var powerUpID in this.powerUpMarkers) {

        marker = this.powerUpMarkers[powerUpID];

        if(this.checkDistance(marker, this.currentPlayerMarker, marker.radius)){
          var data = { playerName: player.get('name'), gameID: player.get('gameID'), powerUpName: marker.title, powerUpID: marker.id };
          if (marker.title === 'respawn') {
            this.setPlayerAlive(data.playerName);
            this.get('socket').emit('playerRespawn', data);
          } else {
            this.get('socket').emit('addItemToPlayer', data);
          }
          this.removePowerUpFromMap(marker);
        }
      }
    },

    generatePacman: function(pacman){
      var latLng = new google.maps.LatLng(pacman.location.lat, pacman.location.lng),
          direction = pacman.direction,
          movement = {},
          distance,
          newPosition,
          timer,
          that = this,
          currentPlayer = this.get('currentPlayer');

      var size = (this.map.zoom === 19)? 'large' : 'small';

      movement.left = -0.000008;
      movement.right = 0.000008;

      // Set the url based on direction
      this.pacmanSmallIcon.url = 'img/map/pacman-small-' + direction + '.gif';
      this.pacmanLargeIcon.url = 'img/map/pacman-large-' + direction + '.gif';

      // Set the url
      this.pacmanIcon = (size === 'large')? this.pacmanLargeIcon : this.pacmanSmallIcon;

      // Create pacman marker
      this.pacmanMarker = new google.maps.Marker({
        position: latLng,
        map: this.map,
        optimized: false,
        icon: this.pacmanIcon
      });

      this.pacmanMarker.direction = direction;

      timer = setInterval(function(){
        // Set new position for Pacman
        newPosition = new google.maps.LatLng(that.pacmanMarker.position.ob, that.pacmanMarker.position.pb + movement[direction]);
        that.pacmanMarker.setPosition(newPosition);
        // Determine if Pacman killed the current user
        if(currentPlayer.get('alive') &&
          !currentPlayer.get('invincible') &&
          this.checkDistance(that.pacmanMarker, that.currentPlayerMarker, 22)){
            var response = {};
            response.playerName = currentPlayer.get('name');
            response.gameID = currentPlayer.get('gameID');
            that.get('socket').emit('setPlayerDead', response);
            // Respawn for the current player after 10 seconds
            setTimeout(function(){
              that.get('socket').emit('setPlayerAlive', response);
            }, 10000);
        }

      }, 50);

      // Remove pacman after 10 seconds
      setTimeout(function(){
        clearInterval(timer);
        that.pacmanMarker.setMap(null);
        that.pacmanMarker = null;
      }, 10000);
    },

    removePowerUpFromMap: function(marker){
      marker.setMap(null);
      marker.powerUpCircle.setMap(null);
      delete this.powerUpMarkers[marker.id];
      this.powerUpCounter--;
      if (!this.powerUpCounter) {
        clearInterval(this.trackPowerUpTimer);
      }
    },

    checkPlayersToTag: function(){
      var tagged = [],
          currentPlayer = this.get('currentPlayer'),
          marker,
          player,
          response;

      // Loop through all players to see if they are tagable
      for(var playerName in this.playerMarkers){
        playerMarker = this.playerMarkers[playerName];
        if(playerName !== currentPlayer.get('name') &&
          // check if player is invincible &&
          // check if player is dead already &&
          this.checkDistance(playerMarker, this.currentPlayerMarker, 10)){
            player = {playerName: playerName, gameID: currentPlayer.get('gameID')};
            tagged.push(player);
        }
      }
      response = {
        taggedPlayers: tagged,
        taggerName: currentPlayer.get('name'),
        gameID: currentPlayer.get('gameID')
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
        marker = this.playerMarkers[name];
        center = marker.position;
        strokeColor = '#880000';
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
      $('button.tag').prop('disabled', true);
      setTimeout(function(){
        clearInterval(timer);
        $('button.tag').html('TAG');
        if(this.get('currentPlayer').get('alive')){
          $('button.tag').prop('disabled', false);
        }
      }, 10000);
      var count = 10;
      var timer = setInterval(function(){
        count--;
        $('button.tag').html(count);
      }, 1000);
    },

    setPlayerDead: function(name){
      if(name === this.get('currentPlayer').get('name')){
        this.tagCountdown();
        $('button.tag').prop('disabled', true);
      }
      this.playerMarkers[name].setIcon(this.deadIcon);
    },

    setPlayerAlive: function(name){
      if(name === this.get('currentPlayer').get('name')){
        $('button.tag').prop('disabled', false);
        this.currentPlayerMarker.setIcon(this.playerIcon);
      } else {
        this.playerMarkers[name].setIcon(this.enemyIcon);
      }
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

        var timer = setInterval(function(){marker.setVisible(false);}, timeShown);
        marker.timer = timer;
      }
    },

    zoomOut: function(){
      this.map.setZoom(18);
    },

    zoomIn: function(){
      this.map.setZoom(19);
    },

    centerMap: function(){
      this.map.setCenter(this.currentPlayerMarker.position);
    }
  });
  return Map;
});
