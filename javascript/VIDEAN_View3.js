FIN_PATH = "?callback=foo"
var margin_view3 = {top: 50, right: 70, bottom: 50, left: 70};
var width_view3 = 500 - margin_view3.left - margin_view3.right;
var height_view3 = 800 - margin_view3.top - margin_view3.bottom; //2100

var mod_tot;
var nodes_data_view3;
var color = d3.scale.category20();


var new_nodes_to_show = [];
var desc_numb;

var svg_view3 = d3.select("#div_view3").append("svg")
    .attr("width", width_view3 + margin_view3.left + margin_view3.right)
    .attr("height", height_view3 + margin_view3.top + margin_view3.bottom)
    .append("g")
    .attr("transform", "translate(" + margin_view3.left + "," + margin_view3.top + ")");

var sankey_view3 = d3.sankey()
    .nodeWidth(30)
    .size([width_view3, height_view3]);

 
if (window.opener.loadedExternally){
	updateSankey('foo',window.opener.data_view3_json);
}
else{
	d3.json(path_data+"data_view3.json", function(error, table_struct) {
		updateSankey(error,table_struct);
	});
}

function updateSankey(error,table_struct){
				nodes_data_view3 = table_struct.nodes;
				links_data_view3 = table_struct.links;
			   sankey_view3
				  .nodes(table_struct.nodes);
			   sankey_view3
				  .links(table_struct.links)
				  .layout(5); 

				  var link_view3 = svg_view3.append("g").selectAll(".link")
				  .data(table_struct.links)
				  .enter().append("path")
				  .attr("class", "link")	
				  .attr("d", sankey_view3.link()) 
				  .style("stroke-width", 3);

			  link_view3.append("title")
					.text(function(d) {
						return d.target.name + " ∈ " + 
							d.source.name; });

			  var node_view3 = svg_view3.append("g").selectAll(".node")
										.data(table_struct.nodes)
										.enter().append("g")
										.attr("class", "node_view3")
										.attr("transform", function(d) { 
											  mod_tot = d.totalMod;
											  return "translate(" + d.x + "," + d.y + ")"; })
										.attr("id", function(d, i) { return "nv3-" + i; });	
			 desc_numb = table_struct.nodes.length - mod_tot;


			  node_view3.append("rect")
				  .attr("height", function(d) { return Math.abs(d.dy); })
				  .attr("width", sankey_view3.nodeWidth())
				  .style("fill", function(d,i) { 
					 var scale_view3=d3.scale.linear()  
													.domain([1,mod_tot])
													.range(['#FFF', '#000'])
					  var val = scale_view3(d.model);
					  return i < desc_numb ? d.color = val : d.color = "FEECCF"; })
				  .style("stroke", "#000000")
				  .style("stroke-width", "1.0000000000001")
				  .append("title")
				  .text(function(d) { 
					  return d.name + "\n" + d.value; });

			  node_view3.append("text")
				  .attr("x", 45)
				  .attr("y", function(d) { return d.dy / 2; })
				  .attr("dy", ".35em")
				  .attr("text-anchor", "start")
				  .attr("transform", null)
				  .text(function(d) { return d.name; })
				.filter(function(d) { return d.x < width_view3 / 2; })
				  .attr("x", -60 + sankey_view3.nodeWidth())
				  .attr("text-anchor", "start");
				  
			  check = node_view3.insert("input");
			  check.style({'font-size':'13'})							 
											 .attr({
												type: "checkbox",
												class: "check",
												name: "checkbox_d",
												value: function(d, i) {return i;}
											})	;
			   
			  node_view3.on("mouseover",function(d,i){
						 
							svg_view3.selectAll(".link").style("opacity", function(o) {
								return o.source === d || o.target === d ? 1 : 0.1;
							});
						if (i<desc_numb-1){	 
							svg.selectAll(".link").style("opacity", function(o) {
								return o.source === nodes_data_view1[i] || o.target === nodes_data_view1[i]  ? 1 : 0.1;
							});
							svg_view2.selectAll(".link").style("opacity", function(o) {
								return o.source === nodes_data_view2[i] || o.target === nodes_data_view2[i]  ? 1 : 0.1;
							});
						 }
						})
						.on("mouseout",function(d,i){
							 
									svg_view3.selectAll(".link").style("opacity", function(o) {
										return o.source === d || o.target === d ? 1 : 1.0;
									});
							if (i<desc_numb-1){
									svg.selectAll(".link").style("opacity", function(o) {
										  return o.source === nodes_data_view1[i] || o.target === nodes_data_view1[i]  ? 1 : 1.0;
									});
									svg_view2.selectAll(".link").style("opacity", function(o) {
										  return o.source === nodes_data_view2[i] || o.target === nodes_data_view2[i]  ? 1 : 1.0;
									});
							}
						 })
						.on("click",function(d,i){
							 if (i>desc_numb-1){
								 descheck_all_nodes();
								 for (ind=desc_numb; ind<=(mod_tot+(desc_numb-1)); ind++){
								  d3.selectAll("#nv3-" + ind).style("stroke","#000000")
															 .style("stroke-width", "0.3");
								  }
								 d3.select("#nv3-" + i).style("stroke", "#FF0000")
													   .style("stroke-width", "0.3");
								  new_nodes_to_show = [];
									links_data_view3.forEach(function(elem,ind){
										if (elem.source == d){
										 names_arr.forEach(function(e,index){
												if (e===elem.target.name){
													new_nodes_to_show.push(nodes_data_view1[index])
												}
										 });
										}
									});
									check_nodes();
									filterFromDescriptorList();
									filterFromDescriptorList_g2();
							}		
						 })
									
			}

function check_nodes(){
	new_nodes_to_show.forEach(function(node,index){
		checkb[0][node.index].checked = true;
		arr_index_sel.push(node.index);
	});
}

function descheck_all_nodes(){
	names_arr.forEach(function(node,ind){
		checkb[0][ind].checked = false;
	});
	arr_index_sel = [];
}
