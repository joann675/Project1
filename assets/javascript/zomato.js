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
    var cuisineString =  $("#cuisine").val();
    var cuisineArray = cuisineString.split(","); 
    cuisineId = cuisineArray[0];
    console.log(cuisineId);
    // database.ref("startAddress").push($("#startAddress").val().trim());



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
                newRow.attr("restaurantName", restaurantArray[i].restaurant.name);
                newRow.on("click", showMap);

                // Append the new row to the table
                $("#RestaurantList > tbody").append(newRow);
            }

        }
    });



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
		

            $("#cuisine").empty();
            for (var i = 0; i < response.cuisines.length; i++) {

                var newCuisine = {

                    name: response.cuisines[i].cuisine.cuisine_name,
                    id: response.cuisines[i].cuisine.cuisine_id

                };

                database.ref("cuisines").push(newCuisine);


                $("#cuisine").append("<option>" + response.cuisines[i].cuisine.cuisine_id+","+response.cuisines[i].cuisine.cuisine_name + "</option>");


            }


        }
    });
}
function setCuisineId() {
    console.log(this);
    cuisineId = $(this).attr("cuisineId");
    console.log("Cuisine chosen = " + cuisineId);

}

$("#cityName").change(function () {
    myCity = $("#cityName").val();

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

})



