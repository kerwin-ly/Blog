// Circle with Gradient

var width = 300,
    height = 300;

var svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height);

var gradient = svg.append("svg:defs")
    .append("svg:linearGradient")
    .attr("id", "gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "100%")
    .attr("spreadMethod", "pad");

 gradient.append("svg:stop")
    .attr("offset", "0%")
    .attr("stop-color", "#a00000")
    .attr("stop-opacity", 1);

gradient.append("svg:stop")
    .attr("offset", "100%")
    .attr("stop-color", "#aaaa00")
    .attr("stop-opacity", 1);

var circle = svg.append('circle')
    .attr('cx', width / 2)
    .attr('cy', height / 2)
    .attr('r', height / 3)
    .attr('fill', 'url(#gradient)');


