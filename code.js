var width = 1440, //svg size
  height = 450;

var color = d3
  .scaleLinear()
  .range([
    "white",
    "#e6f5e1",
    "#c8eac1",
    "#a2da9c",
    "#75c577",
    "#3fad5d",
    "#1d8c43",
    "#006d28"
  ]) //colors
  .domain([10, 20, 30, 40, 50, 60, 70, 80]); //the range of values by which colors will be determined

var tooltip = d3
  .select("#graph") //add div for tooltips
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

const zoom = d3.zoom();

function res_zoom() {
  svg.call(zoom.transform, d3.zoomIdentity);
}

zoom.on("zoom", function () {
  svg.attr("transform", d3.event.transform);
});
var svg = d3
  .select("#graph") //add svg for choropleth
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g");

svg.call(zoom);

var projection = d3
  .geoAlbers()
  .rotate([-105, 0])
  .center([-10, 65])
  .parallels([52, 64])
  .scale(700) //choropleth scale inside svg element
  .translate([width / 2, height / 2]);

var path = d3.geoPath().projection(projection);

//reading map file and data

queue()
  .defer(
    d3.json,
    "https://raw.githubusercontent.com/ajdivotf/quality-of-life-index/main/files/russia.json"
  ) //load json with map
  .defer(
    d3.csv,
    "https://raw.githubusercontent.com/ajdivotf/quality-of-life-index/main/files/dataset.csv"
  ) //load dataset
  .await(ready);

//start with choropleth

function ready(error, map, data) {
  var rateById = {};
  var nameById = {};

  data.forEach(function (d) {
    rateById[d.map_region_name] = +d.index; //quality of life index
    nameById[d.map_region_name] = d.region_name_rus;
  });

  //drawing choropleth
  features = topojson.feature(map, map.objects.name); //name from russia.json
  _Global_features = features;

  svg
    .append("g")
    .attr("class", "region")
    .selectAll("path")
    .data(features.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", function (d) {
      return color(rateById[d.properties.NAME_1]);
    })
    .style("opacity", 0.8)

    //hover activity
    .on("mouseover", function (d) {
      d3.select(this).style("opacity", 1);
      tooltip.style("opacity", 1);
      tooltip
        .html(
          `<span>${rateById[d.properties.NAME_1]}%</span><br/>${
            nameById[d.properties.NAME_1]
          }`
        ) //outputting results from a dataset to a tooltip
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 30 + "px");
    })
    .on("mouseout", function () {
      d3.select(this).style("opacity", 0.8);
      tooltip.style("opacity", 0);
    });
}
