const calculatePrice = function calculatePrice(userontrack, callback)
{
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

    // A new XMLHttpRequest object
    var request = new XMLHttpRequest();
    //Use MPS RESTful API to specify URL
    var url = "http://localhost:9910/ParkingAssign/ParkingAssign";

    //Use MPS RESTful API to specify params using JSON
    var params = { "nargout":1,
        "rhs": [userontrack] };

    //document.getElementById("request").innerHTML = "URL: " + url + "<br>"
        //+ "Method: POST <br>" + "Data:" + JSON.stringify(params);

    request.open("POST", url);

    //Use MPS RESTful API to set Content-Type
    request.setRequestHeader("Content-Type", "application/json");

    request.onload = function()
    {   //Use MPS RESTful API to check HTTP Status
        if (request.status == 200)
        {
            // Deserialization: Converting text back into JSON object
            // Response from server is deserialized
            var result = JSON.parse(request.responseText);

            //Use MPS RESTful API to retrieve response in "lhs"
            if('lhs' in result){
            //{  document.getElementById("error").innerHTML = "" ;
              //  document.getElementById("price_of_bond_value").innerHTML = "Bond Price: " + result.lhs[0].mwdata;
                //console.log(JSON.stringify(result.lhs[0].mwdata.Price[0].mwdata));
                callback(null,result.lhs[0].mwdata)
            }
            else {  "Error: " + result.error.message; }
        }
    }
    //Serialization: Converting JSON object to text prior to sending request
    request.send(JSON.stringify(params));
}

module.exports = {
    calculatePrice: calculatePrice,
};
