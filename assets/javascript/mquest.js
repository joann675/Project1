var myapikey = mapQuestKey;


var database = firebase.database();
var start;
var end;
var restaurantName;
var dateString;
function showMap() {
    console.log(this);
    end = $(this).attr("endAddress");
    restaurantName = $(this).attr("restaurantName");
    
    var convertedDate =  moment($("#date").val(), "MM/DD/YYYY");
    dateString = convertedDate.format("YYYY/MM/DD");
    console.log("Date string = " + dateString);
    console.log("Restaurant name " + restaurantName);
    console.log("Ending address " + end);



    start = $("#startAddress").val().trim();

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

};

function saveTrip() {
    console.log("In save trip");
    
    
    var newTrip = {
        date: dateString,
        city: myCity,
        restaurantName: restaurantName,
        restaurantAddr: end,
        startLoc: start

    };
    console.log(newTrip);

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
            views: {
                listMonth: { buttonText: 'list month' }
              },
              header: {
                left: 'title',
                center: '',
                right: 'today,month,listMonth,prev,next'
              },
            events: eventArray,
 
        })
    });
});