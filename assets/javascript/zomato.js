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
var myCityAndState = "";
var cityId = "3784";
var cuisineId = "25";
var myApiKey = zomatoKey;

// Assumes we already have city id and cuisine id
$("#getRestaurants").on("click", function () {
    var cuisineString = $("#cuisine").val();
    var cuisineArray = cuisineString.split(",");
    cuisineId = cuisineArray[0];
    console.log(cuisineId);
    // database.ref("startAddress").push($("#startAddress").val().trim());


    var url = "https://developers.zomato.com/api/v2.1/search?entity_id=" + cityId + "&entity_type=city&cuisines="
    + cuisineId + "&sort=rating";
    $.ajax({

        url: url,
        dataType: 'json',
        async: true,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('user-key',
                myApiKey);
        },  // This inserts the api key into the HTTP header
        success: function (response) {
            console.log("Url = " + url);
            $("#RestaurantList > tbody").empty();
           
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



function getCityCodeAndListOfCuisines(cityAndState) {
    

    console.log("Getting city code through ajax for " + cityAndState);

    $.ajax({

        url: "https://developers.zomato.com/api/v2.1/cities?q=" + cityAndState,
        dataType: 'json',
        async: true,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('user-key',
                myApiKey);
        },  // This inserts the api key into the HTTP header
        success: function (response) {
            console.log(response);
            // Creates local "temporary" object for holding city data
            var found = false;
            for (var i = 0; i < response.location_suggestions.length; i++) {
                console.log("Comparing <" + response.location_suggestions[i].name + "> to <" + cityAndState + ">");
                if (response.location_suggestions[i].name === cityAndState) {
                    console.log("Found a match");
                    found = true;
                    var newCity = {
                        name: cityAndState,
                        id: response.location_suggestions[i].id,

                    };
                    console.log("About to push city to database for " + newCity.name);
                    // Uploads city data to the database
                    database.ref("cities").push(newCity);
                    cityId = newCity.id;
                    getListOfCuisines();
                    break;
                }

            }

   


        }
    });
}


function getListOfCuisines() {
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

                // database.ref("cuisines").push(newCuisine);


                $("#cuisine").append("<option>" + response.cuisines[i].cuisine.cuisine_id + "," + response.cuisines[i].cuisine.cuisine_name + "</option>");


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
    myCityAndState = $("#cityName").val();
    var cityAndStateArray = myCityAndState.split(",");
    var myCity = cityAndStateArray[0];
    myCity = myCity.charAt(0).toUpperCase() + myCity.slice(1).toLowerCase();

    var myState = cityAndStateArray[1];
    myState = myState.toUpperCase().trim();
    myCityAndState = myCity + ", " + myState;


    // Check if myCity is already in database
    var cityExists = false;
    database.ref("cities").once('value', function (snap) {

        snap.forEach(function (cityData) {

            if (cityData.val().name === myCityAndState) {
                console.log("Found City data = " + cityData)
                cityId = cityData.val().id;
                cityExists = true;
                getListOfCuisines();
            }
        });
        if (cityExists === false)
            getCityCodeAndListOfCuisines(myCityAndState);



    });

})



