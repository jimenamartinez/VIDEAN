
if (window.opener.loadedExternally){
	load_graph_v2('foo',window.opener.data_view2_SP_json);
}
else{
	load_graph_v2(path_data+"data_view2_SP.json");
}

var thresh_edges_g2;
var thresh_nodes_g2;


// ------------------------------------------------------------------------------------------------------------

d3.select("tditem_high").on("dblclick",high);
d3.select("tditem_high").on("click",All);
d3.select("tditem_med").on("dblclick",medium);
d3.select("tditem_med").on("click",All);
d3.select("tditem_low").on("dblclick",low);
d3.select("tditem_low").on("click",All);
d3.select("#thresh_slider_edges_g2").on("change", function(){
				threshold_val_slider = this.value;
				d3.select("#thresh_value_edges_g2")[0][0].value = Math.floor(parseFloat(scale_mod_tresh(parseFloat(threshold_val_slider)))).toFixed(0);
				thresh_edges_g2 = Math.floor(scale_mod_tresh(parseFloat(threshold_val_slider)));
				thresh_nodes_g2 = parseFloat(d3.select("#thresh_value_nodes_g2")[0][0].value);
				filter_g2(thresh_edges_g2,thresh_nodes_g2);										
			
		});
d3.select("#thresh_value_edges_g2").on("change", function(){
				var thresh_val = Math.floor(parseFloat(this.value));
				if ((thresh_val<=max_val_edgeMod)&&(thresh_val>=0)){
					d3.select("#thresh_slider_edges_g2")[0][0].value = scale_mod_tresh.invert(thresh_val);
					thresh_edges_g2 = Math.floor(thresh_val);
					thresh_nodes_g2 = parseFloat(d3.select("#thresh_value_nodes_g2")[0][0].value);
					filter_g2(thresh_edges_g2,thresh_nodes_g2);
					
				}
		});
d3.select("#thresh_slider_nodes_g2").on("change", function(){
					threshold_val_slider_nodeg2 = this.value;
					d3.select("#thresh_value_nodes_g2")[0][0].value = parseFloat(scale_tresh_nodeg2(parseFloat(threshold_val_slider_nodeg2))).toFixed(4);
					thresh_edges_g2 = parseFloat(d3.select("#thresh_value_edges_g2")[0][0].value);
					thresh_nodes_g2=scale_tresh_nodeg2(parseFloat(threshold_val_slider_nodeg2));
					filter_g2(thresh_edges_g2,thresh_nodes_g2);										

		});
d3.select("#thresh_value_nodes_g2").on("change", function(){
					var thresh_val_node = parseFloat(this.value);
					if ((thresh_val_node>=min_val_node)&&(thresh_val_node<=max_val_node)){
						d3.select("#thresh_slider_nodes_g2")[0][0].value = scale_tresh_nodeg2.invert(thresh_val_node);
						thresh_edges_g2 = parseFloat(d3.select("#thresh_value_edges_g2")[0][0].value);
						thresh_nodes_g2 = parseFloat(thresh_val_node);
						filter_g2(thresh_edges_g2,thresh_nodes_g2);										
					}
		});