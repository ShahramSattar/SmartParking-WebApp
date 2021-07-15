
var distance = require('google-distance-matrix');

distance.key('AIzaSyAIUoTxV4muEn397mise01hNeFIqrvvEdw');
distance.units('metric');
distance.mode('walking')

const getwdistance = function (origins, destinations, result, callback) {

    //console.log(arguments[0]);
    // expected output: 1
    ////////var origins = result.ParkingLocation;
    //for (i = 0; i < arguments[0].length; i++) {
     //   origins.push(arguments[0][i].latitude.toString() +","+arguments[0][i].longitude.toString());
   // }
    //////////var destinations=result.Destination;
   // for (i = 0; i < arguments[1].length; i++) {
     //   destinations.push(arguments[1][i].latitude.toString() +","+arguments[1][i].longitude.toString());
   // }
    distance.matrix(origins, destinations, function (err, distances) {
        if (err) {
            return console.log(err);
        }
        if (!distances) {
            return console.log('no distances');
        }
        if (distances.status == 'OK') {
            const distancesm=[], durationsm=[];
            for (var i = 0; i < origins.length; i++) {
                for (var j = 0; j < destinations.length; j++) {
                    var origin = distances.origin_addresses[i];
                    var destination = distances.destination_addresses[j];
                    if (distances.rows[0].elements[j].status == 'OK') {
                            var distance = distances.rows[i].elements[j].distance.text;
                            var distarray = distance.split(" ")
                            if(distarray[1]=="km"){
                                distancesm.push(parseFloat(distarray[0]));
                            }else if (distarray[1]=="m"){
                                distancesm.push(parseFloat(distarray[0])/1000);
                            }
                            //distancesm.push(distances.rows[i].elements[j].distance.text);
                            var duration = distances.rows[i].elements[j].duration.text;
                            var durarray = duration.split(" ");
                            if(durarray[1]== "mins"){
                                durationsm.push(parseFloat(durarray[0])/60);
                            }else if (durarray[1]== "min"){
                                durationsm.push(parseFloat(durarray[0])/60);
                            };
                       // console.log('Distance from ' + origin + ' to ' + destination + ' is ' + distance + ' and it takes ' + duration);
                    } else {
                        console.log(destination + ' is not reachable by land from ' + origin);
                    }
                }
                //result.origins=origins;
               // result.dest= destinations;
                //resultsAdd[i]=result;
            }
            result.WalkingDuration=durationsm;
            result.WalkingDistance=distancesm;
        }
        //var resultF=result;
        callback (null,result);

    });

}

module.exports = {
    getwdistance: getwdistance,
};
