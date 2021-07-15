// Import the leaflet package
var L = require('leaflet');

// Creates a leaflet map binded to an html <div> with id "map"
// setView will set the initial map view to the location at coordinates
// 13 represents the initial zoom level with higher values being more zoomed in
var map = L.map('map').setView([43.659752, -79.378161], 12);

// Adds the basemap tiles to your web map
// Additional providers are available at: https://leaflet-extras.github.io/leaflet-providers/preview/
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 21
}).addTo(map);

// Adds a popup marker to the webmap for GGL address
//L.circleMarker([43.659752, -79.378161]).addTo(map)
// .bindPopup(
//    'MON 304<br>' +
//    'Monetary Times Building<br>' +
//    '341 Victoria Street<br>' +
//   'Toronto, Ontario, Canada<br>' +
//   'M5B 2K3<br><br>' +
//    'Tel: 416-9795000 Ext. 5192'
// )
// .bindPopup();
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};
var geojsonMarkerOptions_Cars = {
    radius: 8,
    fillColor: "#20ff17",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

//-------------------------------------------------------------
var markers = {};
function setMarkers(data) {
    data.BMS.forEach(function (obj) {
        if (!markers.hasOwnProperty(obj.id)) {
            markers[obj.id] = L.circleMarker([obj.lat, obj.long], geojsonMarkerOptions_Cars).addTo(map);

                markers[obj.id].previousLatLngs = [];
        } else {
            markers[obj.id].previousLatLngs.push(markers[obj.id].getLatLng());
            markers[obj.id].setLatLng([obj.lat, obj.long]);
        }
    });
}
var json = {
    "BMS":[{
        "id": 'A',
        "lat": -45,
        "long": -45
    },{
        "id": 'B',
        "lat": 45,
        "long": -45
    }]
}

setMarkers(json);

var updatedJson = {
    "BMS":[{
        "id": 'A',
        "lat": -45,
        "long": 45
    },{
        "id": 'B',
        "lat": 45,
        "long": 45
    }]
}


window.setInterval(function(){
    UpdateUser();
    updateParking();
}, 500);

//--------------------------------------------------------------
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.description) {
        layer.bindPopup(feature.properties.description);
    }
}
//-----------------------------------------------------------------
$.getJSON("SFP.json", function(data) {
    //console.log(data)
    data.forEach(function(element) {
        //console.log(element);
        L.circleMarker([element.Lat, element.Long_], geojsonMarkerOptions).addTo(map).bindPopup(
            'The Address is: '+ element.Address.bold() +'<br>' +
            'The Capacity of Parking is: ' + element.Capacity.toString().bold()
        )
    });
});

function UpdateUser() {
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: '/jquery/getdata',
        timeout: 5000,
        success: function(data, textStatus ){
            //alert('request successful');
            JData = JSON.parse(data);
            JData.forEach(function(element) {
                console.log(element);
            });

            JData.forEach(function (obj) {
                if (!markers.hasOwnProperty(parseFloat(obj.userid))) {
                    markers[parseFloat(obj.userid)] = L.circleMarker([obj.latitude, obj.longitude], geojsonMarkerOptions_Cars).addTo(map).bindPopup(
                        'Travel Time : '+ obj.traveltime.toString().bold() + ' min'+'<br>' +
                        'Travel Distance : '+ obj.traveldistance.toString().bold() + ' km'
                    ).openPopup();
                    markers[parseFloat(obj.userid)].previousLatLngs = [];
                } else {
                    markers[parseFloat(obj.userid)].previousLatLngs.push(markers[parseFloat(obj.userid)].getLatLng());
                    markers[parseFloat(obj.userid)].setLatLng([obj.latitude, obj.longitude]).bindPopup('Travel Time : '+ obj.traveltime.toString().bold() + ' min'+'<br>' +
                        'Travel Distance : '+ obj.traveldistance.toString().bold() + ' km'
                    ).bindPopup();
                }
            });

        },

        fail: function(xhr, textStatus, errorThrown){
            //alert('request failed');
        }
    });
}

function updateParking() {
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: '/jquery/getParkingData',
        timeout: 5000,
        success: function(data, textStatus ){
            //alert('request successful');
            JData = JSON.parse(data);
            JData.forEach(function(element) {
               // console.log(element);
            });

            JData.forEach(function (obj) {
                //console.log(element);
                L.circleMarker([obj.latitude, obj.longitude], geojsonMarkerOptions).addTo(map).bindPopup(
                    'The Address is: '+ obj.address.bold() +'<br>' +
                    'The Capacity of Parking is: ' + obj.capacity.bold() +'<br>' +
                    'Parking Rate: ' + obj.rate.bold(),
                )
            });

        },

        fail: function(xhr, textStatus, errorThrown){
            //alert('request failed');
        }
    });
}
