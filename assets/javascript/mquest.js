var myapikey = mapQuestKey;


var database = firebase.database();
var start;
var end;
var restaurantName;
function showMap() {
    console.log(this);
    end = $(this).attr("endAddress");
    console.log("Ending address " + end);

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

                var imageSrc = "https://www.mapquestapi.com/staticmap/v5/map?start=" + start + "&end=" + end + "&size=@2x&key=" + myapikey;
                console.log(imageSrc);
                var newImage = $("<img>");
                newImage.attr("src", imageSrc);
                var newButton = $("<button>");
                newButton.html("Save Trip");
                newButton.on("click", saveTrip);
                $("#mapImage").append(newImage);
                $("#mapImage").append(newButton);




            })
    });
};

function saveTrip() {
    var newTrip = {
        date: "01/01/2019",
        city: myCity,
        restaurantName: "Houlihans",
        restaurantAddr: end,
        startLoc: start


    };

    database.ref("trips").push(newTrip);
}

var eventArray = [];
$(document).ready(function () {
    database.ref("trips").once('value', function (snap) {

        snap.forEach(function (trip) {
            console.log(trip.val().restaurantName);
            var event = {
                title: trip.val().restaurantName + "/" + trip.val().city,
                start: trip.val().date,
                end: trip.val().date,
                allDay: true,
                color: "blue",
            };
            eventArray.push(event);

        })


        $('#calendar').fullCalendar({
            weekends: true,
            defaultView: 'month',
            events: eventArray

        })
    });
});