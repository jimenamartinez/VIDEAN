//UNIX=""; //Window
UNIX="../"; //Unix

CGIDATA = "cgi-data/"
FIN_PATH = "?callback=foo"
var path_data=window.opener.path_data_local;//"./data/";
var width = 500,
	height = 400,
	v = d3.scale.linear().domain([-1, 1]).range([-1, 1]);
	
var graph1Loaded = false;
var graph2Loaded = false;

var loadedFirstTime_g1 = true;

var force = d3.layout.force()
				.size([width, height])
				.charge(-300) 
				.theta(0.4);
var modes =  ["Spearman Correlation-based", "Kendall Correlation-based", "Entropy-based"],
			j_m = 0;
var svg;
var svg_ent;
var original_links = [];
var original_nodes = []; 
var min_val_edge = 1;
var max_val_edge = -1;
var min_val_edge_entropy = 0;
var max_val_edge_entropy = 0;
var min_val_node = 1;
var max_val_node = -1;
var min_val_node_entropy = 99;
var max_val_node_entropy = 0;
var scale_tresh,scale_tresh_node;
var nodes_data_view1;  
var set_opac_v1 = 0.8;
var set_opac_path = 0.8;
var new_links_selected = [];
var new_nodes_selected = [];
var leyenda_tam_nodo = "Number of models in which this descriptor occurs (node color): "
var leyenda_nodo = "Correlation between descriptor and property (node size): "

var links_by_nodes_selected = [];

var find_source;
var find_target;

var scale_nodes1_size_entropy;
var entropy_nodes = [];
var entropy_links = [];
var minRadiousCircle = 3;
var maxRadiousCircle = 15;
var minEdgeLength = 120;
var maxEdgeLength = 270;

var mode =  0; //mode=0 correlation, mode = 1 entropy
var scale_nodes1_size = d3.scale.linear().domain([0,1]).range([minRadiousCircle,maxRadiousCircle]);

var scale_node;
var method_pred;
var inputData_run;
var model;
var test_op;
var perc_25,perc_50,perc_75,perc_100;
var data,folds;
var new_array_desc_names = [];
var array_desc_val = [];
var data = [];

var original_links_KD;
var original_links_SP;
var original_links_ent;
var original_nodes_KD;
var original_nodes_SP;
var original_nodes_ent;

var val_edge_thr;
var val_nodes_thr;
var nodes_to_check;

var arr_index_sel=[];//Contains the indices of the descriptor list on the left

//*****************************************************************************************************************************

function load_graph_v1(path_file,dataName){
	d3.select("#div_view1").select("svg").remove();
	svg = d3.select("#div_view1").append("svg")
		.attr("width", width)
		.attr("height", height);
	var drag = force.drag()
		.on("dragstart", dragstart);

	var node;
	var path;
	var upper_threshold = [ 0.25, 0.50, 0.75, 1];
	var thresh_colors = ['#FFBF00','#FF8000','#FF4000','#FF0000'];
	scale_pos_color = d3.scale.threshold()
					  .domain(upper_threshold)
					  .range(thresh_colors);
	
	//loadedExternally is set in loadExamples.js
	if (window.opener.loadedExternally){
		updateGraph_v1('foo',dataName);
	}
	else{
		d3.json(path_file, function(error,data) {
			updateGraph_v1(error,data);
		});
	}
	
	function updateGraph_v1(error,data){
			var num = data.nodes.length;
			original_links = data.links;
			original_nodes = data.nodes;

			nodes_data_view1 = data.nodes;
			

			force
				 .nodes(data.nodes)
				 .links(data.links)
				 .linkDistance(function(d,i){
					var scaleEdge;
						scaleEdge = d3.scale.linear().domain([min_val_edge,max_val_edge]).range([maxEdgeLength,minEdgeLength]);
					return scaleEdge(d.value);
				 })
				 .start();
			

			if (mode == 1){ //entropy
				original_nodes.forEach(function(d, i) { 
					perc_25 = d.p25;
					perc_50 = d.p50;
					perc_75 = d.p75;
					perc_100 = d.p100;
					if (max_val_node_entropy<parseFloat(d.global)){
						max_val_node_entropy= parseFloat(d.global);
					}
					if (min_val_node_entropy > parseFloat(d.global)){
						min_val_node_entropy= parseFloat(d.global);
					}
				});
				max_val_node = max_val_node_entropy;
				min_val_node = min_val_node_entropy;
				
				encodeOpacity_Entropy(original_links);
				scale_node = d3.scale.linear().domain([max_val_node_entropy,min_val_node_entropy]).range([minRadiousCircle,maxRadiousCircle]);
			}
			else if (mode==0){
				max_val_node = 0;
				min_val_node = 1;
				original_nodes.forEach(function(d, i) { 
					if (Math.abs(parseFloat(d.global)) < min_val_node){
						min_val_node = Math.abs(parseFloat(d.global));
					}
					if (parseFloat(d.global) > max_val_node){
						max_val_node= parseFloat(d.global);
					}
				});
				encodeOpacity(original_links);
				scale_node = d3.scale.linear().domain([0,1]).range([minRadiousCircle,maxRadiousCircle]);
			}
			
			path = svg.append("svg:g").selectAll(".path")
								.data(original_links);
			
			node = svg.selectAll(".node")
					.data(data.nodes, function(d,i) { return d.id || (d.id = ++i); })
					.enter().append("g")
					.attr("class", "node")
					.call(force.drag);

			min_val_edge = 1;
			max_val_edge = 0;
			
			path.enter().append("path")
						.attr("class", function(d) {
							
							if (mode == 1){
								if (Math.abs(parseFloat(d.value)) < min_val_edge_entropy){
									min_val_edge_entropy = Math.abs(parseFloat(d.value));
								}
								if (Math.abs(parseFloat(d.value)) > max_val_edge_entropy){
									max_val_edge_entropy = Math.abs(parseFloat(d.value));
								}
							}
							if (mode == 0){
								if (Math.abs(parseFloat(d.value)) < min_val_edge){
									min_val_edge= Math.abs(parseFloat(d.value));
								}
								if (Math.abs(parseFloat(d.value)) > max_val_edge){
									max_val_edge = Math.abs(parseFloat(d.value));
								}
							}
							return "link " + d.type; })
						.style("opacity",set_opac_path)
						.on("mouseover", function (d){
									d3.selectAll(".path").append("title").text(function (d) {return d.source.name +" <--> "+ d.target.name + "\n" + d.value;});
						});
						
			if (mode==1){
				min_val_edge = min_val_edge_entropy;
				max_val_edge = max_val_edge_entropy;
			}
			
			
			path.append("title").text(function (d) {
			   return d.source.name +" <--> "+ d.target.name + "\n" + d.value;});
		
			node.append("circle")    
				.attr("r", function(d) {return scale_node(Math.abs(parseFloat(d.global))); })
				.style("opacity",set_opac_v1)
				.style("fill", function(d) {
					var scale=d3.scale.linear()  
								.domain([1,d.totalMod])
								.range(['#FFF', '#000']);
					return scale(d.model);
									})
				.style("stroke","black");	
				
			node.append("title")
				 .text(function(d) { 
					if (mode==1){
						leyenda_nodo = "Conditional entropy of property given descriptor (node size): "
					}
					if (mode==0){
						leyenda_nodo = "Correlation between descriptor and property (node size): "
					}
					return d.name + "\n" + leyenda_nodo + d.global + "\n" + leyenda_tam_nodo + d.model;});
			node.append("text")
				.attr("dx", function(d) { 
				   return scale_node(Math.abs(parseFloat(d.global))) + 2; } )
				.attr("dy", ".35em")
				.text(function(d) { return d.name });
							
			
			node.on("mouseover",function(d,i){
					force.stop();
					svg.selectAll(".link").style("opacity", function(o) {
						   return o.source === d || o.target === d ? 1 : 0.1;
					});
					svg_view2.selectAll(".link").style("opacity", function(o) {
						return o.source === nodes_data_view2[i] || o.target === nodes_data_view2[i]  ? 1 : 0.1;
					});
					svg_view3.selectAll(".link_view3").style("opacity", function(o) {
						return o.source === nodes_data_view3[i] || o.target === nodes_data_view3[i]  ? 1 : 0.1;
					});
				})
				.on("mouseout",function(d,i){
						   force.stop();
							svg.selectAll(".link").style("opacity", function(o) {
								return o.source === d || o.target === d ? 1 : 1.0;
							})
							svg_view2.selectAll(".link").style("opacity", function(o) {
								return o.source === nodes_data_view2[i] || o.target === nodes_data_view2[i]  ? 1 : 1.0;
							});
							svg_view3.selectAll(".link_view3").style("opacity", function(o) {
								return o.source === nodes_data_view3[i] || o.target === nodes_data_view3[i]  ? 1 : 1.0;
							});							
						})
				.on("dblclick",function(d){ 
							force.stop();
							window.open("http://michem.disat.unimib.it/mole_db/help/desc_list.php");
							document.documentElement.innerHTML.indexOf(d.name);
							}); 

			force.on("tick", function() {
					node.attr("cx", function(d) { return d.x =  Math.max(scale_node(Math.abs(parseFloat(d.global))), Math.min(width - (scale_node(Math.abs(parseFloat(d.global)))), d.x)); })
						.attr("cy", function(d) { return d.y =  Math.max(scale_node(Math.abs(parseFloat(d.global))), Math.min(height - (scale_node(Math.abs(parseFloat(d.global)))), d.y)); });
					path.attr("x1", function(d) { return d.source.x; })
							.attr("y1", function(d) { return d.source.y; })
							.attr("x2", function(d) { return d.target.x; })
							.attr("y2", function(d) { return d.target.y; })							
							.style("stroke-width", 3);
					path.attr("d", function(d) {
											var dx = d.target.x - d.source.x,
												dy = d.target.y - d.source.y,
												dr = Math.sqrt(dx * dx + dy * dy);
											return "M" + 
												d.source.x + "," + 
												d.source.y + "A" + 
												dr + "," + dr + " 0 0,1 " + 
												d.target.x + "," + 
												d.target.y;
										});
					node.attr("transform", function(d) { 
									return "translate(" + d.x + "," + d.y + ")"; });

			});
			

			scale_tresh = d3.scale.linear().domain([0,100]).range([parseFloat(max_val_edge),parseFloat(min_val_edge)]);
			
			scale_tresh_node = d3.scale.linear().domain([0,100]).range([parseFloat(max_val_node),parseFloat(min_val_node)]);
			

			if (loadedFirstTime_g1){
			    arr_index_sel = d3.range(data.nodes.length);
				//if first time accomodate value and sliders
				val_edge_thr = parseFloat(max_val_edge) - ((parseFloat(max_val_edge)-parseFloat(min_val_edge))/4);
				thresh_edges = val_edge_thr;
				d3.select("#thresh_value_edgespos_g1")[0][0].value = parseFloat(val_edge_thr).toFixed(4);
				
				val_nodes_thr =parseFloat(max_val_node) - ((parseFloat(max_val_node)-parseFloat(min_val_node))/4);
				thresh_nodes = val_nodes_thr;				
				d3.select("#thresh_value_nodes_g1")[0][0].value = parseFloat(val_nodes_thr).toFixed(4);
				
				//filter graph based on initial settings
				new_nodes_selected = original_nodes.slice(0);
				filter(val_edge_thr,val_nodes_thr);
				graph1Loaded = true;

				if (graph1Loaded==graph2Loaded){
					loadDescriptorAndNamesValues();
				}
				loadedFirstTime_g1 = false;
			}
			else{
				//accomodate proportional edge value
				d3.select("#thresh_value_edgespos_g1")[0][0].value = parseFloat(scale_tresh(parseFloat(d3.select("#thresh_slider_edgespos_g1")[0][0].value))).toFixed(4);
			
				filterFromDescriptorPrevious();
			}
	}
			
}
function check_nodes_filtered(nodes){
	nodes.forEach(function(node,index){
	    checkb[0][node.index].checked = true;
		arr_index_sel.push(node.index);
	});	
}


function filterFromDescriptorPrevious(){

	var temp =[];
	var minSelectedValue = 99;
	var maxSelectedValue = 0;
	var indexNewNodes = 0;
	original_nodes.forEach(function(node,i){
		if (node.name==new_nodes_selected[indexNewNodes].name){
			indexNewNodes = Math.min(indexNewNodes + 1,new_nodes_selected.length - 1);
			temp.push(node);
			if (minSelectedValue > Math.abs(parseFloat(node.global))){
				minSelectedValue = Math.abs(parseFloat(node.global));
			}
			if (maxSelectedValue < Math.abs(parseFloat(node.global))){
				maxSelectedValue = Math.abs(parseFloat(node.global));
			}
		}
	});
	
	new_nodes_selected = temp.slice(0);
	nodes_to_check = new_nodes_selected.slice(0);
	
	// find links to these nodes
	find_links_tresh(new_nodes_selected,original_links,parseFloat(d3.select("#thresh_value_edgespos_g1")[0][0].value));
	
	if (mode==0){
		d3.select("#thresh_value_nodes_g1")[0][0].value = minSelectedValue;
		
		d3.select("#thresh_slider_nodes_g1")[0][0].value = scale_tresh_node.invert(minSelectedValue);
	}
	else if (mode==1){
		d3.select("#thresh_value_nodes_g1")[0][0].value = maxSelectedValue;
		
		d3.select("#thresh_slider_nodes_g1")[0][0].value = scale_tresh_node.invert(maxSelectedValue);
	}
	
	applyFiltering();
}

function filterFromDescriptorList(){
	var temp =[];
	var minSelectedValue = 99;
	var maxSelectedValue = 0;
	original_nodes.forEach(function(node,i){
		if (checkb[0][i].checked){
			temp.push(node);
			if (minSelectedValue > Math.abs(parseFloat(node.global))){
				minSelectedValue = Math.abs(parseFloat(node.global));
			}
			if (maxSelectedValue < Math.abs(parseFloat(node.global))){
				maxSelectedValue = Math.abs(parseFloat(node.global));
			}
		}
	});
	
	new_nodes_selected = temp.slice(0);
	nodes_to_check = new_nodes_selected.slice(0);
	
	// find links to these nodes
	find_links_tresh(new_nodes_selected,original_links,parseFloat(d3.select("#thresh_value_edgespos_g1")[0][0].value));
	
	if (mode==0){
		d3.select("#thresh_value_nodes_g1")[0][0].value = minSelectedValue;
		
		d3.select("#thresh_slider_nodes_g1")[0][0].value = scale_tresh_node.invert(minSelectedValue);
	}
	else if (mode==1){
		d3.select("#thresh_value_nodes_g1")[0][0].value = maxSelectedValue;
		
		d3.select("#thresh_slider_nodes_g1")[0][0].value = scale_tresh_node.invert(maxSelectedValue);
	}
	
	applyFiltering();
}

function filterSelectAllNodes(){
	new_nodes_selected = original_nodes.slice(0);
	
	nodes_to_check = new_nodes_selected.slice(0);
	
	// find links to these nodes
	find_links_tresh(new_nodes_selected,original_links,parseFloat(d3.select("#thresh_value_edgespos_g1")[0][0].value));
	applyFiltering();
}

function filterRemoveAllNodes(){
	new_nodes_selected = [];
	
	nodes_to_check = [];
	
	// find links to these nodes
	find_links_tresh(new_nodes_selected,original_links,parseFloat(d3.select("#thresh_value_edgespos_g1")[0][0].value));
	applyFiltering();
}

function filterFromDescriptorName(nodeName,exit){
	var temp =[]
	if (exit){
		new_nodes_selected.forEach(function(node){
			if (!(node.name == nodeName)){
				temp.push(node);
			}
		});
		new_nodes_selected = temp.slice(0);
	}
	else{
		original_nodes.forEach(function(node) {
			if (node.name == nodeName){
				new_nodes_selected.push(node);
			}
		});
	}
	nodes_to_check = new_nodes_selected.slice(0);
	
	// find links to these nodes
	find_links_tresh(new_nodes_selected,original_links,parseFloat(d3.select("#thresh_value_edgespos_g1")[0][0].value));
	applyFiltering();
}

function find_links_tresh(nodes,all_links,val_tresh_edges){
	links_by_nodes_selected = [];
	all_links.forEach(function(link) { // if the source or target point to an existing node
		node_source_target(nodes,link);
			if ((is_source_target===1) && (Math.abs(parseFloat(link.value))>=val_tresh_edges)){
				links_by_nodes_selected.push(link);
			}
	});
}

function filter(val_tresh_edges,val_tresh_nodes){
	new_nodes_selected = [];
	nodes_to_check = [];
	
	var nodesPresentInList = original_nodes.filter(function(d,i){if (arr_index_sel.indexOf(i)>=0) return true;})
	nodesPresentInList.forEach(function(node) {
		if (mode==0){
			if ((Math.abs(parseFloat(node.global)))>=val_tresh_nodes){
				new_nodes_selected.push(node);
			}
		}
		else if (mode==1){
			if ((Math.abs(parseFloat(node.global)))<=val_tresh_nodes){
				new_nodes_selected.push(node);
			}
		}
	});
	nodes_to_check = new_nodes_selected.slice(0);
	
	// find links to these nodes
	find_links_tresh(new_nodes_selected,original_links,val_tresh_edges);
	applyFiltering();
}

function applyFiltering(){
	var path_filter = svg.selectAll("path")
						.data(links_by_nodes_selected)
						.attr("class", function(d) { 	
							return "link " + d.type; 
						})
						.text(function (d) {
							return d.source.name +" <--> "+ d.target.name + "\n" + d.value;
						});
	
	path_filter.enter().append("path")
				.attr("class", function(d) { 	
						   return "link " + d.type; })
				.style("opacity",set_opac_path);
				
	path_filter.append("title").text(function (d) {
				   return d.source.name +" <--> "+ d.target.name + "\n" + d.value;});		
	
	path_filter.exit().remove();
	
	var node_filter = svg.selectAll(".node")
						.data(new_nodes_selected, function(d,i) { 
							return d.id || (d.id = ++i); });
	
	node_filter.selectAll("circle").attr("r", function(d) {return scale_node(Math.abs(parseFloat(d.global))); })
		.style("opacity",set_opac_v1)
		.style("fill", function(d) {
			var scale=d3.scale.linear()  
				.domain([1,d.totalMod])
				.range(['#FFF', '#000'])
			return scale(d.model);
		});
	
	node_filter.selectAll("title")
				.text(function(d) { 
					if (mode==0){
						leyenda_nodo = "Correlation between descriptor and property (node size): ";
					}
					else if (mode==1){
						leyenda_nodo = "Conditional entropy of property given descriptor (node size): ";
					}
					return d.name + "\n" + leyenda_nodo + d.global + "\n" + leyenda_tam_nodo + d.model;
				});
				 
	node_filter.selectAll("text")
					.attr("dx", function(d) { 
					   return scale_node(Math.abs(parseFloat(d.global))) + 2; } )
					.attr("dy", ".35em")
					.text(function(d) { return d.name });
	
											
	var nodeAdded_filter = node_filter.enter().append("g")
						  .attr("class", "node")
						  .call(force.drag);
	
	nodeAdded_filter.append("circle")
			.attr("r", function(d) {return scale_node(Math.abs(parseFloat(d.global))); })
			.style("opacity",set_opac_v1)
			.style("fill", function(d) {
				   var scale=d3.scale.linear()  
								.domain([1,d.totalMod])
								.range(['#FFF', '#000'])
								return scale(d.model);
					});	
	
	nodeAdded_filter.append("title")
				.text(function(d) { 
					if (mode==0){
						leyenda_nodo = "Correlation between descriptor and property (node size): ";
					}
					else if (mode==1){
						leyenda_nodo = "Conditional entropy of property given descriptor (node size): ";
					}
					return d.name + "\n" + leyenda_nodo + d.global + "\n" + leyenda_tam_nodo + d.model ;
				});
				
	nodeAdded_filter.append("text")
			.attr("dx", function(d) { 
				if (Math.abs(parseFloat(d.global))<min_val_node)
					min_val_node = Math.abs(parseFloat(d.global));
				if (parseFloat(d.global)>max_val_node)
					max_val_node= parseFloat(d.global);
			   return scale_node(Math.abs(parseFloat(d.global))) + 2; } )
			.attr("dy", ".35em")
			.text(function(d) { return d.name });
										
										
	nodeAdded_filter.on("mouseover",function(d,i){
						force.stop();
						svg.selectAll(".link").style("opacity", function(o) {
							   return o.source === d || o.target === d ? 1 : 0.1;
						});
						svg_view2.selectAll(".link").style("opacity", function(o) {
							return o.source === nodes_data_view2[i] || o.target === nodes_data_view2[i]  ? 1 : 0.1;
						});
						svg_view3.selectAll(".link_view3").style("opacity", function(o) {
							return o.source === nodes_data_view3[i] || o.target === nodes_data_view3[i]  ? 1 : 0.1;
						});
					})
				.on("mouseout",function(d,i){
						   force.stop();
							svg.selectAll(".link").style("opacity", function(o) {
								return o.source === d || o.target === d ? 1 : 1.0;
							})
							svg_view2.selectAll(".link").style("opacity", function(o) {
								return o.source === nodes_data_view2[i] || o.target === nodes_data_view2[i]  ? 1 : 1.0;
							});
							svg_view3.selectAll(".link_view3").style("opacity", function(o) {
								return o.source === nodes_data_view3[i] || o.target === nodes_data_view3[i]  ? 1 : 1.0;
							});							
						})
				.on("dblclick",function(d){   
							force.stop();
							window.open("http://michem.disat.unimib.it/mole_db/help/desc_list.php");
							document.documentElement.innerHTML.indexOf(d.name);								
							}); 
   
	node_filter.exit().remove();

		
	force.nodes(new_nodes_selected).links(links_by_nodes_selected);
	
	force.resume();
	
	force.on("tick", function() {
			node_filter.attr("cx", function(d) { return d.x =  Math.max(scale_node(Math.abs(parseFloat(d.global))), Math.min(width - (scale_node(Math.abs(parseFloat(d.global)))), d.x)); })
				.attr("cy", function(d) { return d.y =  Math.max(scale_node(Math.abs(parseFloat(d.global))), Math.min(height - (scale_node(Math.abs(parseFloat(d.global)))), d.y)); });
			node_filter.attr("transform", function(d) { 
							return "translate(" + d.x + "," + d.y + ")"; });
							
			path_filter.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; })							
				.style("stroke-width", 3);
			path_filter.attr("d", function(d) {
							var dx = d.target.x - d.source.x,
								dy = d.target.y - d.source.y,
								dr = Math.sqrt(dx * dx + dy * dy);
								return "M" + 
										d.source.x + "," + 
										d.source.y + "A" + 
										dr + "," + dr + " 0 0,1 " + 
										d.target.x + "," + 
										d.target.y;
								});
			
	});		
}
 
function dragstart(d) {
  d.fixed = true;
  d3.select(this).classed("fixed", true);
}

function source_in(source,nodes){
var find = 0;
find_source = 0;
nodes.forEach(function(node){
	if ((node === source) && (find === 0)){    
	    find_source = 1;
		find = 1;
	}
 });
}

function target_in(target,nodes){
var find = 0;
find_target = 0;
nodes.forEach(function(node){
	if ((node === target) && (find === 0)){    
	    find_target = 1;
		find = 1;
	}
 });
}

function node_source_target(arr_nodes,v_link){
 is_source_target = 0;
 find = 0;
 source_in(v_link.source,arr_nodes);
 target_in(v_link.target,arr_nodes);
 if (find_target === 1 && find_source === 1){    
	    is_source_target = 1;
		find = 1;
  }
}

function find_links(nodes,all_links){
 links_by_nodes_selected = [];
 all_links.forEach(function(link) { // si el source o target apuntan a un nodo existente lo pongo
		node_source_target(nodes,link);
		if (is_source_target===1) links_by_nodes_selected.push(link);
		});
			
 }

//**************************** global button modes **********************************************	
function create_options_modes(){ 
 radio_modes = d3.select("#radio_modes").selectAll("label")
								 .data(modes)
								 .enter()
								 .append("label")
								 .text(function(d) {return d;})
								 .insert("input");
								 
 radio_modes.style({'font-size':'13'})							 
			.attr({
									type: "radio",
									class: "modes",
									name: "Modes",
									value: function(d, i) {return i;}
			})				
			.property("checked", function(d, i) {
								               return i===j_m;
			})
			.on("click",function(d,i){  
					if (i == 0) { // Spearman
						mode = 0;
						d3.select("#scalesCorrelationPositive").style("opacity", "1.0");
						d3.select("#scalesCorrelationNegative").style("opacity", "1.0");
						 d3.select("#scale_entropy").style("opacity", "0.2");;
													
						if (window.opener.loadedExternally){
							load_graph_v1('foo',window.opener.data_view1_SP_json);
							load_graph_v2('foo',window.opener.data_view2_SP_json);
						}
						else{
							load_graph_v1(path_data+"data_view1_SP.json",'foo');
							load_graph_v2(path_data+"data_view2_SP.json",'foo');
						}
						
						descheck_all_nodes();
						check_nodes_filtered(nodes_to_check);
					}
					if (i == 1) { // Kendall
						mode = 0;
						d3.select("#scalesCorrelationPositive").style("opacity", "1.0");
						d3.select("#scalesCorrelationNegative").style("opacity", "1.0");
						d3.select("#scale_entropy").style("opacity", "0.2");
													
						if (window.opener.loadedExternally){
							load_graph_v1('foo',window.opener.data_view1_KD_json);
							load_graph_v2('foo',window.opener.data_view2_KD_json);
						}
						else{
							load_graph_v1(path_data+"data_view1_KD.json","foo");
							load_graph_v2(path_data+"data_view2_KD.json","foo");
						}
					}
					if (i == 2) { // entropy mode
						mode = 1;
						d3.select("#scale_entropy").style("opacity", "1.0");
							
							
						  d3.select("#scalesCorrelationPositive").style("opacity", "0.2");
						  d3.select("#scalesCorrelationNegative").style("opacity", "0.2");
													
													
						if (window.opener.loadedExternally){
							load_graph_v1("foo",window.opener.data_view1_entropy_json);
							load_graph_v2("foo",window.opener.data_view2_entropy_json);
						}
						else{
							load_graph_v1(path_data+"data_view1_entropy.json","foo");
							load_graph_v2(path_data+"data_view2_entropy.json","foo");
						}
					}
					    for (ind=desc_numb; ind<=(mod_tot+(desc_numb-1)); ind++){ 
						  d3.selectAll("#nv3-" + ind).style("stroke","#000000")
												 .style("stroke-width", "0.3");
						  }

			})
}
//-------------------------------------------------------------------------------------------------------------
function encodeOpacity(arr_links){	
	arr_links.forEach(function(link) {
		if (v(link.value) >= 0 && v(link.value) <= 0.25) {
			link.type = "twofive";
		} else if (v(link.value) > 0.25 && v(link.value) <= 0.50) {
			link.type = "fivezero";
		} else if (v(link.value) > 0.50 && v(link.value) <= 0.75) {
			link.type = "sevenfive";
		} else if (v(link.value) > 0.75 && v(link.value) <= 1) {
			link.type = "onezerozero";
		} else if (v(link.value) < 0 ) {//blue for negative values
			var numb = Math.abs(v(link.value));
			if (numb >= 0 && numb <= 0.25) {
				link.type = "negtwofive";
			} else if (numb > 0.25 && numb <= 0.50) {
				link.type = "negfivezero";
			} else if (numb > 0.50 && numb <= 0.75) {
				link.type = "negsevenfive";
			} else if (numb > 0.75 && numb <= 1) {
				link.type = "negonezerozero";
			}
		} 
	});
}

function sevenfiveOne(){
if (mode === 0) {
  force.stop();
   svg.selectAll("path")
      .filter(function(d) { return v(d.value) <=0.75; })
      .transition()
      .style("opacity", 0.0)
	  .style("visibility", "hidden");
}
}


function fiveZero(){
if (mode === 0) {
  force.stop();
   svg.selectAll("path")
      .filter(function(d) { return v(d.value)<0.50; })
      .transition()
      .style("opacity", 0.0)
	  .style("visibility", "hidden");
	svg.selectAll("path")
      .filter(function(d) { return v(d.value)>=0.75; })
      .transition()
      .style("opacity", 0.0)
	  .style("visibility", "hidden");
}
}

function twoFive(){
if (mode === 0) {
  force.stop();
   svg.selectAll("path")
      .filter(function(d) { return v(d.value)<0.25; })
      .transition()
      .style("opacity", 0.0)
	  .style("visibility", "hidden");
   svg.selectAll("path")
      .filter(function(d) { return v(d.value)>=0.50; })
      .transition()
      .style("opacity", 0.0)
	  .style("visibility", "hidden");
}
}

function zeroZero(){
if (mode === 0) {
   force.stop();
   svg.selectAll("path")
      .filter(function(d) { return v(d.value) >=0.25; })
      .transition()
      .style("opacity", 0.0)
	  .style("visibility", "hidden");
     svg.selectAll("path")
      .filter(function(d) { return v(d.value) <0.0; })
      .transition()
      .style("opacity", 0.0)
	  .style("visibility", "hidden");
}
}

function negsevenfiveOne(){
if (mode === 0) {
  force.stop();
   svg.selectAll("path")
      .filter(function(d) { return  v(d.value) >=-0.75; })
      .transition()
      .style("opacity", 0.0)
	  .style("visibility", "hidden");
}
}

function negfiveZero(){
if (mode === 0) {
   force.stop();
   svg.selectAll("path")
      .filter(function(d) { return  v(d.value)>-0.50; })
      .transition()
      .style("opacity", 0.0)
	  .style("visibility", "hidden");
	svg.selectAll("path")
      .filter(function(d) { return  v(d.value)<-0.75; })
      .transition()
      .style("opacity", 0.0)
	  .style("visibility", "hidden");
}
}

function negtwoFive(){
if (mode === 0) {
   svg.selectAll("path")
      .filter(function(d) { return  v(d.value)>-0.25; })
      .transition()
      .style("opacity", 0.0)
	  .style("visibility", "hidden");
   svg.selectAll("path")
      .filter(function(d) { return  v(d.value)<=-0.50; })
      .transition()
      .style("opacity", 0.0)
	  .style("visibility", "hidden");
}
}

function negzeroZero(){
if (mode === 0) {
  force.stop();
   svg.selectAll("path") 
      .filter(function(d) { return  v(d.value) <-0.25; })
      .transition()
      .style("opacity", 0.0)
	  .style("visibility", "hidden");
   svg.selectAll("path")
      .filter(function(d) { return  v(d.value) >0.0; })
      .transition()
      .style("opacity", 0.0)
	  .style("visibility", "hidden");
}
}

function One(){
if (mode === 0) {
 force.stop();
 svg.selectAll("path").style("opacity", 1)
					  .style("visibility", "visible");
}
}

function encodeOpacity_Entropy(arr_links){	
	arr_links.forEach(function(link) {
		if (link.value <= perc_25) {
			link.type = "MIperc_25";
		} else if (link.value > perc_25 && link.value <= perc_50) {
			link.type = "MIperc_50";
		} else if (link.value > perc_50 && link.value <= perc_75) {
			link.type = "MIperc_75";
		}else if (link.value > perc_75 && link.value <= perc_100) {
			link.type = "MIperc_100";
		} 
	});

}

function MI_perc_25(){
if (mode === 1) {
   svg.selectAll("path") 
      .filter(function(d) { return  d.value >perc_25; })
      .transition()
      .style("opacity", 0.0)
	  .style("visibility", "hidden");
}
}

function MI_perc50(){
if (mode === 1) {
   svg.selectAll("path") 
      .filter(function(d) { return  d.value <=perc_25; })
      .transition()
      .style("opacity", 0.0)
	  .style("visibility", "hidden");
   svg.selectAll("path")
      .filter(function(d) { return  d.value >perc_50; })
      .transition()
      .style("opacity", 0.0)
	  .style("visibility", "hidden");
}
}

function MI_perc75(){
if (mode === 1) {
   svg.selectAll("path") 
      .filter(function(d) { return  d.value <=perc_50 ; })
      .transition()
      .style("opacity", 0.0)
	  .style("visibility", "hidden");
   svg.selectAll("path")
      .filter(function(d) { return  d.value >perc_75 ; })
      .transition()
      .style("opacity", 0.0)
	  .style("visibility", "hidden");
}
}

function MI_perc100(){
if (mode === 1) {
   svg.selectAll("path") 
      .filter(function(d) { return  d.value <=perc_75 ; })
      .transition()
      .style("opacity", 0.0)
	  .style("visibility", "hidden");
}
}

function All_MI(){
if (mode === 1) {
	 force.stop();
	 svg.selectAll("path").style("opacity", 1)
						 .style("visibility", "visible");
	}
}

function show_scale(){
  var sessions = new Array(
        {color: "#FF0000",range: "(0.75,1]"},
        {color: "#FF4000",range: "(0.50,0.75]" },
        {color: "#FF8000",range: "(0.25,0.50]"},
        {color: "#FFBF00",range: "(0,0.25]"}
 );
//rows
	var tr = d3.select("tbody").selectAll("tr")
	.data(sessions).enter().append("tr")
 
//cells
var td = tr.select("td")
  .data(function(d){return d3.values(d)})
  .enter().append("td")
  .style("fill", function(d) { return d.color; });
  
 }
 
function Show_Range_25(){
  d3.select("#tditem_range25MI").text("[0,"+parseFloat(perc_25).toFixed(2)+"]");
}
function Hide_Range_25(){
  d3.select("#tditem_range25MI").text("0-25%");
}

function Show_Range_50(){
  d3.select("#tditem_range50MI").text("["+parseFloat(perc_25).toFixed(2)+","+parseFloat(perc_50).toFixed(2)+"]");
}
function Hide_Range_50(){
  d3.select("#tditem_range50MI").text("25-50%");
}

function Show_Range_75(){
  d3.select("#tditem_range75MI").text("["+parseFloat(perc_50).toFixed(2)+","+parseFloat(perc_75).toFixed(2)+"]");
}
function Hide_Range_75(){
  d3.select("#tditem_range75MI").text("50-75%");
}

function Show_Range_100(){
  d3.select("#tditem_range100MI").text("["+parseFloat(perc_75).toFixed(2)+","+parseFloat(perc_100).toFixed(2)+"]");
}
function Hide_Range_100(){
  d3.select("#tditem_range100MI").text("75-100%");
}
 //***************************************************WEKA****************************************************************************
 
 //Select the prediction method
 function handleSelection_Prediction(choice){
if(choice=="formLR")  //method_pred = 0 none
	{	  
	  d3.select("#butt_run").attr("disabled",null);
	  method_pred = 1;
	  d3.select("#formLR").style("display", "block");
	  d3.select("#formDT").style("display", "none");
	  d3.select("#formNN").style("display", "none");
	}
	else
	{
	  if(choice=="formDT"){
	    d3.select("#butt_run").attr("disabled",null);
		method_pred = 2;
	    d3.select("#formDT").style("display", "block");
		d3.select("#formLR").style("display", "none");
		d3.select("#formNN").style("display", "none");
	  }
	  else{
	    if(choice=="formNN"){
			d3.select("#butt_run").attr("disabled",null);
			method_pred = 3;
			d3.select("#formNN").style("display", "block");
			d3.select("#formLR").style("display", "none");
			d3.select("#formDT").style("display", "none");
		}else{
			if (choice=="noForm"){
				d3.select("#butt_run").attr("disabled",true);
				d3.select("#formNN").style("display", "none");
				d3.select("#formLR").style("display", "none");
				d3.select("#formDT").style("display", "none");
			}
		}
	  }
	  
	}
}

//Get parameters for LR
function parameters_LR(){
  if (d3.select("#select_method_LR")[0][0].value == "M5"){
		      method = "0 ";
		  } else{
			  if (d3.select("#select_method_LR")[0][0].value == "No_AT"){
					method = "1 ";
				}else{
					method = "2 ";
				}
		  }
		  ridge = d3.select("#ridge_LR")[0][0].value;
		  if (d3.select("#elimColAtt_LR")[0][0].checked == true){
				elimColAtt="";
		  }else{
		       elimColAtt = "-C";
		  }
		  model = model + "-S " + method + elimColAtt + " -R " + ridge;

}

//Get parameters for DT
function parameters_DT(){
		min_num_inst = d3.select("#minNumbInst_DT")[0][0].value;
		if (d3.select("#buildRT_DT")[0][0].checked == false){
			buildRT="";
		}else{
			buildRT = "-R";
		}
		if (d3.select("#useUnsmoothed_DT")[0][0].checked == false){
			useUnsmoothed="";
		}else{
			useUnsmoothed = "-U";
		}
		if (d3.select("#unpruned_DT")[0][0].checked == false){
			unpruned="";
		}else{
			unpruned = "-N";
		}
			
		model = model + unpruned + useUnsmoothed + buildRT + "-M " + min_num_inst;

}

//Get parameters for NN
 function parameters_NN(){
	learningRate = d3.select("#learningRate_NN")[0][0].value;
	momentum = d3.select("#momentum_NN")[0][0].value;
	trainingTime = d3.select("#trainingTime_NN")[0][0].value;
	seed = d3.select("#seed_NN")[0][0].value;
	validThesh = d3.select("#validThesh_NN")[0][0].value;
	hiddLay = d3.select("#hiddLay_NN")[0][0].value;
	validSetSize = d3.select("#validSetSize_NN")[0][0].value;
	
	if (d3.select("#nomTobinFilt_NN")[0][0].checked == true){
		nomTobinFilt="";
	}else{
		nomTobinFilt = "-B";
	}	
	if (d3.select("#normAtt_NN")[0][0].checked == true){
		normAtt="";
	}else{
		normAtt= "-I";
	}
	if (d3.select("#normNumClass_NN")[0][0].checked == true){
		normNumClass="";
	}else{
		normNumClass = "-C";
	}
	if (d3.select("#reset_NN")[0][0].checked == true){
		reset="";
	}else{
		reset = "-R";
	}
	if (d3.select("#decay_NN")[0][0].checked == false){
		decay="";
	}else{
		decay = "-D";
	}
	model = model + "-L " +learningRate + " -M " + momentum + " -N " +trainingTime + " -V "+validSetSize +" -S "+seed + " -E "+validThesh + " -H "+hiddLay + nomTobinFilt + normNumClass + normAtt + reset + decay;
 }
 
 function handleSelection_Folds(val){
 if (d3.select("#crossVal")[0][0].checked == true){
       d3.select("#folds_TO")[0][0].disabled = false;
	   d3.select("#percent_TO")[0][0].disabled = true;
	}else{
	  d3.select("#folds_TO")[0][0].disabled = true;
	  d3.select("#percent_TO")[0][0].disabled = false;
	}	
 }
 
 function handleSelection_Percentage(val){
  if (d3.select("#percentSplit")[0][0].checked == true){
       d3.select("#percent_TO")[0][0].disabled = false;
	   d3.select("#folds_TO")[0][0].disabled = true;
	}else{
	  d3.select("#percent_TO")[0][0].disabled = true;
	  d3.select("#folds_TO")[0][0].disabled = false;
	}	
 }
  
 //Get parameters for test options
 function parameters_TestOp(){
  if (d3.select("#crossVal")[0][0].checked == true){
       opt_t =1;
       folds = d3.select("#folds_TO")[0][0].value;
	   test_op = " -x "+folds;
	}else{
	  opt_t =2;
	  if (d3.select("#percentSplit")[0][0].checked == true){
       percent = d3.select("#percent_TO")[0][0].value;
	   test_op = " -split-percentage " +percent;
	}
	} 
 }
 
 //Run the method whit the selected parameters
 function Run_Prediction(){
	if(method_pred==1){
		  model = "weka.classifiers.functions.LinearRegression ";
		  parameters_LR();
	}else{
	    if(method_pred==2){
			model = "weka.classifiers.trees.M5P ";
			parameters_DT();
		}else{
			model = "weka.classifiers.functions.MultilayerPerceptron ";
			parameters_NN();
		}
	}
   parameters_TestOp();
   generate_data();

   cant_inst = (data.length - 1);
   if (opt_t == 1){
      if (cant_inst>=parseInt(folds)){
	     run();
	  }else{
		 alert("Should be more instances that folds!")
	  }
   }else{
		run();
	}		
 }

 function generate_data(){
   data = [];
 // data = [["Mn/MW", "HCS", "ALOGP", "Se", "ElongAtBreak"],["0.4", "2.04", "1.99", "1.95", "1.4"],["1158.4", "1375", "7204.7", "2175.6", "127.14"],["5", "1.27", "1.27", "1.27", "5"],["2.0435","1.8718","2.2963","1.7561","2.1591"],["7.5","24.55","41.33","28.9","45.13"]]
	 var ind_arr,index_ult;
     cant_mol = csv_data[0].length;
	 if (arr_index_sel.length == 0){
	    alert("Select some descriptors!")
	 }
	new_array_desc_names = [];
	//array of descriptor names 
	 arr_index_sel.forEach(function(elem,i) {  //descriptors selected from the list
	    ind_arr = i;
		new_array_desc_names[i] = names_data[elem+1].toString(); 
	 });
	 new_array_desc_names[ind_arr+1] = names_data[0];
	 data[0] = new_array_desc_names;
	 
	 //array of descriptor values
for (ind=0; ind<cant_mol; ind++){
	    array_desc_val = [];
	    arr_index_sel.forEach(function(elem,i) {
		    index_ult = i;
			array_desc_val[i] = (csv_data[elem+1][ind]).toString();
	    });
		array_desc_val[index_ult+1] = (csv_data[0][ind]).toString();
		data[ind+1] = array_desc_val; 
	} 
	 

 
 }
 
 
//Run the script
 function run(){	
 
     d3.select("#results_prediction")[0][0].value = "";
 	 var currentdate = new Date(); 
  	 inputData = "inputData.csv";
	 currentDate = currentdate.getDate() + "-"
                + (currentdate.getMonth()+1)  + "-" 
                + currentdate.getFullYear(); 
	 currentTime =  currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
	 var File_arff = "inputData.arff"
	 outputData = "outputData.txt";
	 name_outputFile = currentDate+currentTime+outputData;
	 script1 = "java -cp /usr/share/java/weka.jar weka.core.converters.CSVLoader " + UNIX + CGIDATA+inputData;
     stdout1 =  UNIX + CGIDATA+File_arff;
	 script2 = "java -cp /usr/share/java/weka.jar "+model+" -t "+ UNIX + CGIDATA+File_arff+test_op;
     stdout2 =  UNIX + CGIDATA +name_outputFile;
	 dataToSend = {"data": data,"script1": script1,"stdout1":stdout1, "script2": script2, "stdout2":stdout2,"inputFile_s1": UNIX + CGIDATA + inputData, "nonExistingOutputFile_s2": UNIX + CGIDATA + name_outputFile};
     urlString='./cgi-bin/executeWekaScript.py';
     jQuery.ajax({
                 url: urlString,
                 traditional : true, 
                 type: 'POST',
                 cache: false,
                 data: JSON.stringify(dataToSend),
                 contentType: 'application/json',
                 processData: false,
                 success: on_request_success,
                 error: on_request_error
        })
 
 }
								
function on_request_success(response){
	//show results
       output = "." + response.slice(2);
		d3.text(output, function(error, output_data) {
			d3.select("#results_prediction")[0][0].value = output_data;
		});
	        
}

function on_request_error(r, text_status, error_thrown) {
         console.debug('error', text_status + ", " + error_thrown + ":\n" + r.responseText);
}

function ButtonSyncG1() {
  descheck_all_nodes();
  check_nodes_filtered(nodes_to_check);
}
