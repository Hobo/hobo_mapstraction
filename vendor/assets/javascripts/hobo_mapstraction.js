//= require_tree .

/* see the DRYMLDoc for documentation. The mapstraction tag pretty
   much just passes its attributes straight through as options to this
   function */
jQuery.fn.hjq_mapstraction = function(o) {
  // save off the markers before mapstraction kills everything inside
  // our div
  var map;

  var markers = [];
  this.find("[data-mapstraction-marker]").each(function() {
    markers.push({o: $(this).data('mapstraction-marker'), info: $(this).html()});
  });

  var polylines = [];
  this.find("[data-mapstraction-polyline]").each(function() {
    var data=$(this).data('mapstraction-polyline');
    if($(this).html().length>0) {
      var marker_index = markers.push({info: $(this).html(), o: {lat: data.points[0][0], lon: data.points[0][1]}}) - 1;
      if(!data.data) data.data = {};
      if(!data.data.click) {
        data.data.click = function() {
          map.markers[marker_index].openBubble();
        };
      }
    }
    polylines.push(data);
  });

  // the main reason we're here
  map = new mxn.Mapstraction(this.get(0), o['api']);

  // some of the easy options
  if(o.largeControls) map.addLargeControls();
  if(o.smallControls) map.addSmallControls();
  if(o.mapTypeControls) map.addMapTypeControls();
  if(o.mapType) map.setMapType(eval("mxn.Mapstraction."+o.mapType));

  // set up markers
  for(var i=0; i<markers.length; i++) {
    var marker = new mxn.Marker(new mxn.LatLonPoint(markers[i].o.lat, markers[i].o.lon));
    if(markers[i].info.length) marker.setInfoBubble(markers[i].info);
    if(markers[i].o.label) marker.setLabel(markers[i].o.label);
    if(markers[i].o.click) marker.click.addHandler(this.hjq('createFunction', markers[i].o.click))
    if(markers[i].o.markerID) marker.setAttribute("markerID", markers[i].o.markerID);
    map.addMarker(marker);
    // the infoBubble option doesn't work unless it's set after the
    // marker is added
    marker.addData(markers[i].o);
  }

  // set up polylines
  for(var i=0; i<polylines.length; i++) {
    var points = [];
    for(var j=0; j<polylines[i].points.length; j++) {
      points.push(new mxn.LatLonPoint(polylines[i].points[j][0], polylines[i].points[j][1]));
    }
    var polyline = new mxn.Polyline(points);
    if(polylines[i].data.click) polyline.click.addHandler(this.hjq('createFunction', polylines[i].data.click))
    polyline.addData(polylines[i].data);
    map.addPolyline(polyline);
  }

  if(o['geolocate']) {
    navigator.geolocation.getCurrentPosition(function(position) {
      map.setCenterAndZoom(new mxn.LatLonPoint(position.coords.latitude, position.coords.longitude), parseInt(o['zoom'] || 15));
    });
  }
  if(o['centerLat'] && o['centerLon'] && o['zoom']) setTimeout(function() {map.setCenterAndZoom(new mxn.LatLonPoint(parseFloat(o['centerLat']), parseFloat(o['centerLon'])), parseInt(o['zoom']));}, 1);
  else map.autoCenterAndZoom();

  // click handler
  if(o.click) map.click.addHandler(this.hjq('createFunction', o.click));

  // helper function for updateXxxOnClick
  var setVal = function(v) {
    if(this.is(':input')) this.val(v);
    else this.text(v);
  }

  if(o.updateLatOnClick || o.updateLonOnClick) map.click.addHandler(function(event_name, event_source, event_args) {
    setVal.call($(o.updateLatOnClick), event_args.location.lat)
    setVal.call($(o.updateLonOnClick), event_args.location.lon)
  });

  if(o.updateAddressOnClick || o.updateLocalityOnClick || o.updateCountryOnClick || o.updateRegionOnClick) {
    var geocoder = new mxn.Geocoder(o['api'], function(location) {
      setVal.call($(o.updateAddressOnClick), location.street)
      setVal.call($(o.updateLocalityOnClick), location.locality)
      setVal.call($(o.updateRegionOnClick), location.region)
      setVal.call($(o.updateCountryOnClick), location.country)
    });
    map.click.addHandler(function(event_name, event_source, event_args) {
      geocoder.geocode(event_args.location);
    });
  }

  // markerOnClick works by removing all other markers and adding a
  // new one.   Should probably do a move instead, but...
  if(o.markerOnClick) map.click.addHandler(function(event_name, event_source, event_args) {
    jQuery.each(event_source.markers, function(i, marker) {
      marker.closeBubble();
    });
    event_source.removeAllMarkers();
    event_source.addMarker(new mxn.Marker(event_args.location));
  });

  // stash our object and options so we can find them again later, if needed.
  this.data('map', map);
  this.data('map_options', o)

  // hook for user setup
  if(o.setupjs) this.hjq('createFunction', o.setupjs).call(map);
};

hjq.mapstraction = {
  /* simulate click on lat/lon */
  clickOnLocation: function(map_selector, lat, lon) {
    var map = jQuery(map_selector).data('map');
    p = new mxn.LatLonPoint(lat, lon);
    map.setCenter(p);
    map.click.fire({location: p});
  },

  /* simulate click on geolocated address */
  clickOnAddress: function(map_selector, street, locality, region, country) {
    var map = jQuery(map_selector).data('map');
    var o = jQuery(map_selector).data('map_options');
    var set_center = function(location) {
      map.setCenter(location.point);
      map.click.fire({location: location.point});
    };
    var geocoder = new mxn.Geocoder(o['api'], function(location) {
      set_center(location);
      // sometimes the centering doesn't take, so try again in a bit.
      setTimeout(function() {set_center(location);}, 150);
    });
    geocoder.geocode({street: street, locality: locality, region: region, country: country});
  },

  /* find a marker given the markerID passed to the
     mapstraction-marker tag */
  findMarker: function(map_selector, marker_id) {
    var map = jQuery(map_selector).data('map');
    for(var i=0; i<map.markers.length; i++) {
      if(map.markers[i].getAttribute("markerID")==marker_id) return map.markers[i];
    }
  },

  /* open the info bubble for a marker */
  openMarker: function(map_selector, marker_id, exclusive) {
    var marker = hjq.mapstraction.findMarker(map_selector, marker_id);
    if(!marker) return;
    if(exclusive) {
      var map = jQuery(map_selector).data('map');
      jQuery.each(map.markers, function(i, m) {
        m.closeBubble();
      });
    }
    marker.openBubble();
  }
}
