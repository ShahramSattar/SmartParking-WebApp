var getdistw = require('./getwalking');
var matlab = require('./MatlabCost');
var distanceDr = require('google-distance-matrix');
distanceDr.key('AIzaSyAIUoTxV4muEn397mise01hNeFIqrvvEdw');
distanceDr.units('metric');
distanceDr.mode('driving');

//var qquery = require('./Query');

var result=new Object();
var resultsAdd=[];


const getdistance = function getdistance(user, parking, callback) {

    // console.log(arguments[0]);
    // expected output: 1
    var origins = [];
    var DestF = [], userid=[];
    for (i = 0; i < arguments[0].length; i++) {
        origins.push(arguments[0][i].latitude.toString() +","+arguments[0][i].longitude.toString());
        DestF.push(arguments[0][i].latituded.toString() +","+arguments[0][i].longituded.toString());
        userid.push(arguments[0][i].userid.toString())
    }
    var destinations=[], capacity=[], id=[];
    for (i = 0; i < arguments[1].length; i++) {
        destinations.push(arguments[1][i].latitude.toString() +","+arguments[1][i].longitude.toString());
        capacity.push(parseFloat(arguments[1][i].capacity));
        id.push(arguments[1][i].id);
    }
    distanceDr.matrix(origins, destinations, function (err, distances) {
        if (err) {
            return console.log(err);
        }
        if (!distances) {
            return console.log('no distances');
        }
        if (distances.status == 'OK') {
            for (var i = 0; i < origins.length; i++) {
                var distancesm=[], durationsm=[];
                for (var j = 0; j < destinations.length; j++) {
                    var origin = distances.origin_addresses[i];
                    var destination = distances.destination_addresses[j];
                    if (distances.rows[i].elements[j].status == 'OK') {
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
                        var durationhr=0;
                        if(durarray[1]== "hours") {
                            durationhr += parseFloat(durarray[0]);

                        }else if(durarray[1]== "mins"){
                            durationhr += parseFloat(durarray[0])/60;

                        }else if(durarray[1]== "min"){
                            durationhr += parseFloat(durarray[0])/60;
                        }
                        durationsm.push(durationhr);
                        // durationsm.push(distances.rows[i].elements[j].duration.text);
                       // console.log('Distance from ' + origin + ' to ' + destination + ' is ' + distance + ' and it takes ' + duration);
                    } else {
                        console.log(destination + ' is not reachable by land from ' + origin);
                    }
                }
                result.Pid=id;
                result.Uid=userid;
                //result.Origin=origins;
                //result.Destination=DestF;
                //result.ParkingLocation= destinations;
                result.capacity=capacity;
                result.DurationsToP=durationsm;
                result.DistancesToP=distancesm;
                getdistw.getwdistance(destinations, DestF, result,function (err, distdata) {
                    var distdataid=[];
                    if (err) {
                        return console.log(err);
                    }
                    if (distdata) {
                       // console.log(JSON.stringify(distdata));
                        distdataid.Uid = distdata.Uid;
                        distdataid.Pid=distdata.Pid;
                        matlab.calculatePrice(JSON.stringify(distdata),function (err, pricedata) {
                            if (err) {
                                return console.log(err);
                            }
                            if (pricedata) {
                                //console.log(JSON.stringify(pricedata));
                                distdata.Price = pricedata;
                                callback(null,distdata);
                                //resultsAdd.push(distdata);
                                //qquery.InsertPrice(pricedata, distdataid, function (err, calculatedproce){
                                    if (err) {
                                        return console.log(err);
                                    }
                                   // if (calculatedproce) {
                                    //    console.log("Successfully calculated and stored")
                                   // }

                               // });
                            }
                            //console.log(data.toString());

                        });

                    }
                    //console.log(data.toString());

                });
                //var result1  = getdistw.getwdistance(result);
            }
        }
    });

};

module.exports = {
    getdistance: getdistance,
};
