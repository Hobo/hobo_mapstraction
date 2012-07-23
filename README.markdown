This is a plugin for [Hobo](http://hobocentral.net) that wraps the [mapstraction](http://mapstraction.com/) library.

### Installation

First [download mapstraction](https://github.com/mapstraction/mxn/downloads) and unzip it into `public/mxn`.

Then install the plugin

    hobo generate install_plugin hobo_mapstraction git://github.com/Hobo/hobo_mapstraction.git

Then add this to `front_site.dryml` or another appropriate location:

    <extend tag="page">
      <old-page merge>
        <append-page-scripts:>
          <script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?key=YOUR_KEY_HERE&sensor=false"></script>
          <script src="/mxn/mxn.js?(googlev3,[geocoder])" type="text/javascript"></script>
        </append-page-scripts:>
      </old-page>
    </extend>

Be sure to replace YOUR_KEY_HERE with the API key you [get from Google](https://developers.google.com/maps/documentation/javascript/tutorial#api_key).    `googlev3` may be replaced with 'google', 'googlev3', 'yahoo', 'microsoft', 'openstreetmap', 'multimap', 'map24', 'openlayers' or 'mapquest'.  If so, the proceeding line would also have to be modified accordingly.

The source for this plugin lives at git://github.com/Hobo/hobo_mapstraction.   Pull requests are welcome.

Documentation for this plugin is in the DRYMLDoc.   It will be visible on [the hobo cookbook](http://cookbook.hobocentral.net) once the author pushes it there.  Until then it may be viewed directly in the source in the taglibs directly.

### License

See MIT-LICENSE

