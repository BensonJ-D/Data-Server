$(function () {
    "use strict";

    var svgWidth = 600, svgHeight = 400;
    var margin = { top: 20, right: 20, bottom: 50, left: 50 };
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;      
    var svg, g, x, y;

    svg = d3.select('svg')
            .attr("width", svgWidth)
            .attr("height", svgHeight);

    svg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "white");

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear().rangeRound([0, width]);
    var y = d3.scaleLinear().rangeRound([height, 0])

    x.domain([0, 20]);
    y.domain([0, 100]);


    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
                                    + 'support WebSockets.'} ));
        return;
    }

    // open connection
    var connection = new WebSocket('ws://127.0.0.1:1337');

    connection.onopen = function () {
        drawChart();
        console.log("Connected?")
    };

    connection.onerror = function (error) {

    };

    // most important part - incoming messages
    connection.onmessage = function (message) {
        var json;
        try {
            json = JSON.parse(message.data);
            console.log(json);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }

        for(var i = 0; i < json.length - 2; i+=2)        {
            plotSegment(json[i], json[i+1], json[i+2], json[i+3]);
        }
    };

    $("#submit").click(() => { console.log("Int. Volt: " + $("#settings input[name=init_voltage]").val()); });

    /**
     * This method is optional. If the server wasn't able to respond to the
     * in 3 seconds then show some error message to notify the user that
     * something is wrong.
     */
    setInterval(function() {
        if (connection.readyState !== 1) {
            status.text('Error');
            input.attr('disabled', 'disabled').val('Unable to comminucate '
                                                 + 'with the WebSocket server.');
        }
    }, 3000);

    function drawChart(data) {  
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", "1rem")
            .attr("fill", "#000")
            .attr("x", 280)
            .attr("y", 38)
            .attr("text-anchor", "end")
            .text("Voltage (V)")
            .select(".domain")
            .remove();

        g.append("g")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", "1rem")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("x", -150)
            .attr("y", -45)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Current (A)");
    }
    function plotSegment(x1, y1, x2, y2)
    {
        var seg = d3.line()
            .x(function(d) { return x(d.x); })
            .y(function(d) { return y(d.y); });
        var path = g.append("path");
        var data = [{x: parseFloat(x1), y: parseFloat(y1)}, {x: parseFloat(x2), y: parseFloat(y2)}];
        path.datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 0.2)
            .attr("d", seg);
        if(parseFloat(x1)>parseFloat(x2)){
            path.attr("stroke", "orangered")
        }
    }
});
