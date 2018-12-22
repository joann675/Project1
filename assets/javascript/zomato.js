var myConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: ""
};

myConfig.apiKey = config.apiKey
myConfig.authDomain = config.authDomain;
myConfig.databaseURL = config.databaseURL;


myConfig.projectId = config.projectId;
myConfig.storageBucket = config.storageBucket;
myConfig.messagingSenderId = config.messagingSenderId
firebase.initializeApp(myConfig);

var database = firebase.database();
var myCity = "";
var cityId = "3784";
var cuisineId = "25";
var myApiKey = zomatoKey;

// Assumes we already have city id and cuisine id
$("#getRestaurants").on("click", function () {

    $.ajax({

        url: "https://developers.zomato.com/api/v2.1/search?entity_id=" + cityId + "&entity_type=city&cuisines="
            + cuisineId + "&sort=cost",
        dataType: 'json',
        async: true,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('user-key',
                myApiKey);
        },  // This inserts the api key into the HTTP header
        success: function (response) {
            $("#CuisineList > tbody").remove();
            console.log(response);
            var restaurantArray = response.restaurants;
            for (var i = 0; i < restaurantArray.length; i++) {
                var newRow = $("<tr class='item'>").append(
                    $("<td class='name'>").text(restaurantArray[i].restaurant.name),
                    $("<td class='address'>").text(restaurantArray[i].restaurant.location.address)

                );
                newRow.attr("endAddress", restaurantArray[i].restaurant.location.address);
                newRow.on("click", showMap);

                // Append the new row to the table
                $("#RestaurantList > tbody").append(newRow);
            }

        }
    });



});

$("#getCuisines").on("click", function () {
    myCity = $("#cityName").val().trim();
    populateDropDown(myCity);


});


function getCityCodeAndListOfCuisines(city) {
    console.log("Getting city code through ajax for " + city);

    $.ajax({

        url: "https://developers.zomato.com/api/v2.1/cities?q=" + city,
        dataType: 'json',
        async: true,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('user-key',
                myApiKey);
        },  // This inserts the api key into the HTTP header
        success: function (response) {
            console.log(response);
            // Creates local "temporary" object for holding city data
            var newCity = {
                name: city,
                id: response.location_suggestions[0].id,

            };


            // Uploads city data to the database
            database.ref("cities").push(newCity);
            getListOfCuisines(response.location_suggestions[0].id);


        }
    });
}


function getListOfCuisines(cityId) {
    console.log("Getting list of cuisines through ajax for " + cityId);

    $.ajax({

        url: "https://developers.zomato.com/api/v2.1/cuisines?city_id=" + cityId,
        dataType: 'json',
        async: true,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('user-key',
                myApiKey);
        },  // This inserts the api key into the HTTP header
        success: function (response) {
            // Creates local "temporary" object for holding city data
            database.ref("cuisines").remove();
            console.log(response);
            console.log("length = " + response.cuisines.length);
            for (var i = 0; i < response.cuisines.length; i++) {

                var newCuisine = {

                    name: response.cuisines[i].cuisine.cuisine_name,
                    id: response.cuisines[i].cuisine.cuisine_id

                };

                database.ref("cuisines").push(newCuisine);
                var newRow = $("<tr class='item'>").append(
                    $("<td class='cuisine'>").text(response.cuisines[i].cuisine.cuisine_name),



                );
                newRow.attr("cuisineId", response.cuisines[i].cuisine.cuisine_id);
                newRow.on("click", setCuisineId);

                // Append the new row to the table
                $("#CuisineList > tbody").append(newRow);
            }


        }
    });
}
function setCuisineId() {
    console.log(this);
    cuisineId = $(this).attr("cuisineId");
    console.log("Cuisine chosen = " + cuisineId);

}

function populateDropDown(myCity) {

    // Check if myCity is already in database
    var cityExists = false;
    database.ref("cities").once('value', function (snap) {

        snap.forEach(function (cityData) {
            
            if (cityData.val().name === myCity) {
                console.log("Found City data = " + cityData)
                cityId = cityData.val().id;
                cityExists = true;
                getListOfCuisines(cityId);
            }
        });
        if (cityExists === false)
            cityId = getCityCodeAndListOfCuisines(myCity);



    });

}

function showMap() {
    console.log(this);
    var end = $(this).attr("endAddress");
    console.log(end);
   

    var start;
    database.ref("startAddress").once('value', function (snap) {
        
        start = snap.val();

        console.log(start);
         var queryURL = "http://www.mapquestapi.com/directions/v2/route?key=" + mqapikey + "&from=" +
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
                
                var queryURL = "http://www.mapquestapi.com/traffic/v2/incidents?key=" + mqapikey + "&boundingBox=" +
                    coordinates1 +","+ coordinates2 + ","+ coordinates3 + ","+ coordinates4 + "&filters=construction,incidents";


                $.ajax({
                    url: queryURL,
                    method: "GET"
                }).then(function (response) {
                    console.log(response);
                    var numIncidents = response.incidents.length;
                    console.log("Traffic = " + numIncidents);
                })
            })
    });
};












