FIN_PATH = "?callback=foo"
var width_view2 = 500,
    height_view2 = 400;
var force_view2 = d3.layout.force()
    .size([width_view2, height_view2])
    .charge(-300) //neg:repulsión,pos:atracción
    .linkDistance(270)
	.theta(0.4);
var svg_view2;
var svg_ent_view2;
var drag_view2 = force_view2.drag()
    .on("dragstart", dragstart);
var nodes_data_view2   
var min_val_edgeMod = 0; 
var max_val_edgeMod;
var scale_mod_tresh;
var set_opac_v2 = 0.8;

var link_view2;
var node_view2;
var path_view2;

var bound_100,bound_70,bound_30,bound_0;

var loadedFirstTime_g2 = true;

var csv_data;// to read the table of values for each descriptor and property (each row is a descriptor)
var names_data;

var selectEnt;
var indice_nodo_ctual;
var xAxis_scatt;
var xdata;
var width_scatterplot;
var height_scatterplot;
var main;
var x;
var indice_hist;
var selectEnt_hist;
var mainEnter3_hist;
var selectEnt_hist_prop;
var mainEnter3_hist_prop;
var yAxis_hist_prop;
var y_scatt;
var mode_hist; // 0: hist_desc, 1:hist_prop

var original_links_g2;
var nodes_data_view2;

var entropy_links_view2;
var entropy_nodes_view2;
var radio_data = ["Descriptors", "Property", "None"], 
    j = 2;  // Choose the star as default

var  radiob,
    first_time = true;
var ind_ant_check;
var mod_totales;
var correl_coef;
var new_links_selected_g2 = [];
var new_nodes_selected_g2 = [];
var scale_nodes2_size = d3.scale.linear().domain([0,1]).range([3,15]); 
var min_val_nodeg2 = 1;
var max_val_nodeg2 = -1;

var scale_nodev2;
var first = 1;

var names_arr;
var selected_descriptor_list;


var checkb;
var index_none;
var links_by_nodes_selected_g2;
var nodes_to_check_g2;


function load_graph_v2(path_filev2,dataName){

    d3.select("#div_view2").select("svg").remove();
	svg_view2 = d3.select("#div_view2").append("svg")
	       		.attr("width", width_view2)
				.attr("height", height_view2);
	
	if (window.opener.loadedExternally){
		updateGraph_v2('foo',dataName);
	}
	else{
		d3.json(path_filev2, function(error,data) {
			updateGraph_v2(error,data);
		});
	}
	
	function updateGraph_v2(error_view2,data_view2) {
		nodes_data_view2   = data_view2.nodes;
		original_links_g2 = data_view2.links;
		
		original_nodes_g2 = data_view2.nodes;
		
		force_view2
			 .nodes(data_view2.nodes)
			 .links(data_view2.links)
			 .linkDistance(function(d,i){
					var scaleEdge = d3.scale.linear().domain([0,max_val_edgeMod]).range([maxEdgeLength,minEdgeLength]);
					return scaleEdge(d.value);
				 })
			 .start();
		
		if (mode === 1){ //entropy
			max_val_node2_entropy = 0;
			min_val_node2_entropy = 99;
			original_nodes_g2.forEach(function(d, i) {
				if (max_val_node2_entropy < parseFloat(d.global)){
					max_val_node2_entropy = parseFloat(d.global);
				}
				if (min_val_node2_entropy > parseFloat(d.global)){
					min_val_node2_entropy = parseFloat(d.global);
				}
			});
			max_val_node2 = max_val_node2_entropy;
			min_val_node2 = min_val_node2_entropy;
			
			scale_nodev2 = d3.scale.linear().domain([max_val_node2_entropy,min_val_node2_entropy]).range([minRadiousCircle,maxRadiousCircle]);
		}else{
			max_val_node2 = 0;
			min_val_node2 = 1;
			original_nodes_g2.forEach(function(d, i) { 
				if (Math.abs(parseFloat(d.global)) < min_val_node2){
					min_val_node2 = Math.abs(parseFloat(d.global));
				}
				if (Math.abs(parseFloat(d.global)) > max_val_node2){
					max_val_node2 = Math.abs(parseFloat(d.global));
				}
			});
			scale_nodev2 = d3.scale.linear().domain([0,1]).range([minRadiousCircle,maxRadiousCircle]);
		}
		//Obtain number of different models
		mod_totales = parseFloat(nodes_data_view2[0].totalMod);
		max_val_edgeMod = mod_totales;
		calculateRange_links();
		encodeOpacity_view2(original_links_g2);
		
		
		path_view2 = svg_view2.append("svg:g").selectAll("path")
							.data(data_view2.links);
							
		node_view2 = svg_view2.selectAll(".node")
				  .data(data_view2.nodes, function(d,i) { return d.id || (d.id = ++i); })
				  .enter().append("g")
				  .attr("class", "node")
				  .call(force_view2.drag);
		
		path_view2.enter().append("path")
					.attr("class", function(d) {return "link " + d.type; })
					.style("opacity",set_opac_path)
					.on("mouseover", function (d){
								force_view2.stop();
								d3.selectAll("path").append("title").text(function (d) {return d.source.name +" <--> "+ d.target.name + "\n" +"Co-present in " + d.value + " models";});
															});
		path_view2.append("title").text(function (d) {
				   return d.source.name +" <--> "+ d.target.name + "\n" +"Co-present in " + d.value + " models";});					  
		node_view2.append("circle")
			.attr("r", function(d) { return scale_nodev2(Math.abs(parseFloat(d.global))); })
			.style("opacity",set_opac_v2)
			.style("fill", function(d) {
						var scale_view2=d3.scale.linear()  
								.domain([1,d.totalMod])
								.range(['#FFF', '#000'])
								return scale_view2(d.model);
								});
		node_view2.append("title")
				  .text(function(d) { if (mode==1){
											leyenda_nodo = "Conditional entropy between descriptor and property (node size): "
										}
									return d.name + "\n" + leyenda_nodo + d.global + "\n" + leyenda_tam_nodo + d.model ;});
		node_view2.append("text")
			.attr("dx", function(d) { 
			  return scale_nodev2(Math.abs(parseFloat(d.global))) + 2; } )
			.attr("dy", ".35em")
			.text(function(d) { return d.name });
						

		node_view2.on("mouseover",function(d,i){
						force_view2.stop();
						svg_view2.selectAll(".link").style("opacity", function(o) {
							   return o.source === d || o.target === d ? 1 : 0.1;
						});
						svg.selectAll(".link").style("opacity", function(o) {
							return o.source === nodes_data_view1[i] || o.target === nodes_data_view1[i]  ? 1 : 0.1;
						});
						svg_view3.selectAll(".link_view3").style("opacity", function(o) {
							return o.source === nodes_data_view3[i] || o.target === nodes_data_view3[i]  ? 1 : 0.1;
						});
					})
			.on("mouseout",function(d,i){
						force_view2.stop();
						svg_view2.selectAll(".link").style("opacity", function(o) {
							return o.source === d || o.target === d ? 1 : 1.0;
						});
						svg.selectAll(".link").style("opacity", function(o) {
							return o.source === nodes_data_view1[i] || o.target === nodes_data_view1[i]  ? 1 : 1.0;
						});
						svg_view3.selectAll(".link_view3").style("opacity", function(o) {
							return o.source === nodes_data_view3[i] || o.target === nodes_data_view3[i]  ? 1 : 1.0;
						});
					})
			.on("click",function(d,i){  
						if (first_time) {
							create_options_hist(); 
							first_time = false;}
						indice_nodo_ctual = d.id;
						scatterplot(d.id); 
						if (indice_hist == 0) {
							descriptors_histogram();
						}
						});						
		force_view2.on("tick", function() {
				node_view2.attr("cx", function(d) { return d.x =  Math.max(scale_nodev2(Math.abs(parseFloat(d.global))), Math.min(width_view2 - (scale_nodev2(Math.abs(parseFloat(d.global)))), d.x)); })
						  .attr("cy", function(d) { return d.y =  Math.max(scale_nodev2(Math.abs(parseFloat(d.global))), Math.min(height_view2 - (scale_nodev2(Math.abs(parseFloat(d.global)))), d.y)); });
				path_view2.attr("d", function(d) {
										var dx = d.target.x - d.source.x,
											dy = d.target.y - d.source.y,
											dr = Math.sqrt(dx * dx + dy * dy);
										return "M" + 
											d.source.x + "," + 
											d.source.y + "A" + 
											dr + "," + dr + " 0 0,1 " + 
											d.target.x + "," + 
											d.target.y;
									})
									.style("stroke-width", 3);;
				node_view2.attr("transform", function(d) { 
								return "translate(" + d.x + "," + d.y + ")"; });
		})
		scale_mod_tresh = d3.scale.linear().domain([0,100]).range([parseFloat(max_val_edgeMod),0]);
		
		scale_tresh_nodeg2 = d3.scale.linear().domain([0,100]).range([parseFloat(max_val_node2),parseFloat(min_val_node2)]);
		
		if (loadedFirstTime_g2){
			//if first time accomodate value and sliders
			var val_edge_thr = parseFloat(max_val_edgeMod)*0.75;
			thresh_edges_g2 = val_edge_thr;
			d3.select("#thresh_value_edges_g2")[0][0].value = Math.floor(parseFloat(val_edge_thr)).toFixed(0);	
			
			var val_nodes_thr = parseFloat(max_val_node2)- (parseFloat(max_val_node2)/4);
			thresh_nodes_g2 = val_nodes_thr;			
			d3.select("#thresh_value_nodes_g2")[0][0].value = parseFloat(val_nodes_thr).toFixed(4);
			
			//filter graph based on initial settings
			new_nodes_selected_g2 = original_nodes_g2.slice(0);
			filter_g2(thresh_edges_g2,thresh_nodes_g2);
			
			graph2Loaded = true;
			if (graph1Loaded==graph2Loaded){
				loadDescriptorAndNamesValues();
			}
			loadedFirstTime_g2 = false;
		}
		else{
			//accomodate proportional edge value
			d3.select("#thresh_value_edges_g2")[0][0].value = Math.floor(scale_mod_tresh(parseFloat(d3.select("#thresh_slider_edges_g2")[0][0].value))).toFixed(0);
			
			filterFromDescriptorPrevious_g2();
		}
	}	 
}		

function filterFromDescriptorPrevious_g2(){
	var temp =[];
	var minSelectedValue = 99;
	var maxSelectedValue = 0;
	var indexNewNodes = 0;
	original_nodes_g2.forEach(function(node,i){
		if (node.name==new_nodes_selected_g2[indexNewNodes].name){
			indexNewNodes = Math.min(indexNewNodes + 1,new_nodes_selected_g2.length - 1);
			temp.push(node);
			if (minSelectedValue > Math.abs(parseFloat(node.global))){
				minSelectedValue = Math.abs(parseFloat(node.global));
			}
			if (maxSelectedValue < Math.abs(parseFloat(node.global))){
				maxSelectedValue = Math.abs(parseFloat(node.global));
			}
		}
	});
	
	new_nodes_selected_g2 = temp.slice(0);
	nodes_to_check_g2 = new_nodes_selected_g2.slice(0);
	
	// find links to these nodes
	find_links_tresh_g2(new_nodes_selected_g2,original_links_g2,parseFloat(d3.select("#thresh_value_edges_g2")[0][0].value));
	
	if (mode==0){
		d3.select("#thresh_value_nodes_g2")[0][0].value = minSelectedValue;
		
		d3.select("#thresh_slider_nodes_g2")[0][0].value = scale_tresh_nodeg2.invert(minSelectedValue);
	}
	else if(mode==1){
		d3.select("#thresh_value_nodes_g2")[0][0].value = maxSelectedValue;
		
		d3.select("#thresh_slider_nodes_g2")[0][0].value = scale_tresh_nodeg2.invert(maxSelectedValue);
	}
	applyFiltering_g2();
}

function filterFromDescriptorList_g2(){
	var temp =[];
	var minSelectedValue = 99;
	var maxSelectedValue = 0;

	original_nodes_g2.forEach(function(node,i){
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
	
	new_nodes_selected_g2 = temp.slice(0);
	nodes_to_check_g2 = new_nodes_selected_g2.slice(0);
	// find links to these nodes
	find_links_tresh_g2(new_nodes_selected_g2,original_links_g2,parseFloat(d3.select("#thresh_value_edges_g2")[0][0].value));
	
	if (mode==0){
		d3.select("#thresh_value_nodes_g2")[0][0].value = minSelectedValue;
		
		d3.select("#thresh_slider_nodes_g2")[0][0].value = scale_tresh_nodeg2.invert(minSelectedValue);
	}
	else if(mode==1){
		d3.select("#thresh_value_nodes_g2")[0][0].value = maxSelectedValue;
		
		d3.select("#thresh_slider_nodes_g2")[0][0].value = scale_tresh_nodeg2.invert(maxSelectedValue);
	}
	applyFiltering_g2();
}

function filterSelectAllNodes_g2(){
	new_nodes_selected_g2 = original_nodes_g2.slice(0);
	
	nodes_to_check_g2 = new_nodes_selected_g2.slice(0);
	
	// find links to these nodes
	find_links_tresh_g2(new_nodes_selected_g2,original_links_g2,parseFloat(d3.select("#thresh_value_edges_g2")[0][0].value));
	applyFiltering_g2();
}

function filterRemoveAllNodes_g2(){
	new_nodes_selected_g2 = [];
	
	nodes_to_check_g2 = [];
	
	// find links to these nodes
	find_links_tresh_g2(new_nodes_selected_g2,original_links_g2,parseFloat(d3.select("#thresh_value_edges_g2")[0][0].value));
	applyFiltering_g2();
}

function filterFromDescriptorName_g2(nodeName,exit){
	var temp =[]
	if (exit){
		new_nodes_selected_g2.forEach(function(node){
			if (!(node.name == nodeName)){
				temp.push(node);
			}
		});
		new_nodes_selected_g2 = temp.slice(0);
	}
	else{
		original_nodes_g2.forEach(function(node) {
			if (node.name == nodeName){
				new_nodes_selected_g2.push(node);
			}
		});
	}
	nodes_to_check_g2 = new_nodes_selected_g2.slice(0);
	// find links to these nodes
	find_links_tresh_g2(new_nodes_selected_g2,original_links_g2,parseFloat(d3.select("#thresh_value_edges_g2")[0][0].value));
	applyFiltering_g2();
}

function find_links_tresh_g2(nodes,all_links,val_tresh_edges){
	links_by_nodes_selected_g2 = [];
	all_links.forEach(function(link) { // si el source o target apuntan a un nodo existente lo pongo
		node_source_target(nodes,link);
		if ((is_source_target===1) && (Math.abs(parseFloat(link.value))>=val_tresh_edges)){
				links_by_nodes_selected_g2.push(link);
		}
	});
}

function filter_g2(val_tresh_edges,val_tresh_nodes){
			new_nodes_selected_g2 = [];
			nodes_to_check_g2 = [];
	
			var nodesPresentInList = original_nodes_g2.filter(function(d,i){if (arr_index_sel.indexOf(i)>=0) return true;})
			nodesPresentInList.forEach(function(node) {
				if (mode==0){
					if (Math.abs(parseFloat(node.global))>=val_tresh_nodes){		   
						new_nodes_selected_g2.push(node);
					}
				}
				else if (mode==1){
					if (Math.abs(parseFloat(node.global))<=val_tresh_nodes){		   
						new_nodes_selected_g2.push(node);
					}
				}
			});
			nodes_to_check_g2 = new_nodes_selected_g2.slice(0);
			// find links to these nodes
			find_links_tresh_g2(new_nodes_selected_g2,original_links_g2,val_tresh_edges); 
			applyFiltering_g2();
}

function applyFiltering_g2(){
		    var path_filter_g2 = svg_view2.selectAll("path").data(links_by_nodes_selected_g2).attr("class", function(d) { 	
											   return "link " + d.type; }).text(function (d) {
						   return d.source.name +" <--> "+ d.target.name + "\n" + d.value;});			
			path_filter_g2.enter().append("path")
						.attr("class", function(d) { 	
								   return "link " + d.type; })
						.style("opacity",set_opac_path);
			path_filter_g2.append("title").text(function (d) {
						   return d.source.name +" <--> "+ d.target.name + "\n" + d.value;});		
			path_filter_g2.exit().remove();
			
			var node_filter_g2 = svg_view2.selectAll(".node").data(new_nodes_selected_g2, function(d,i) { return d.id || (d.id = ++i); });
			
			node_filter_g2.selectAll("circle").attr("r", function(d) {return scale_nodev2(Math.abs(parseFloat(d.global))); })
					.style("opacity",set_opac_v1)
					.style("fill", function(d) {
										var scale=d3.scale.linear()  
										.domain([1,d.totalMod])
										.range(['#FFF', '#000'])
										return scale(d.model);
										});
			
			node_filter_g2.selectAll("title")
						.text(function(d) { if (mode==1){
													leyenda_nodo = "Conditional entropy between descriptor and property (node size): "
												}
											return d.name + "\n" + leyenda_nodo + d.global + "\n" + leyenda_tam_nodo + d.model;});
						 
			node_filter_g2.selectAll("text")
							.attr("dx", function(d) { 
							   return scale_nodev2(Math.abs(parseFloat(d.global))) + 2; } )
							.attr("dy", ".35em")
							.text(function(d) { return d.name });
			
		    var nodeAdded_g2 = node_filter_g2.enter().append("g")
								  .attr("class", "node")
								  .call(force_view2.drag);
			
			nodeAdded_g2.append("circle")
					.attr("r", function(d) {return scale_nodev2(Math.abs(parseFloat(d.global))); })
					.style("opacity",set_opac_v1)
					.style("fill", function(d) {
					       var scale=d3.scale.linear()  
										.domain([1,d.totalMod])
										.range(['#FFF', '#000'])
										return scale(d.model);
							});	
			
			nodeAdded_g2.append("title")
						.text(function(d) { if (mode==1){
													leyenda_nodo = "Conditional entropy between descriptor and property (node size): "
												}
											return d.name + "\n" + leyenda_nodo + d.global + "\n" + leyenda_tam_nodo + d.model ;});
			nodeAdded_g2.append("text")
					.attr("dx", function(d) { 
						if (Math.abs(parseFloat(d.global))<min_val_node)
							min_val_node = Math.abs(parseFloat(d.global));
						if (parseFloat(d.global)>max_val_node)
							max_val_node= parseFloat(d.global);
					   return scale_nodev2(Math.abs(parseFloat(d.global))) + 2; } )
					.attr("dy", ".35em")
					.text(function(d) { return d.name });
												
												
			nodeAdded_g2.on("mouseover",function(d,i){
								force_view2.stop();
								svg_view2.selectAll(".link").style("opacity", function(o) {
									   return o.source === d || o.target === d ? 1 : 0.1;
								});
								svg.selectAll(".link").style("opacity", function(o) {
									return o.source === nodes_data_view1[i] || o.target === nodes_data_view1[i]  ? 1 : 0.1;
								});
								svg_view3.selectAll(".link_view3").style("opacity", function(o) {
									return o.source === nodes_data_view3[i] || o.target === nodes_data_view3[i]  ? 1 : 0.1;
								});
							})
						.on("mouseout",function(d,i){
								   force_view2.stop();
									svg_view2.selectAll(".link").style("opacity", function(o) {
										return o.source === d || o.target === d ? 1 : 1.0;
									})
									svg.selectAll(".link").style("opacity", function(o) {
										return o.source === nodes_data_view1[i] || o.target === nodes_data_view1[i]  ? 1 : 1.0;
									});
									svg_view3.selectAll(".link_view3").style("opacity", function(o) {
										return o.source === nodes_data_view3[i] || o.target === nodes_data_view3[i]  ? 1 : 1.0;
									});							
								})
						.on("dblclick",function(d){   
									force_view2.stop();
									window.open("http://michem.disat.unimib.it/mole_db/help/desc_list.php");
									document.documentElement.innerHTML.indexOf(d.name);								
									})
						.on("click",function(d,i){  
								if (first_time) {create_options_hist(); first_time = false;}
								indice_nodo_ctual = d.id;
								scatterplot(d.id); 
								if (indice_hist == 0) {
									descriptors_histogram();
								}
						});	
		   
		    node_filter_g2.exit().remove();

			force_view2.stop();
			force_view2.nodes(new_nodes_selected_g2).links(links_by_nodes_selected_g2);
			force_view2.start();

			
			force_view2.on("tick", function() {
					node_filter_g2.attr("cx", function(d) { return d.x =  Math.max(scale_nodev2(Math.abs(parseFloat(d.global))), Math.min(width - (scale_nodev2(Math.abs(parseFloat(d.global)))), d.x)); })
								  .attr("cy", function(d) { return d.y =  Math.max(scale_nodev2(Math.abs(parseFloat(d.global))), Math.min(height - (scale_nodev2(Math.abs(parseFloat(d.global)))), d.y)); });
					
					node_filter_g2.attr("transform", function(d) { 
									return "translate(" + d.x + "," + d.y + ")"; });
									
					path_filter_g2.attr("x1", function(d) { return d.source.x; })
						.attr("y1", function(d) { return d.source.y; })
						.attr("x2", function(d) { return d.target.x; })
						.attr("y2", function(d) { return d.target.y; })							
						.style("stroke-width", 3);
					path_filter_g2.attr("d", function(d) {
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

//************************************************************************************************************
//loading array of descriptor names and array of descriptors values, generate checkbox

function loadDescriptorAndNamesValues(){
	if (window.opener.loadedExternally){
		csv_data = window.opener.dataScatterplot_json;

		names_data = window.opener.namesDataScatterplot_json;
		names_arr = names_data.slice(1);
		updateNamesScatterplot(csv_data, names_arr);
	}
	else{
	    d3.json(path_data+"dataScatterplot.json", function(error, data) {
			csv_data = data;
	     });
	    d3.json(path_data+"namesDataScatterplot.json", function(error_names, data_names) {
				names_data = data_names;
				//build a new array whit the descriptors names removing the name of the property that is the first element in "names_data"
				names_arr = [];
				names_data.forEach(function(elem,i){
					if (i!=0){
						names_arr.push(elem);
					}
				});
				updateNamesScatterplot(csv_data, names_arr);
			});

	}	
				
		
		function updateNamesScatterplot(csv_data, names_arr){
				
			//******************************* checkbox descriptores **********************************************			
				var leng = names_arr.length;
					index_none = leng + 1;
				names_arr[leng] = " Select All";
				names_arr[index_none] = "Deselect All";
			checkb = d3.select("#table_form").selectAll("label")
									 .data(names_arr)
									 .enter()
									 .append("div")
									 .text(function(d) {return d;})
									 .insert("input");
									 
			checkb.style({'font-size':'11'})							 
									 .attr({
										type: "checkbox",
										class: "checkb",
										name: "checkbox_d",
										checked: true,
										value: function(d, i) {return i;}
									})				
									.property("vertical-align","text-bottom")
									.property("float","left");

			checkb.on("click",function(d,i){  
				if (i === index_none){ // uncheck all descriptors
					checkb.property("checked", function(d, i) {
							return i===index_none;
					});
					arr_index_sel = [];
					filterRemoveAllNodes();
					filterRemoveAllNodes_g2();
				} 
				else if (i === leng){ //check all
					checkb.property("checked", function(d, i) {
							return i!=index_none;});
					names_arr.forEach(function(elem,i) {
								if (i<leng){
									arr_index_sel.push(i);
								 }
					 });
					filterSelectAllNodes();
					filterSelectAllNodes_g2();
					 
					if (mode==0){
						//Update threshold values in graph 2
						d3.select("#thresh_value_nodes_g1")[0][0].value = min_val_node;
						d3.select("#thresh_slider_nodes_g1")[0][0].value = scale_tresh_node.invert(min_val_node);
						
						//Update threshold values in graph 2
						d3.select("#thresh_value_nodes_g2")[0][0].value = min_val_node2;
						d3.select("#thresh_slider_nodes_g2")[0][0].value = scale_tresh_nodeg2.invert(min_val_node2);						
					}
					else if (mode==1){
						d3.select("#thresh_value_nodes_g1")[0][0].value = max_val_node;
						d3.select("#thresh_slider_nodes_g1")[0][0].value = scale_tresh_node.invert(max_val_node);
						//Update threshold values in graph 2
						d3.select("#thresh_value_nodes_g2")[0][0].value = max_val_node2;
						d3.select("#thresh_slider_nodes_g2")[0][0].value = scale_tresh_nodeg2.invert(max_val_node2);
					}
					 
				} 
				else {
					checkb[0][index_none].checked = false;  
					//Get node value of the clicked descriptor
					nodeValue = Math.abs(parseFloat(original_nodes[i].global));
					if (checkb[0][i].checked == false){	
						arr_index_sel.splice(arr_index_sel.indexOf(i),1); 
						nodeName = original_nodes[i].name;
						filterFromDescriptorName(nodeName,true)
						filterFromDescriptorName_g2(nodeName,true)
					} 
					else{  // check or uncheck a descriptor
						if (checkb[0][i].checked == true){	
							if (parseFloat(original_nodes[i].global)>=parseFloat(thresh_nodes_g2)){
							}
							
							arr_index_sel.push(i);
							nodeName = original_nodes[i].name;
							
							filterFromDescriptorName(nodeName,false);
							filterFromDescriptorName_g2(nodeName,false);
							if (mode==0){
								if (d3.select("#thresh_value_nodes_g1")[0][0].value > nodeValue){
									//Update threshold values in graph 2
									d3.select("#thresh_value_nodes_g1")[0][0].value = nodeValue;
									d3.select("#thresh_slider_nodes_g1")[0][0].value = scale_tresh_node.invert(nodeValue);
								}
								if (d3.select("#thresh_value_nodes_g2")[0][0].value > nodeValue){
									//Update threshold values in graph 2
									d3.select("#thresh_value_nodes_g2")[0][0].value = nodeValue;
									d3.select("#thresh_slider_nodes_g2")[0][0].value = scale_tresh_nodeg2.invert(nodeValue);
								}
							}
							else if (mode==1){
								if (d3.select("#thresh_value_nodes_g1")[0][0].value < nodeValue){
									//Update threshold values in graph 2
									d3.select("#thresh_value_nodes_g1")[0][0].value = nodeValue;
									d3.select("#thresh_slider_nodes_g1")[0][0].value = scale_tresh_node.invert(nodeValue);
								}
								if (d3.select("#thresh_value_nodes_g2")[0][0].value < nodeValue){
									//Update threshold values in graph 2
									d3.select("#thresh_value_nodes_g2")[0][0].value = nodeValue;
									d3.select("#thresh_slider_nodes_g2")[0][0].value = scale_tresh_nodeg2.invert(nodeValue);
								}
							}
						}
					}
				}
			});
									
		}
}	
	

//**************************** global button histogram **********************************************	
function create_options_hist(){
 radiob = d3.select("#radio_b").selectAll("label")
								 .data(radio_data)
								 .enter()
								 .append("label")
								 .text(function(d) {return d;})
								 .insert("input");
								 
 radiob.style({'font-size':'13'})							 
								 .attr({
									type: "radio",
									class: "hist",
									name: "Histogram",
									value: function(d, i) {return i;}
								})				
								.property("checked", function(d, i) {
								               return i===j;
												scatterplot(indice_nodo_ctual + 1);})
								.on("click",function(d,i){  
										indice_hist = i;
										if (i == 0) { // show the descriptor histogram
										  if (mode_hist == 1){
											selectEnt_hist_prop.remove();
											mainEnter3_hist_prop.remove();
										  }
										  descriptors_histogram();
										}
										if (i == 1) { // show the property histogram
											if (mode_hist == 0){
											   selectEnt_hist.remove();
											   mainEnter3_hist.remove();
											   }
										    property_histogram();
										}
										if (i == 2) { // show the scatterplot
											if (mode_hist == 0){
												   selectEnt_hist.remove();
												   mainEnter3_hist.remove();
												   }
											if (mode_hist == 1){
												selectEnt_hist_prop.remove();
												mainEnter3_hist_prop.remove();
											  }
										}
										});
}

//--------------------------------------------------------------------------------------------------------------
function calculateRange_links(){
bound_100 = mod_totales;
bound_70 = mod_totales * 0.7;
bound_30 = mod_totales * 0.3;
bound_0 = 0; 
}

//--------------------------------------------------------------------------------------------------------------
function encodeOpacity_view2(struct_links){
	var v = d3.scale.linear().domain([0,mod_totales]).range([0, mod_totales]);

	struct_links.forEach(function(link_view2) {
		if ((v(parseFloat(link_view2.value)) >= bound_70) && (v(parseFloat(link_view2.value)) <= bound_100)) {
			link_view2.type = "high";
		} else{
			if ((v(parseFloat(link_view2.value)) <= bound_30) && (v(parseFloat(link_view2.value)) >= bound_0)) {
				link_view2.type = "low";
			} else {
				link_view2.type = "mean";}
		}
	});
}

function encodeOpacity_Entropy_view2(arr_links){	
	arr_links.forEach(function(link) {
		if (link.value <= perc_25_g2) {
			link.type = "MIperc_25";
		} else if (link.value > perc_25_g2 && link.value <= perc_50_g2) {
			link.type = "MIperc_50";
		} else if (link.value > perc_50_g2 && link.value <= perc_75_g2) {
			link.type = "MIperc_75";
		} else if (link.value > perc_75_g2 && link.value <= perc_100_g2) {
			link.type = "MIperc_100";
		} 
	});

}

function high(){
   svg_view2.selectAll("path")
      .filter(function(d) { return v(d.value)<=bound_70; })
      .transition()
      .style("opacity", 0.0)
	  .style("visibility", "hidden");
}

function medium(){
   svg_view2.selectAll("path")
      .filter(function(d) { return v(d.value)>=bound_70; })
      .transition()
      .style("opacity", 0.0)
	  .style("visibility", "hidden");
	svg_view2.selectAll("path")
      .filter(function(d) { return v(d.value)<=bound_30; })
      .transition()
      .style("opacity", 0.0)
	  .style("visibility", "hidden");
}

function low(){
   svg_view2.selectAll("path")
      .filter(function(d) { return v(d.value)>=bound_30; })
      .transition()
      .style("opacity", 0.0)
	  .style("visibility", "hidden");
}
function All(){
		svg_view2.selectAll("path").style("opacity",1.0)
								   .style("visibility", "visible");

}

  function ButtonSyncG2() {
	descheck_all_nodes();
    check_nodes_filtered(nodes_to_check_g2);
}