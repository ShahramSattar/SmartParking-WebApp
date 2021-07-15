var express = require('express');
var router = express.Router();

var db = require('../Query');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/ListenToLoc', function(req, res) {

  var data = req.body;
  var ObjLoc = JSON.parse(data.CurrentLoc);
  //webmap.setMarkers(ObjLoc);
  res.send('Location has been received');
});


router.post('/api/puppies', db.createUser);
router.post('/api/AssignParking', db.QueryandAssign);
router.get('/jquery/getdata', db.QueryUsers);
router.get('/jquery/getParkingData', db.QueryParking);
router.get('/jquery/UpdateAllocation',db.QueryUsersLast);

setInterval(function () {
  router.get('/',db.QueryUsersLast);
  //var iid = db.QueryParking;
}, 10000);


module.exports = router;
