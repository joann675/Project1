$(document).ready(function() {

    // page is now ready, initialize the calendar..
    $('#calendar').fullCalendar({
        weekends: true,
        dayClick: function(date, jsEvent, view) {

            alert('Clicked on: ' + date.format());

        },
        defaultView: 'month'
        
    });
  


});
