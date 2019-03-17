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
  console.log('mapviz')
  console.log(data)
  console.log(tree_data)

  const map = new L.Map("map", {center: [41.84, -87.73], minZoom: 9,
        maxZoom: 11, zoom: 10})
    .addLayer(new L.TileLayer("http://a.tile.stamen.com/toner/{z}/{x}/{y}.png"));


  L.geoJSON(data, {style: style}).addTo(map);

  var geojson;
  //geojson = L.geoJSON(data, {style: style});

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

  // var promise = getJSON('./data/alc2.json');
  // promise.then(data => data.json())
  //         .then(function(data) {
  //       var allbusinesses = L.geoJson(data);
  //       console.log(allbusinesses)
  //     });
            //     var cafes = L.geoJson(data, {
            // filter: function(feature, layer) {
            //     return feature.properties.BusType == "Cafe";
            // },
            // pointToLayer: function(feature, latlng) {
            //     return L.marker(latlng, {
            //         icon: cafeIcon
            //     }).on('mouseover', function() {
            //         this.bindPopup(feature.properties.Name).openPopup();
            //     });
            // }
       

  function filterTreeData(e, data, tree_data, layer) {
    console.log(layer)
    layer.on({

    })
    console.log(e.target.properties)
    console.log("getting here")
    // console.log(data.alderman)
    // const name = data.alderman
    // r = tree_data.filter(function(d, name) {
    //   if (d.data.depth === 1) {
    //     return d.data.name === name
    //   }
    // })
    // return r; 
  }



  geojson = L.geoJSON(data, {
      style: style,
      onEachFeature: onEachFeature,
      click: filterTreeData
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

  function getIn() {
    return data.children.map(d => d.in);
    //return data.reduce((max, d) => parseInt(d.in, 10) > max ? d.in : max, d[0].in);
  }
  function getMax() {
    return Math.max(...getIn())
  }
  
  // Could I use recursion? Yes. Am I doing to? Not today, folks.
  function getOut() {
    var vals = []
    for (child in data.children) {
      //console.log(data.children[child])
      for (grandchild in data.children[child].children) 
        //console.log(grandchild)
        //console.log(data.children[child].children[grandchild])
        for (ggchild in data.children[child].children[grandchild].children)
          vals.push(data.children[child].children[grandchild].children[ggchild].out)
    return vals
    }
  }
  

  // set scales
  const aldScale = d3.scaleLinear().domain([0, getMax(data)]).range([2, 20]).nice();
  const lobScale = d3.scaleLinear().domain([0, 2000]).range([2, 20]).nice();
  const cliScale = d3.scaleLinear().domain([0, Math.max(...getOut())]).range([2, 20]).nice();
  console.log(cliScale(10000))

  // create color mapping
  const colorLookup = {alderman:{stroke:"#357623", fill:"#6EB643"}, 
                       lobbyist:{stroke:"#2F1554", fill:"#576B9C"}, 
                       client:{stroke:"#F98400", fill:"#F2AD00"}
                      }

  //Legend
  svg.append("circle")
     .attr('r', 10)
     .attr("cx", -75)
     .attr("cy", 20)
     .style("stroke", colorLookup["alderman"]["stroke"])
     .style("fill", colorLookup["alderman"]["fill"]);

  svg.append("circle")
     .attr('r', 10)
     .attr("cx", -75)
     .attr("cy", 45)
     .style("stroke", colorLookup["lobbyist"]["stroke"])
     .style("fill", colorLookup["lobbyist"]["fill"]);

  svg.append("circle")
     .attr('r', 10)
     .attr("cx", -75)
     .attr("cy", 70)
     .style("stroke", colorLookup["client"]["stroke"])
     .style("fill", colorLookup["client"]["fill"]);

  svg.append("rect")
     .attr("height", 80)
     .attr("width", 100)
     .attr("x", -90)
     .attr("y", 5)
     .style("stroke", "black")
     .style("fill-opacity", 0);

  svg.append("text")
     .attr("class", "text legend")
     .attr("x", -85)
     .attr("y", 0)
     .attr("text-anchor", "right")
     .style("font-size", "14px")
     .text("Node Legend");

  svg.append("text")
     .attr("class", "text legend")
     .attr("x", -60)
     .attr("y", 22)
     .attr("text-anchor", "right")
     .style("font-size", "10px")
     .text("Aldermen");

  svg.append("text")
     .attr("class", "text legend")
     .attr("x", -60)
     .attr("y", 47)
     .attr("text-anchor", "right")
     .style("font-size", "10px")
     .text("Lobbyists");

  svg.append("text")
     .attr("class", "text legend")
     .attr("x", -60)
     .attr("y", 72)
     .attr("text-anchor", "right")
     .style("font-size", "10px")
     .text("Clients");

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
          //var g = d3.select(this); // The node
          // The class is used to remove the additional text later
          // var info = g.append('div').append('p').append('text')
          //    .classed('tooltip', true)
          //    .attr('x', 20)
          //    .attr('y', 10)
          //    .attr("data-html", "true")
          infodiv.transition().duration(200).style("opacity", 0.9);
          infodiv.html(function(data) { 
              if (d.depth === 1) {
                return "Donations from Lobbyists: " + d.data.in
              } else if (d.depth === 2) {
                return "Payments from Clients: " + d.data.in + "<br>" + "Donations to Alderman: " + d.data.out
              } else {
                return "Payments to Lobbyists: " + d.data.out
              }
            });
      })
      .on("mouseout", function() {
          // Remove the info text on mouse out.
          d3.select(this).select('text.tooltip').remove()
        });
      ;

      d3.select(".tree").append("div") 
      .attr("class", "tooltip").append("p")  
      .style("opacity", 1);

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

    // nodeEnter.append('text')
    //           .attr("class", "text")
    //           .attr("dy", "1.35em")
    //           .attr("x", function(d) {
    //               return d.children || d._children ? -13 : 13;
    //           })
    //           .attr("text-anchor", function(d) {
    //               return d.children || d._children ? "end" : "start";
    //           })
    //           .text(function(d) { return "Received: $"+d.data.in; })
    //           .style("opacity", function(d){
    //             return d.depth > 1 ? 0 : 1;
    //           });

    // nodeEnter.append('text')
    //           .attr("class", "text")
    //           .attr("dy", "2.35em")
    //           .attr("x", function(d) {
    //               return d.children || d._children ? -13 : 13;
    //           })
    //           .attr("text-anchor", function(d) {
    //               return d.children || d._children ? "end" : "start";
    //           })
    //           .text(function(d) { return "Paid: $"+d.data.out; })
    //           .style("opacity", function(d){
    //             return !d.depth ? 0 : 1;
    //           });

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
          console.log("inner")
          console.log(d)
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
        if (d3.select(this).select(".alderman").classed("active") === false) {
          d3.select(this).selectAll(".alderman").classed("active", true) //ed("active", true)

          d3.selectAll(".alderman")
            .transition()
            .attr("fill-opacity", 0.2)
            .attr("stroke-opacity", 0.2);

          d3.selectAll(".active")
          .transition()
          .attr("fill-opacity", 1)
          .attr("stroke-opacity", 1);
        }
        else {
          d3.select(this).selectAll(".alderman").classed("active", false);

          d3.selectAll(".alderman")
            .transition()
            .attr("fill-opacity", 1)
            .attr("stroke-opacity", 1);
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

