/* Calling the 3 functions together will cause an undefined object bug in JS.
$(function(){
  // sunBurst({name: "NYCHA Repair Violations", children: gon.sunburst_data});
  console.log("gon.man_sunburst_data: " + gon.man_sunburst_data);
  console.log("gon.bx_sunburst_data: " + gon.bx_sunburst_data);
  console.log("gon.bk_sunburst_data: " + gon.bk_sunburst_data);
  //debugger;
  zoomBurst(gon.man_sunburst_data, ".man-burst");
  zoomBurst(gon.bx_sunburst_data, ".bx-burst");
  zoomBurst(gon.bk_sunburst_data, ".bk-burst");
}) */

var jsonObject = {
 "name": "flare",
 "children": [
  {
   "name": "analytics",
   "children": [
    {
     "name": "cluster",
     "children": [
      {"name": "AgglomerativeCluster", "count": 3938},
      {"name": "CommunityStructure", "count": 3812},
      {"name": "MergeEdge", "count": 743}
     ]
    },
    {
     "name": "graph",
     "children": [
      {"name": "BetweennessCentrality", "count": 3534},
      {"name": "LinkDistance", "count": 5731}
     ]
    }
   ]
  }
 ]
};

function zoomBurst(root_data, boro) {
  var root = jsonObject; // test data
  // var root = { name: "NYCHA Repair Violations", children: root_data };

  console.log(root);

  var width = 960,
    height = 700,
    radius = Math.min(width, height) / 2;

  var x = d3.scaleLinear().range([0, 2 * Math.PI]);
  var y = d3.scaleLinear().range([0, radius]);
  //var y = d3.scaleSqrt().range([0, radius]);

  //var color = d3.scale.category20c(); // v3
  var color = d3.scaleOrdinal()
                .domain(root)
                .range(d3.schemeSet3);  // v5

  var svg = d3.select(boro)
    .append("svg")
    .attr("class", "col-md-offset-1")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2 ) + ")");

  //var partition = d3.layout.partition(root)
  //   .value(function(d) { return d.count; }); // v3
  var partition = d3.partition(); //.size([2 * Math.PI, radius]);

  var arc = d3.arc() // v5
      .startAngle(function(d) {
        return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); 
      })
      .endAngle(function(d) {
        return Math.max(0, Math.min(2 * Math.PI, x(d.x1)));
      })
      .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
      .outerRadius(function(d) { return Math.max(0, y(d.y1)); });

  root = d3.hierarchy(root)
           .sum(d => d.count);

  svg.selectAll("path")
     .data(partition(root).descendants())
     .enter()
     .append("g")
     .attr("class", "node");

  var path = svg.selectAll(".node")
    .append("path")
    .attr("d", arc)
    .style("fill", function(d) {
      return color((d.children ? d : d.parent).data.name);
    })
    .on("click", click);

  var text = svg.selectAll(".node")
    .append("text")
    .attr("transform", function(d) {
      return "rotate(" + computeTextRotation(d) + ")";
    })
    .attr("x", function(d) { return y(d.y0); })
    .attr("dx", "6") // margin
    .attr("dy", ".35em") // vertical-align
    .text(function(d) {
      return d.data.name === "root" ? "" : d.data.name;
    });

  function click(d) {
    // fade out all text elements
    text.transition().attr("opacity", 0);

    path.transition()
      .duration(750)
      .tween("scale", function() {
        var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
            yd = d3.interpolate(y.domain(), [d.y0, 1]),
            yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
        return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
      })
      .selectAll("path")
      .attrTween("d", function(d) {
        return function() { return arc(d); };
      })
      .on("end", function(e, i) {
        // check if the animated element's data e lies within the visible
        // angle span given in d
        if (e.x0 > d.x0 && e.x0 < d.x1) {
          // get a selection of the associated text element
          var arcText = d3.select(this.parentNode).select("text");
          // fade in the text element and recalculate positions
          arcText.transition().duration(750)
            .attr("opacity", 1)
            .attr("class", "visible")
            .attr("transform", function() {
              return "rotate(" + computeTextRotation(e) + ")";
            })
            .attr("x", function(d) { return y(d.y0); })
            .text(function(d) {
              return d.data.name === "root" ? "" : d.data.name;
            });
         }
      });
  }

  d3.select(self.frameElement).style("height", height + "px");

  function computeTextRotation(d) {
    return (x((d.x0 + d.x1) / 2) - Math.PI / 2) / Math.PI * 180;
  }
}
