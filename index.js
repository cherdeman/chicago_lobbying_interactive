/* global d3 */

function data_input(string, callback) {
  fetch(string)
    .then(data => data.json())
    .catch(error => console.error(error))
    .then(data => {
      callback(data)
    })
}

document.addEventListener('DOMContentLoaded', () => {
  data_input('./data/ward_boundaries_update.geojson', mapVis)
  data_input('./data/alc2.json', function(data) {
    treeVis({children:data}) 
  })
});


function mapVis(data) {
  console.log('mapviz')
  console.log(data)

  const map = new L.Map("map", {center: [41.84, -87.73], zoom: 10})
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

}

function treeVis(data) {
  console.log('treeviz')
  console.log(data)
  // plot configurations
  const height = 1200;
  const width = 1000;
  const margin = {top: 50, left: 130, right: 50, bottom: 50};

  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom

  const svg = d3.select(".tree").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate("
          + margin.left + "," + margin.top + ")");
  
  // Set transition duration
  var i = 0,
  duration = 750,
  root;
  
  //
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

    // Compute the new tree layout.
    var nodes = treeData.descendants(),
        links = treeData.descendants().slice(1);

    // Normalize for fixed-depth.
    nodes.forEach(function(d){ d.y = d.depth * 150});

    // ****************** Nodes section ***************************

    // Update the nodes...
    var node = svg.selectAll('g.node')
        .data(nodes, function(d) {return d.id || (d.id = ++i); });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr("transform", function(d) {
          return "translate(" + source.y0 + "," + source.x0 + ")";
      })
      .on('click', click);

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
            return "#357623"
          } else if (d.depth === 2) {
            return "#2F1554"
          }
          else {
            return "#F98400"
          }
        })
        .style("fill", function(d) {
          if (d.depth === 1) {
            return "#6EB643"
          } else if (d.depth === 2) {
            return "#576B9C"
          }
          else {
            return "#F2AD00"
          }
        })
        .style("opacity", function(d){
          return !d.depth ? 0 : 1;
        });

    // Add labels for the nodes
    // Add updates here for the $ amounts coming in, out
    nodeEnter.append('text')
              .attr("class", "text")
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
      .attr('r', 10)
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

    // Update the links...
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
        if (d3.select(this).classed("active") === false) {
          d3.select(this).classed("active", true)

          d3.selectAll(".alderman")
            .transition()
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0);

          
          d3.selectAll(".alderman.active")
            .transition()
            .attr("fill-opacity", 1);
        }
        else {
          d3.select(this).classed("active", false);

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

