/* global d3 */
Promise.all([
  './data/ward_boundaries_update.geojson',
  './data/alc2.json'
].map(url => fetch(url)
  .then(data => data.json())))
  .catch(error => console.error(error))
  .then(data => myVis(data));


// function data_input(string, callback) {
//   fetch(string)
//     .then(data => data.json())
//     .catch(error => console.error(error))
//     .then(data => {
//       callback(data)
//     })
// }

// document.addEventListener('DOMContentLoaded', () => {
//   data_input('./data/ward_boundaries_update.geojson', mapVis)
//   data_input('./data/alc2.json', function(data) {
//     treeVis({children:data}) 
//   })
// });


function myVis(data) {
  const [map_data, tree] = data
  const tree_data = {children:tree}
  //console.log("here")
  //console.log(map_data)
  //console.log(tree_data)

  mapVis(map_data, tree_data)
  treeVis(tree_data)

}


function mapVis(data, tree_data) {
  // credit to leaflet choropleth tutorial: https://leafletjs.com/examples/choropleth/
  console.log('mapviz')
  console.log(data)
  console.log(tree_data)

  const map = new L.Map("map", {center: [41.84, -87.73], minZoom: 9,
        maxZoom: 11, zoom: 10})
    .addLayer(new L.TileLayer("http://a.tile.stamen.com/toner/{z}/{x}/{y}.png"));


  L.geoJSON(data, {style: style}).addTo(map);

  var geojson;

  function getColor(d) {
    return d > 19999  ? '#08519c' :
           d > 9999   ? '#3182bd' :
           d > 4999   ? '#6baed6' :
           d > 1999   ? '#bdd7e7' :
           d > 0      ? '#eff3ff' :
                        '#A6A6A6';
  }

  function style(feature) {
    return {
        weight: 1,
        opacity: 1,
        color: 'black',
        fillColor: getColor(feature.properties.total),
        fillOpacity: 0.8
    };
  }

  function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 1,
        fillColor: '#CB2314',
        color: 'white',
        fillOpacity: 1
    });

    info.update(layer.feature.properties);

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
  }

  function resetHighlight(e) {
    geojson.resetStyle(e.target);

    info.update();
  }

  function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
    });
  }

  geojson = L.geoJSON(data, {
      style: style,
      onEachFeature: onEachFeature
  }).addTo(map);
  
  var info = L.control();

  info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
      this.update();
      return this._div;
  };

  // method that we will use to update the control based on feature properties passed
  info.update = function (data) {
      this._div.innerHTML = (data ?
          '<b>Ward: ' + data.ward + '</b><br/>' +
          '<b>Alderman: ' + data.alderman+ '</b><br/>'+
          '<b>Lobbyists Contributions (2018): $' + data.total + '</b>'
          : 'Hover map to see ward information');
  };

  info.addTo(map);

  //legend
  var legend = L.control({position: 'bottomleft'});

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        amount = [0, 2000, 5000, 10000, 20000],
        amount_str = ['0', '2k', '5k', '10k', '20k']
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < amount.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(amount[i] + 1) + '"></i> $' +
            amount_str[i] + (amount_str[i + 1] ? '&ndash; $' + amount_str[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);

}

function treeVis(data) {
  console.log('treeviz')
  console.log(data)
  // plot configurations
  const height = 1000;
  const width = 1000;
  const margin = {top: 25, left: 130, right: 50, bottom: 50};

  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom

  const svg = d3.select(".tree").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate("
          + margin.left + "," + margin.top + ")");

  // Define the div for the tooltip
  const infodiv = d3.select(".tree").append("div") 
      .attr("class", "tooltip")  
      .style("opacity", 1);

  // get all values of donations received by aldermen
  function getIn() {
    return data.children.map(d => d.in);
  }
  // find max
  function getMax() {
    return Math.max(...getIn())
  }
  
  // Could I use recursion? Yes. Am I doing to? Not today, folks.
  function getOut() {
    var vals = []
    for (child in data.children) {
      for (grandchild in data.children[child].children) 
        for (ggchild in data.children[child].children[grandchild].children)
          vals.push(data.children[child].children[grandchild].children[ggchild].out)
    return vals
    }
  }

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  

  // set scales
  const aldScale = d3.scaleLinear().domain([0, getMax(data)]).range([2, 20]).nice();
  const lobScale = d3.scaleLinear().domain([0, 1500]).range([2, 20]).nice();
  const cliScale = d3.scaleLinear().domain([0, Math.max(...getOut())]).range([2, 20]).nice();
  //console.log(cliScale(10000))

  // create color mapping
  const colorLookup = {alderman:{stroke:"#357623", fill:"#6EB643"}, 
                       lobbyist:{stroke:"#2F1554", fill:"#576B9C"}, 
                       client:{stroke:"#F98400", fill:"#F2AD00"}
                      }

  const aldStart = 30
  const lobStart = 140
  const cliStart = 250
  const midInterval = 35
  const endInterval = 55

  //Legend
  //Aldermen
  svg.append("text")
     .attr("class", "text d3legend")
     .attr("x", -101)
     .attr("y", aldStart - 35)
     .attr("text-anchor", "right")
     .style("font-size", "12px")
     .text("Donations Received");

  svg.append("text")
     .attr("class", "text d3legend")
     .attr("x", -75)
     .attr("y", aldStart - 23)
     .attr("text-anchor", "right")
     .style("font-size", "12px")
     .text("(Alderman)");

  svg.append("circle")
     .attr('r', aldScale(getMax(data)))
     .attr("cx", -75)
     .attr("cy", aldStart)
     .style("stroke", colorLookup["alderman"]["stroke"])
     .style("fill", colorLookup["alderman"]["fill"]);

  svg.append("circle")
     .attr('r', aldScale(getMax(data)/2))
     .attr("cx", -75)
     .attr("cy", aldStart + midInterval)
     .style("stroke", colorLookup["alderman"]["stroke"])
     .style("fill", colorLookup["alderman"]["fill"]);

  svg.append("circle")
     .attr('r', aldScale(0))
     .attr("cx", -75)
     .attr("cy", aldStart + endInterval)
     .style("stroke", colorLookup["alderman"]["stroke"])
     .style("fill", colorLookup["alderman"]["fill"]);

  // Labels
  svg.append("text")
     .attr("class", "text d3legend")
     .attr("x", -50)
     .attr("y", aldStart + 5)
     .attr("text-anchor", "right")
     .style("font-size", "10px")
     .text("$" + numberWithCommas(getMax(data)));

  svg.append("text")
     .attr("class", "text d3legend")
     .attr("x", -50)
     .attr("y", aldStart + midInterval + 5)
     .attr("text-anchor", "right")
     .style("font-size", "10px")
     .text("$" + numberWithCommas(getMax(data)/2));

  svg.append("text")
     .attr("class", "text d3legend")
     .attr("x", -50)
     .attr("y", aldStart + endInterval + 5)
     .attr("text-anchor", "right")
     .style("font-size", "10px")
     .text("$" + 0);

  // Lobbyists
  svg.append("text")
     .attr("class", "text d3legend")
     .attr("x", -90)
     .attr("y", lobStart - 35)
     .attr("text-anchor", "right")
     .style("font-size", "12px")
     .text("Donations Given");

  svg.append("text")
     .attr("class", "text d3legend")
     .attr("x", -75)
     .attr("y", lobStart - 23)
     .attr("text-anchor", "right")
     .style("font-size", "12px")
     .text("(Lobbyist)");

  svg.append("circle")
     .attr('r', lobScale(1500))
     .attr("cx", -75)
     .attr("cy", lobStart)
     .style("stroke", colorLookup["lobbyist"]["stroke"])
     .style("fill", colorLookup["lobbyist"]["fill"]);

  svg.append("circle")
     .attr('r', lobScale(750))
     .attr("cx", -75)
     .attr("cy", lobStart + midInterval)
     .style("stroke", colorLookup["lobbyist"]["stroke"])
     .style("fill", colorLookup["lobbyist"]["fill"]);

  svg.append("circle")
     .attr('r', lobScale(0))
     .attr("cx", -75)
     .attr("cy", lobStart + endInterval)
     .style("stroke", colorLookup["lobbyist"]["stroke"])
     .style("fill", colorLookup["lobbyist"]["fill"]);

  // Labels
  svg.append("text")
     .attr("class", "text d3legend")
     .attr("x", -50)
     .attr("y", lobStart + 5)
     .attr("text-anchor", "right")
     .style("font-size", "10px")
     .text("$" + numberWithCommas(1500));

  svg.append("text")
     .attr("class", "text d3legend")
     .attr("x", -50)
     .attr("y", lobStart + midInterval + 5)
     .attr("text-anchor", "right")
     .style("font-size", "10px")
     .text("$" + 750);

  svg.append("text")
     .attr("class", "text d3legend")
     .attr("x", -50)
     .attr("y", lobStart + endInterval + 5)
     .attr("text-anchor", "right")
     .style("font-size", "10px")
     .text("$" + 0);

  // Clients
  svg.append("text")
     .attr("class", "text d3legend")
     .attr("x", -100)
     .attr("y", cliStart - 35)
     .attr("text-anchor", "right")
     .style("font-size", "12px")
     .text("Compensation Paid");

  svg.append("text")
     .attr("class", "text d3legend")
     .attr("x", -68)
     .attr("y", cliStart - 23)
     .attr("text-anchor", "right")
     .style("font-size", "12px")
     .text("(Client)");

  svg.append("circle")
     .attr('r', cliScale(Math.max(...getOut())))
     .attr("cx", -75)
     .attr("cy", cliStart)
     .style("stroke", colorLookup["client"]["stroke"])
     .style("fill", colorLookup["client"]["fill"]);

  svg.append("circle")
     .attr('r', cliScale(Math.max(...getOut())/2))
     .attr("cx", -75)
     .attr("cy", cliStart + midInterval)
     .style("stroke", colorLookup["client"]["stroke"])
     .style("fill", colorLookup["client"]["fill"]);

  svg.append("circle")
     .attr('r', cliScale(0))
     .attr("cx", -75)
     .attr("cy", cliStart + endInterval)
     .style("stroke", colorLookup["client"]["stroke"])
     .style("fill", colorLookup["client"]["fill"]);

  // Labels
  svg.append("text")
     .attr("class", "text d3legend")
     .attr("x", -50)
     .attr("y", cliStart  )
     .attr("text-anchor", "right")
     .style("font-size", "10px")
     .text("$" + numberWithCommas(Math.max(...getOut())));

  svg.append("text")
     .attr("class", "text d3legend")
     .attr("x", -50)
     .attr("y", cliStart + midInterval)
     .attr("text-anchor", "right")
     .style("font-size", "10px")
     .text("$" + numberWithCommas(Math.max(...getOut())/2));

  svg.append("text")
     .attr("class", "text d3legend")
     .attr("x", -50)
     .attr("y", cliStart + endInterval)
     .attr("text-anchor", "right")
     .style("font-size", "10px")
     .text("$" + 0);

  svg.append("rect")
     .attr("height", 340)
     .attr("width", 115)
     .attr("x", -105)
     .attr("y", -20)
     .style("stroke", "black")
     .style("fill-opacity", 0);

  // attribution
  svg.append("text")
      .attr("class", "text")
      .attr("x", -85)             
      .attr("y", height - 50)
      .attr("text-anchor", "start")
      .style("font-size", "12px")
      .text("Source: City of Chicago Lobbying Data, Compensation and Contributions");

  svg.append("text")
      .attr("class", "text")
      .attr("x", 15 )             
      .attr("y", -15)
      .attr("text-anchor", "start")
      .style("font-size", "12px")
      .text("Click on an alderman to explore!");

  
  
  // Set transition duration
  var i = 0,
  duration = 750,
  root;
  
  // set treemap size
  var treemap = d3.tree()
    .size([plotHeight, plotWidth]);

  root = d3.hierarchy(data, function(d) { return d.children; });;
  root.x0 = width / 2 ;
  root.y0 = height / 2;
  
  root.children.forEach(collapse);

  update(root);

  // Collapse the node and all it's children
  function collapse(d) {
    if(d.children) {
      d._children = d.children
      d._children.forEach(collapse)
      d.children = null
    }
  }

  function update(source) {

    // Assigns the x and y position for the nodes
    var treeData = treemap(root);

    // Compute the new tree layout
    var nodes = treeData.descendants(),
        links = treeData.descendants().slice(1);

    // Normalize for fixed-depth
    nodes.forEach(function(d){ d.y = d.depth * 180});

    // ****************** Nodes ***************************

    // Update the nodes
    var node = svg.selectAll('g.node')
        .data(nodes, function(d) {return d.id || (d.id = ++i); });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr("transform", function(d) {
          return "translate(" + source.y0 + "," + source.x0 + ")";
      })
      .on('click', click)
      .on("mouseover", function(d) {
          infodiv.transition().duration(200).style("opacity", 0.9);
          infodiv.html(function(data) { 
              if (d.depth === 1) {
                return "Alderman: " + d.data.name + "<br>Donations from Lobbyists: $" + numberWithCommas(d.data.in)
              } else if (d.depth === 2) {
                return "Lobbyist: " + d.data.name + "<br>Payments from Clients: $" + numberWithCommas(d.data.in) + "<br>Donation to " + d.parent.data.name + ": $" + numberWithCommas(d.data.out)
              } else {
                return "Client : " + d.data.name + "<br>Payments to " + d.parent.data.name + ": $" + numberWithCommas(d.data.out)
              }
            });
      })
      .on("mouseout", function() {
          // Remove the info text on mouse out.
          infodiv.transition()    
                .duration(200)    
                .style("opacity", 0); 
        });
      ;

    // Add Circle for the nodes
    nodeEnter.append('circle')
        .attr('class', function(d) {
          if (d.depth === 1) {
            return 'node alderman'
          } else if (d.depth === 2) {
            return 'node lobbyist'
          }
          else {
            return 'node client'
          }
        })
        .attr('r', 0)
        .style('stroke', function(d) {
          if (d.depth === 1) {
            return colorLookup["alderman"]["stroke"]
          } else if (d.depth === 2) {
            return colorLookup["lobbyist"]["stroke"]
          }
          else {
            return colorLookup["client"]["stroke"]
          }
        })
        .style("fill", function(d) {
          if (d.depth === 1) {
            return colorLookup["alderman"]["fill"]
          } else if (d.depth === 2) {
            return colorLookup["lobbyist"]["fill"]
          }
          else {
            return colorLookup["lobbyist"]["fill"]
          }
        })
        .style("opacity", function(d){
          return !d.depth ? 0 : 1;
        });

    // Add labels for the nodes
    // Add updates here for the $ amounts coming in, out
    nodeEnter.append('text')
              .attr('class', function(d) {
                    if (d.depth === 1) {
                      return 'text alderman'
                    } else if (d.depth === 2) {
                      return 'text lobbyist'
                    }
                    else {
                      return 'text client'
                    }
                  })
              .attr("dy", ".35em")
              .attr("x", function(d) {
                  return d.children || d._children ? -13 : 13;
              })
              .attr("text-anchor", function(d) {
                  return d.children || d._children ? "end" : "start";
              })
              .text(function(d) { return d.data.name; })
              .style("opacity", function(d){
                return !d.depth ? 0 : 1;
              });

    // UPDATE
    var nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate.transition()
      .duration(duration)
      .attr("transform", function(d) { 
          return "translate(" + d.y + "," + d.x + ")";
       });

    // Update the node attributes and style
    nodeUpdate.select('circle.node')
      .attr('r', function(d) {
        if (d.depth === 1) {
          return aldScale(d.data.in)
        } else if (d.depth === 2) {
          return lobScale(d.data.out)
        } else {return cliScale(d.data.out)}
      }) //d => d.in 'r', 8
      .style("fill", function(d) {
          if (d.depth === 1) {
            return "#6EB643"
          } else if (d.depth ===2) {
            return "#576B9C"
          }
          else {
            return "#F2AD00"
          }
      })
      .attr('cursor', 'pointer');

    // Remove any exiting nodes
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) {
            return "translate(" + source.y + "," + source.x + ")";
        })
        .remove();

    // On exit reduce the node circles size to 0
    nodeExit.select('circle')
      .attr('r', 0);

    // On exit reduce the opacity of text labels
    nodeExit.select('text')
      .style('fill-opacity', 0);

    // LINKS

    // Update links
    var link = svg.selectAll('path.link')
        .data(links, function(d) { return d.id; });

    // Enter any new links at the parent's previous position.
    var linkEnter = link.enter().insert('path', "g")
        .attr("class", "link")
        .attr('d', function(d){
          var o = {x: source.x0, y: source.y0}
          return diagonal(o, o)
        })
        .style("opacity", function(d, i) {
            return !source.depth ? 0 : 1;
        })
        .style("pointer-events", function(d, i) {
            return source.depth ? "none" : "all";
        });

    // UPDATE
    var linkUpdate = linkEnter.merge(link);

    // Transition back to the parent element position
    linkUpdate.transition()
        .duration(duration)
        .attr('d', function(d){ return diagonal(d, d.parent) });

    // Remove any exiting links
    var linkExit = link.exit().transition()
        .duration(duration)
        .attr('d', function(d) {
          var o = {x: source.x, y: source.y}
          return diagonal(o, o)
        })
        .remove();

    // Store the old positions for transition.
    nodes.forEach(function(d){
      d.x0 = d.x;
      d.y0 = d.y;
    });

    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {

      path = `M ${s.y} ${s.x}
              C ${(s.y + d.y) / 2} ${s.x},
                ${(s.y + d.y) / 2} ${d.x},
                ${d.y} ${d.x}`

      return path
    }

    // On click toggle children, if alderman, remove other nodes
    function click(d) {
      if (d.depth === 1) {
        if (d3.select(this).selectAll(".alderman").classed("active") === false) {
          d3.select(this).selectAll(".alderman").classed("active", true) //ed("active", true)
          // console.log("on click")
          // console.log(d3.select(this).selectAll(".alderman"))
          // console.log(d3.selectAll(".alderman"))
          
          d3.selectAll(".alderman")
            //.classed("active", false)
            .transition()
            .attr("fill-opacity", 0.2)
            .attr("stroke-opacity", 0.1);

          d3.selectAll(".active")
          .transition()
          .attr("fill-opacity", 1)
          .attr("stroke-opacity", 1);

        }
        else {
          d3.select(this).selectAll(".alderman").classed("active", false);

          d3.select(this).selectAll(".alderman")
              .transition()
              .attr("fill-opacity", 0.2)
              .attr("stroke-opacity", 0.1);


          if (d3.selectAll(".active")._groups[0].length === 0) {
            // console.log("click off")
            // console.log(d3.selectAll(".active")._groups[0].length)

            d3.selectAll(".alderman")
              .transition()
              .attr("fill-opacity", 1)
              .attr("stroke-opacity", 1);
          }
        }
      }

      if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
      update(d);
    }

  }

}

