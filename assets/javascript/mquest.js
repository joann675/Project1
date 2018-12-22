var myapikey = mapQuestKey;


var database = firebase.database();
function showMap() {
    console.log(this);
    var end = $(this).attr("endAddress");
    console.log("Ending address " + end);
    var start;
    database.ref("startAddress").once('value', function (snap) {
        
        start = snap.val();

        console.log("Starting address  " + start);
        $("#RestaurantList > tbody").remove();
         var queryURL = "http://www.mapquestapi.com/directions/v2/route?key=" + myapikey + "&from=" +
            start + "&to=" + end;


        $.ajax({
            url: queryURL,
            method: "GET"
        })

            .then(function (response) {
                console.log(response);

                var results = response;
                var distance = results.route.distance;
                var time = results.route.time;
                var coordinates1 = results.route.boundingBox.ul.lng;
                var coordinates2 = results.route.boundingBox.ul.lat;
                var coordinates3 = results.route.boundingBox.lr.lng;
                var coordinates4 = results.route.boundingBox.lr.lat;
                
                var imageSrc ="https://www.mapquestapi.com/staticmap/v5/map?start="+start+"&end="+end+"&size=@2x&key=" + myapikey;
                console.log(imageSrc);
                var newImage = $("<img>");
                newImage.attr("src",imageSrc);
                $("#mapImage").append(newImage);


                
               
            })
    });
};

