// Jordan Hand
// 

$(document).ready(function() {
	getData();
});

function getData() {
	var carDataUrl = 'https://data.seattle.gov/resource/gh64-vd9r.json';

	// Makes HTTP get request to get JSON data
	$.get(carDataUrl, function(data) {
		buildSankey(data);
	});
}

// Builds the sankey chart
function buildSankey(data) {
	var margin = {top: 10, right: 10, bottom: 10, left: 10};
    var width = $('#vis').width() - margin.left - margin.right;
    var height = $(window).height() - $('#header').height() - margin.top - margin.bottom;

    var svg = d3.select('#vis')
		.append('svg')
		.attr('height', height + margin.top + margin.bottom)
		.attr('width', '100%');

	var nodeWidth = 30;

	var graph = createGraph(data);

	var sankey = d3.sankey()
		.nodeWidth(36)
		.nodePadding(10)
		.size([width, height])
		.nodes(graph.nodes)
		.links(graph.edges)
		.layout(32);;

	var path = sankey.link();
	drawNodes(svg, sankey, graph);
	drawLinks(svg, graph, path);
}

// Draws the edges of the graph onto the sankey chart
function drawLinks(svg, graph, path) {
	var link = svg.append('g')
		.selectAll('.link')
		.data(graph.edges)
		.enter()
		.append('path')
		.attr('class', 'link')
		.attr('d', path)
		.style('stroke-width', function(d) {
			return Math.max(1, Math.abs(d.dy));
		})
		.style('stroke', function(d) {
			return getColor(d.source);
		})
		.sort(function(a, b) { return b.dy - a.dy; });
	
	link.append("title")
		.text(function (d) {
			return '$' + d.value.toFixed(2);
		});
}

// Draws vertecies of the graph onto the sankey chart
function drawNodes(svg, sankey, graph) {
	var node = svg.append('g')
		.selectAll('.node')
		.data(graph.nodes)
		.enter()
		.append('g')
		.attr('class', 'node')
		.attr("transform", function(d) { 
      		return "translate(" + d.x + "," + Math.abs(d.y) + ")"; 
      	})

    node.append('rect')
    	.attr('height', function (d) {
    		return Math.abs(d.dy);
    	})
    	.attr('width', sankey.nodeWidth())
    	.style('fill', function(d) {
    		return getColor(d);
    	})
    	.append("title")
      	.text(function(d) { 
        	return d.name; 
        });

    var margin = {top: 10, right: 10, bottom: 10, left: 10};
    var width = 700 - margin.left - margin.right;
    node.append("text")
		.attr("x", -6)
		.attr("y", function(d) { return d.dy / 2; })
		.attr("dy", ".35em")
		.attr("text-anchor", "end")
		.attr("transform", null)
		.text(function(d) { return d.name; })
		.filter(function(d) { return d.x < width / 2; })
		.attr("x", 6 + sankey.nodeWidth())
		.attr("text-anchor", "start");
}

// Constructs a graph with the given JSON data
function createGraph(data) {
	var graph = {};
	graph.nodes = [];
	graph.edges = [];

	var seenNodes = [];
	var seenEdges = [];

	var count = 0;
	data.forEach(function (item) {
		addNode(graph, seenNodes, item.dept);
		addNode(graph, seenNodes, item.sold_by);

		addEdge(graph, seenNodes, seenEdges, item.dept, item.sold_by, item.sale_price);
		count++;
	});
	return graph;
}

//Adds a node to the given graph
function addNode(graph, seenNodes, nodeName) {
	if (seenNodes.indexOf(nodeName) < 0) {
		graph.nodes.push({
			"node":graph.nodes.length,
			"name":nodeName
		});
		seenNodes.push(nodeName);
	}
}

//Adds an edge to the given graph
function addEdge(graph, seenNodes, seenEdges, sourceNode, targetNode, value) {
	var sourceIndex = seenNodes.indexOf(sourceNode);
	var targetIndex = seenNodes.indexOf(targetNode)

	var edge = getEdgeString(sourceIndex, targetIndex);
	var edgeIndex = seenEdges.indexOf(edge);

	if (edgeIndex < 0) {
		graph.edges.push({
			'source':sourceIndex,
			'target':targetIndex,
			'value':parseInt(value) / 10
		});
		seenEdges.push(edge);
	} else {
		graph.edges[edgeIndex].value += parseInt(value);
	}
}

//Creates a string representation of an edge between
//source vertex and target vertex
function getEdgeString(source, target) {
	return source + '->' + target;
}

// Create a unique color based on node information
function getColor(node) {
	if (node.x === 0) {
		var r = node.node * 22 % 255 - 30;
		var g = node.node * 24% 255 - 20;
		var b = node.node * 39 % 255 - 10;
		return d3.rgb(r, g, b);
	} else {
		return d3.rgb(0, 0, 0);
	}
}