
if (window.opener.loadedExternally){
	load_graph_v1('foo',window.opener.data_view1_SP_json);
}
else{
	load_graph_v1(path_data+"data_view1_SP.json",'foo');
}

var thresh_edges;
var thresh_nodes;
create_options_modes();

// ------------------------------------------------------------------------------------------------------------
if (mode === 0) {
	d3.select("tditem0").on("dblclick",sevenfiveOne);
	d3.select("tditem0").on("click",One);
	d3.select("tditem1").on("dblclick",fiveZero);
	d3.select("tditem1").on("click",One);
	d3.select("tditem2").on("dblclick",twoFive);
	d3.select("tditem2").on("click",One);
	d3.select("tditem3").on("dblclick",zeroZero);
	d3.select("tditem3").on("click",One);

	d3.select("tditem4").on("dblclick",negsevenfiveOne);
	d3.select("tditem4").on("click",One);
	d3.select("tditem5").on("dblclick",negfiveZero);
	d3.select("tditem5").on("click",One);
	d3.select("tditem6").on("dblclick",negtwoFive);
	d3.select("tditem6").on("click",One);
	d3.select("tditem7").on("dblclick",negzeroZero);
	d3.select("tditem7").on("click",One);
}
if (mode === 1) {
	d3.select("tditem_100MI").on("dblclick",MI_perc_100);
	d3.select("tditem_100MI").on("click",All_MI);
	d3.select("tditem_75MI").on("dblclick",MI_perc_75);
	d3.select("tditem_75MI").on("click",All_MI);
	d3.select("tditem_50MI").on("dblclick",MI_perc_50);
	d3.select("tditem_50MI").on("click",All_MI);
	d3.select("tditem_25MI").on("dblclick",MI_perc_25);
	d3.select("tditem_25MI").on("click",All_MI);
}

d3.select("#thresh_slider_edgespos_g1").on("change", function(){
			threshold_val_slider = this.value;
			d3.select("#thresh_value_edgespos_g1")[0][0].value = parseFloat(scale_tresh(parseFloat(threshold_val_slider))).toFixed(4);
			thresh_edges = scale_tresh(parseFloat(threshold_val_slider));
			thresh_nodes = parseFloat(d3.select("#thresh_value_nodes_g1")[0][0].value);
			filter(thresh_edges,thresh_nodes);;									
		});
d3.select("#thresh_value_edgespos_g1").on("change", function(){
			var thresh_val = parseFloat(this.value);
			if ((thresh_val<=1)&&(thresh_val>-1)){
				d3.select("#thresh_slider_edgespos_g1")[0][0].value = scale_tresh.invert(thresh_val);
				thresh_edges = parseFloat(thresh_val);
				thresh_nodes = parseFloat(d3.select("#thresh_value_nodes_g1")[0][0].value);
				filter(thresh_edges,thresh_nodes);													
			}
		});
d3.select("#thresh_slider_nodes_g1").on("change", function(){
			threshold_val_slider_node = this.value;
			d3.select("#thresh_value_nodes_g1")[0][0].value = parseFloat(scale_tresh_node(parseFloat(threshold_val_slider_node))).toFixed(4);
			thresh_edges = parseFloat(d3.select("#thresh_value_edgespos_g1")[0][0].value);
			thresh_nodes = scale_tresh_node(parseFloat(threshold_val_slider_node));
			filter(thresh_edges,thresh_nodes);
		});
d3.select("#thresh_value_nodes_g1").on("change", function(){
			var thresh_val_node = parseFloat(this.value);
			if ((thresh_val_node>=min_val_node)&&(thresh_val_node<=max_val_node)){
				d3.select("#thresh_slider_nodes_g1")[0][0].value = scale_tresh_node.invert(thresh_val_node);
				thresh_edges = parseFloat(d3.select("#thresh_value_edgespos_g1")[0][0].value);
				thresh_nodes = parseFloat(thresh_val_node);
				filter(thresh_edges,thresh_nodes);								
			}
		});

