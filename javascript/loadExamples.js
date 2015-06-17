var path_data_local;
var filesLoaded = [0,0,0,0,0,0,0,0,0];
var filesToBeLoaded = 9;
var loadedExternally = false;


function Load_data_logPliver(){
	path_data_local  = "./data/logPliver/";
	loadedExternally = false;
	window.open("VIDEAN.html");
	
}


function Load_data_elongAtBreak(){
	path_data_local  = "./data/elongationAtBreak/";
	loadedExternally = false;
    window.open("VIDEAN.html");
}

function errorMessage(errorString){
	var preText = d3.select("#errorMsg").select("text").text();
	d3.select("#errorMsg").select("text").append("tspan").attr("x","0").attr("dy","1.2em").text(errorString);

}

function Load_data_from_url(){
	d3.select("#errorMsg").selectAll("text").remove();
	d3.select("#errorMsg").append("text").style("fill","red").attr("y",20);

	path_data_local  = document.getElementById('text_path').value;
	var urlServer = path_data_local + "server.php"; 
	var url1 = "data_view3.json";
	var url2 = "data_view2_SP.json";
	var url3 = "data_view2_KD.json";
	var url4 = "data_view2_entropy.json";
	var url5 = "data_view1_entropy.json";
	var url6 = "data_view1_SP.json";
	var url7 = "data_view1_KD.json";
	var url8 = "namesDataScatterplot.json";
	var url9 = "dataScatterplot.json";

	bringFile(urlServer,url1,1);
	bringFile(urlServer,url2,2);
	bringFile(urlServer,url3,3);
	bringFile(urlServer,url4,4);
	bringFile(urlServer,url5,5);
	bringFile(urlServer,url6,6);
	bringFile(urlServer,url7,7);
	bringFile(urlServer,url8,8);
	bringFile(urlServer,url9,9);
}	
	function bringFile(urlServer,file,number){
	
		jQuery.ajax({
			type: "GET",
			timeout: 1000, 
			url: urlServer+ '?file='+file,
			dataType: 'jsonp',
			crossDomain: true,
			//contentType: 'application/javascript',
			success: function(data){
console.log(number + " loaded");
				//put data in the right structure
				switch (number){
				case 1:
					data_view3_json = data;
					break;
				case 2:
					data_view2_SP_json = data;
					break;
				case 3:
					data_view2_KD_json = data;
					break;
				case 4:
					data_view2_entropy_json = data;
					break;
				case 5:
					data_view1_entropy_json = data;
					break;
				case 6:
					data_view1_SP_json = data;
					break;
				case 7:
					data_view1_KD_json = data;
					break;
				case 8:
					namesDataScatterplot_json = data;
					break;
				case 9:
					dataScatterplot_json = data;
				}
				
				filesLoaded[number-1] = 1;
				if (d3.sum(filesLoaded)==filesToBeLoaded){
					loadedExternally = true;
					filesLoaded = [0,0,0,0,0,0,0,0,0];
					window.open("VIDEAN.html");
				}
				
			},
			error: function(xhr, status){
console.log(number + " not loaded");
				errorMessage('The file '+file+' cannot be found or is not in JSON.\n');
			}
		})
	
	}
    

