
function makeResponsive() {

  // if the SVG area isn't empty when the browser loads, remove it
  // and replace it with a resized version of the chart
  var svgArea = d3.select("body").select("svg");
  svgArea.html("");
  if (!svgArea.empty()) {
      svgArea.remove();
  }

  var svgWidth = 900 || window.innerWidth;
  var svgHeight = 600 || window.innerHeight;

  var margin = {
      top: 60,
      right: 100,
      bottom: 140,
      left: 100
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // attempt at rendering linear regression lines on the scatter

  // Create an SVG wrapperappend an SVG group that will hold our chart,
  // and shift the latter by left and top margins.
  var svg = d3
      .select("#scatter")
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight);

  // Append an SVG group
  var chartGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
  var chosenXAxis = "ethopen";

  // function used for updating x-scale var upon click on axis label
  function xScale(coindata, chosenXAxis) {
      // create scales
      var xLinearScale = d3.scaleLinear()
          .domain([d3.min(coindata, d => d[chosenXAxis]) * 0.8,
              d3.max(coindata, d => d[chosenXAxis]) * 1.2
          ])
          .range([0, width]);

      return xLinearScale;

  }

  // function used for updating xAxis var upon click on axis label
  function renderAxes(newXScale, xAxis) {
      var bottomAxis = d3.axisBottom(newXScale);

      xAxis.transition()
          .duration(1000)
          .call(bottomAxis);

      return xAxis;
  }

  // function used for updating circles group with a transition to
  // new circles
  function renderCircles(circlesGroup, newXScale, chosenXAxis) {

      circlesGroup.transition()
          .duration(500)
          .attr("cx", d => newXScale(d[chosenXAxis]));


      return circlesGroup;
  }


  // function used for updating circles group with new tooltip
  function updateToolTip(chosenXAxis, circlesGroup) {

      var label;
      var asset;
      if (chosenXAxis === "ethopen") {
          label = "ETH/BTC";
          asset = "ETH";
      } else if (chosenXAxis === "shibopen") {
          label = "SHIB/BTC";
          asset = "SHIB";
      } else if (chosenXAxis === "dogeopen") {
          label = "DOGE/BTC";
          asset = "DOGE";
      } else if (chosenXAxis === "aaveopen") {
          label = "AAVE/BTC";
          asset = "AAVE"
      } else {
          label = "LINK/BTC";
          asset = "LINK"
      };
      var toolTip = d3.tip()
          .attr("class", "tooltip")
          .offset([80, -60])
          .html(function(d) {
              return (`<h3>${label}<h3>BTC: ${d.btcopen.toFixed(2)}<h3>${asset}: ${d[chosenXAxis]}<h3>Time: ${d.time}`)
          })


      circlesGroup.call(toolTip);

      circlesGroup.on("mouseover", function(data) {
              toolTip.show(data);
          })

          // onmouseout event
          .on("mouseout", function(data, index) {
              toolTip.hide(data);
          });

      return circlesGroup;
  }



  // Retrieve data from the CSV file and execute everything below
  d3.csv("assets/cleanData/coindata.csv").then(function(coindata, err) {
      if (err) throw err;

      // parse data
      coindata.forEach(function(data) {
          data.ethopen = +data.ethopen;
          data.btcopen = +data.btcopen;
          data.linkopen = +data.linkopen;
          data.linkbtc = +data.linkbtc;
          data.ethbtc = +data.ethbtc;
          data.shibopen = +data.shibopen;
          data.dogeopen = +data.dogeopen;
          data.aaveopen = +data.aaveopen;
      });

      // xLinearScale function above csv import
      var xLinearScale = xScale(coindata, chosenXAxis);

      // Create y scale function
      var yLinearScale = d3.scaleLinear()
          .domain([0, d3.max(coindata, d => d.btcopen)])
          .range([height, 0]);

      // Create initial axis functions
      var bottomAxis = d3.axisBottom(xLinearScale);
      var leftAxis = d3.axisLeft(yLinearScale);

      // append x axis
      var xAxis = chartGroup.append("g")
          .classed("x-axis", true)
          .attr("transform", `translate(0, ${height})`)
          .call(bottomAxis);

      // append y axis
      chartGroup.append("g")
          .call(leftAxis);

      // append initial circles
      var circlesGroup = chartGroup.selectAll("circle")
          .data(coindata)
          .enter()
          .append("circle")
          .attr("cx", d => xLinearScale(d[chosenXAxis]))
          .attr("cy", d => yLinearScale(d.btcopen))
          .attr("r", 6)
          .attr("fill", "cyan")
          .attr("stroke-width", "1")
          .attr("stroke", 'black')
          .attr("opacity", ".5");

      // Create group for two x-axis labels
      var labelsGroup = chartGroup.append("g")
          .attr("transform", `translate(${width / 2}, ${height + 20})`);

      var ethPriceLabel = labelsGroup.append("text")
          .attr("x", 0)
          .attr("y", 20)
          .attr("value", "ethopen") // value to grab for event listener
          .classed("active", true)
          .text("ETH PRICE @ DAILY OPEN");

      var linkLabel = labelsGroup.append("text")
          .attr("x", 0)
          .attr("y", 40)
          .attr("value", "linkopen") // value to grab for event listener
          .classed("inactive", true)
          .text("LINK PRICE @ DAILY OPEN");

      var shibPriceLabel = labelsGroup.append("text")
          .attr("x", 0)
          .attr("y", 60)
          .attr("value", "shibopen") // value to grab for event listener
          .classed("inactive", true)
          .text("SHIB PRICE @ DAILY OPEN");
      var dogePriceLabel = labelsGroup.append("text")
          .attr("x", 0)
          .attr("y", 80)
          .attr("value", "dogeopen") // value to grab for event listener
          .classed("inactive", true)
          .text("DOGE PRICE @ DAILY OPEN");
      var aavePriceLabel = labelsGroup.append("text")
          .attr("x", 0)
          .attr("y", 100)
          .attr("value", "aaveopen") // value to grab for event listener
          .classed("inactive", true)
          .text("AAVE PRICE @ DAILY OPEN");


      // append y axis
      chartGroup.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left)
          .attr("x", 0 - (height / 2))
          .attr("dy", "1em")
          .style('stroke', '#005')
          .classed("axis-text", true)
          .text("BTC PRICE @ DAILY OPEN");

      // updateToolTip function above csv import
      var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

      // x axis labels event listener
      labelsGroup.selectAll("text")
          .on("click", function() {
              // get value of selection
              var value = d3.select(this).attr("value");
              if (value !== chosenXAxis) {

                  // replaces chosenXAxis with value
                  chosenXAxis = value;

                  // console.log(chosenXAxis)

                  // functions here found above csv import
                  // updates x scale for new data
                  xLinearScale = xScale(coindata, chosenXAxis);

                  // updates x axis with transition
                  xAxis = renderAxes(xLinearScale, xAxis);

                  // updates circles with new x values
                  circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                  // updates tooltips with new info
                  circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                  // changes classes to change bold text
                  if (chosenXAxis === "linkopen") {
                      linkLabel
                          .classed("active", true)
                          .classed("inactive", false);
                      ethPriceLabel
                          .classed("active", false)
                          .classed("inactive", true);
                      shibPriceLabel
                          .classed("active", false)
                          .classed("inactive", true);
                      dogePriceLabel
                          .classed("active", false)
                          .classed("inactive", true);
                      aavePriceLabel
                          .classed("active", false)
                          .classed("inactive", true);
                  } else if (chosenXAxis === "shibopen") {
                      linkLabel
                          .classed("active", false)
                          .classed("inactive", false);
                      ethPriceLabel
                          .classed("active", false)
                          .classed("inactive", true);
                      shibPriceLabel
                          .classed("active", true)
                          .classed("inactive", true);
                      dogePriceLabel
                          .classed("active", false)
                          .classed("inactive", true);
                      aavePriceLabel
                          .classed("active", false)
                          .classed("inactive", true);

                  } else if (chosenXAxis === "ethopen") {
                      linkLabel
                          .classed("active", false)
                          .classed("inactive", true);
                      ethPriceLabel
                          .classed("active", true)
                          .classed("inactive", false);
                      shibPriceLabel
                          .classed("active", false)
                          .classed("inactive", true);
                      dogePriceLabel
                          .classed("active", false)
                          .classed("inactive", true);
                      aavePriceLabel
                          .classed("active", false)
                          .classed("inactive", true);
                  } else if (chosenXAxis === "dogeopen") {
                      linkLabel
                          .classed("active", false)
                          .classed("inactive", true);
                      ethPriceLabel
                          .classed("active", false)
                          .classed("inactive", false);
                      shibPriceLabel
                          .classed("active", false)
                          .classed("inactive", true);
                      dogePriceLabel
                          .classed("active", true)
                          .classed("inactive", true);
                      aavePriceLabel
                          .classed("active", false)
                          .classed("inactive", true);
                  } else {
                      linkLabel
                          .classed("active", false)
                          .classed("inactive", true);
                      ethPriceLabel
                          .classed("active", false)
                          .classed("inactive", false);
                      shibPriceLabel
                          .classed("active", false)
                          .classed("inactive", true);
                      dogePriceLabel
                          .classed("active", false)
                          .classed("inactive", true);
                      aavePriceLabel
                          .classed("active", true)
                          .classed("inactive", true);
                  }
              }
          });
  }).catch(function(error) {
      console.log(error);
  });
}
// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, responsify() is called.
d3.select(window).on("resize", makeResponsive);
// would like to try to chart a linear regression line for each axis if i can find the time.
