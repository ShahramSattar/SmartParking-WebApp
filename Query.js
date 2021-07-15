var promise = require('bluebird');

var options = {
    // Initialization Options
    promiseLib: promise
};

var TrvTime = require('./TravelTime');

const pgp = require('pg-promise')(options);

var connectionString = 'postgres://localhost:5432/smartparking';

var db = pgp(connectionString); // database instance;

var customer, parking;

const createUser = (request, response) => {
    const {CurrentLoc} = request.body;
    const ObjLoc = JSON.parse(CurrentLoc);
    db.one('INSERT INTO users (UserID, geom,TravelDistance, TravelTime, Destination ,geomD, timeofloc) VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326),$4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326), $9) RETURNING id', [ObjLoc.UserID, parseFloat(ObjLoc.Lon), parseFloat(ObjLoc.Lat), parseFloat(ObjLoc.DitsKM), parseFloat(ObjLoc.TimeHr), ObjLoc.Destination, parseFloat(ObjLoc.DLon), parseFloat(ObjLoc.DLat), new Date(Date.now())])
        .then(data => {
            console.log(data.id); // print new user id;
        })
        .catch(error => {
            console.log('ERROR:', error); // print error;
        });
};

const QueryUsers = (request, response) => {
    db.query('SELECT id, UserID, ST_X(geom) as longitude, ST_Y(geom) as latitude, traveldistance, traveltime FROM users WHERE id IN (SELECT MAX(id) FROM users GROUP BY UserID)')
        .then(data => {
            response.status(200).json(JSON.stringify(data))
        })
        .catch(error => {
            console.log('ERROR:', error); // print error;
        });
};

const QueryUsersLast = (request, response) => {
    db.query('SELECT id, UserID, ST_X(geom) as longitude, ST_Y(geom) as latitude,ST_X(geomd) as longituded, ST_Y(geomd) as latituded, traveldistance, traveltime FROM users WHERE id IN (SELECT MAX(id) FROM users GROUP BY UserID)')
        .then(data => {
            response.status(200).json(JSON.stringify(data))
        })
        .catch(error => {
            console.log('ERROR:', error); // print error;
        });
};

const QueryParking = (request, response) => {
    db.query('SELECT id, ST_X(geom) as longitude, ST_Y(geom) as latitude, capacity, address, rate FROM torontogreenp')
        .then(data => {
            //console.log(JSON.stringify(data));
            response.status(200).json(JSON.stringify(data))
        })
        .catch(error => {
            console.log('ERROR:', error); // print error;
        });
};

const UpdateParking = function (calback) {
    var usersdata,parkingdata;
    db.task('my-task', t => {
        // t.ctx = task context object

        return t.query('SELECT UserID, ST_X(geom) as longitude, ST_Y(geom) as latitude,ST_X(geomd) as longituded, ST_Y(geomd) as latituded, ST_Transform(geomd, 26917) as geomdt, traveldistance, traveltime FROM users WHERE id IN (SELECT MAX(id) FROM users GROUP BY UserID)')
            .then(user => {
               //console.log(JSON.stringify(user));
                usersdata = user;
               return t.query('SELECT id, ST_X(geom) as longitude, ST_Y(geom) as latitude,geom, ST_Transform(geom, 26917) as geomT, capacity FROM torontogreenp WHERE ST_DWithin(ST_Transform(geom, 26917), $1, 1000)', [user[0].geomdt]);
            });
    })
        .then(data => {
            parkingdata = data;
            TrvTime.getdistance(usersdata,parkingdata, function (err, data) {
                if (err) {
                    return console.log(err);
                    calback(err);
                }
                if (data) {
                    console.log(JSON.stringify(data));
                    if(data.length!=0) {
                        db.one('INSERT INTO price (UserID, PID, WDist, WDur, Price, SW) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id', [data.Uid[0], data.Pid, data.WalkingDistance, data.WalkingDuration, JSON.stringify(data.Price.Price), JSON.stringify(data.Price.SW) ])
                            .then(data => {
                                console.log(data.id); // print new user id;
                            })
                            .catch(error => {
                                console.log('ERROR:', error); // print error;
                                callback(error, null);
                            });
                    }
                }
                //console.log(data.toString());

            });
            // success
            // data = as returned from the task's callback
        })
        .catch(error => {
            console.log('ERROR:', error); // print error;
        });

};


const QueryandAssign = (request, response, next) => {
    var user_id = request.param('id');
    //console.log(user_id.toString());
    //response.status(200).json({
       // message: "Data received successfully"
    //});

    var send = new Object();
    db.query('SELECT id, UserID,PID, WDist, WDur, Price, SW FROM price WHERE UserID = $1 AND id IN (SELECT MAX(id) FROM price GROUP BY UserID)',[user_id])
        .then(data => {
            //response.status(200).json(JSON.stringify(data))
            //console.log(JSON.stringify(data)); // print new user id;
            three_Top_Values(data,function (err, finalparkassign) {
                if (err) {
                    return next(err);
                    return console.log(err);
                }
                if (finalparkassign) {
                    //console.log(JSON.stringify(finalparkassign).toString());
                    //send.test=finalparkassign;
                   // console.log(JSON.stringify(send));
                    //response.status(200).json(JSON.stringify(send).toString());


                    return response.status(200).json({
                        message: JSON.stringify(finalparkassign).toString(),
                        price: JSON.stringify(data).toString()

                    });

                }

                });
            //getParkingInfo(T3Park)

        })
        .catch(error => {
            console.log('ERROR:', error); // print error;
        });
        //response.status(200).json(JSON.stringify(send));

};


function Kth_greatest_in_array(arr, k) {

    for (var i = 0; i < k; i++) {
        var max_index = i,
            tmp = arr[i];

        for (var j = i + 1; j < arr.length; j++) {
            if (arr[j] > arr[max_index]) {
                max_index = j;
            }
        }

        arr[i] = arr[max_index];
        arr[max_index] = tmp;
    }

    return arr[k - 1];
}

const three_Top_Values = function three_Top_Values(data, callback) {
    var jj=1;
    var pindex=[];
    var T3Park=[];
    var swf = data[0].sw[0].mwdata;
    var pidf = data[0].pid;
    db.query('SELECT id, capacity, address, lat, lng FROM torontogreenp WHERE id IN ($1:csv)', [pidf])
        .then(caf => {
            //console.log(JSON.stringify(caf));
            for (var i=0; swf.length;i++){
                var imax = Kth_greatest_in_array(data[0].sw[0].mwdata,jj);
                if(caf[swf.indexOf(imax)].capacity!=0){
                    pindex.push(swf.indexOf(imax));
                    jj=jj+1;
                }
                if(jj>3){
                    for (var i = 0; i < pindex.length; i++) {
                        caf[pindex[i]].index = pindex[i];
                        T3Park.push(caf[pindex[i]]);
                    }
                    break;
                }

            }
            callback(null, T3Park);

        })
        .catch(error => {
            console.log('ERROR:', error); // print error;
        });
}

module.exports = {
       createUser: createUser,
       QueryUsers: QueryUsers,
       QueryUsersLast:QueryUsersLast,
       QueryParking:QueryParking,
       UpdateParking:UpdateParking,
       QueryandAssign:QueryandAssign,
};
