/* ---------------------------------------------	SCATTERPLOT    -------------------------------------*/
function scatterplot(index){
	
	xdata = csv_data[index]; //descriptor values
	ydata = csv_data[0]; //property values
	
	var margin = {top: 60, right: 75, bottom: 50, left: 75};
	width_scatterplot = 550;
	height_scatterplot = 440;
		
	var chart = d3.select('#div_hist_scatt').select("#svg_hist_scatt")
	.attr('width', width_scatterplot + margin.right + margin.left)
	.attr('height', height_scatterplot + margin.top + margin.bottom)
	.attr('class', 'chart')
	
	x = d3.scale.linear()
			  .domain([d3.min(xdata), d3.max(xdata)])  
			  .range([ 0, width_scatterplot]);        

	y_scatt = d3.scale.linear()
			  .domain([d3.min(ydata), d3.max(ydata)])
			  .range([ height_scatterplot, 0 ]);
    
    main = chart.selectAll('.main').data([0]);  
	
	main.enter().append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
	.attr('width', width_scatterplot)
	.attr('height', height_scatterplot)
	.attr('class', 'main'); 

	//x axis
	xAxis_scatt = d3.svg.axis()
	.scale(x)
	.orient('bottom');

	mainEnter2 = main.selectAll('.mainAxisX').data([0]).call(xAxis_scatt);
	
	mainEnter2.enter().append('g')
	.attr('transform', 'translate(0,' + height_scatterplot + ')')	
	.attr('class', 'mainAxisX')
    .call(xAxis_scatt);

	var text_axis = main.selectAll(".textxAxis_scatt").data([0]).call(xAxis_scatt);
	text_axis.enter().append("text")
					 .attr("class", "textxAxis_scatt")
					 .attr("x", width_scatterplot/2)
					 .attr("y", height_scatterplot + 40)
					 .style("font-size", "14")	 
					 .attr("dx", ".71em")
					 .style("text-anchor", "end");
	text_axis.text(names_data[index]);
  
	//y axis
	var yAxis = d3.svg.axis()
	.scale(y_scatt)
	.orient('left');

	mainEnter3 = main.selectAll('.mainAxisY').data([0]).call(yAxis);
	
	mainEnter3.enter().append('g')
	.attr('transform', 'translate(0,0)')
	.attr('class', 'mainAxisY')
	.attr('fill', 'red')
	.call(yAxis);
	
	var text_yAxis = main.selectAll(".textyAxis_scatt").data([0]).call(yAxis);
	
	text_yAxis.enter().append("text")
	.attr("class", "textyAxis_scatt")
	.attr("transform","rotate(-90)")
    .attr("x",-168)
	.attr("y", height_scatterplot/2 -270)
	.attr("dy", ".71em")
	.attr("text-anchor", "middle")
	.style("font-size", "14")	 
    .text(names_data[0] + " (Scatterplot)");
	

	var g = main.selectAll(".groupOfPoints").data([0]);
	
	g.enter().append("svg:g").attr("class","groupOfPoints"); 

	selectEnter = main.selectAll(".groupOfPoints").selectAll(".scatterDots")
	  .data(ydata);  // using the values in the ydata array
	
	selectEnter.transition().duration(500)
	  .attr("cy", function (d,i) { return y_scatt(ydata[i]); } ) // translate y value to a pixel
	  .attr("cx", function (d,i) { return x(xdata[i]); } ); // translate x value
	  
	selectEnter.enter().append("svg:circle")  // create a new circle for each value
		  .attr("class", "scatterDots")
		  .attr("cy", function (d,i) { return y_scatt(ydata[i]); } ) // translate y value to a pixel
		  .attr("cx", function (d,i) { return x(xdata[i]); } ) // translate x value
		  .attr("r", 3) // radius of circle
		  .attr("stroke-width", 1.5)
		  .attr("stroke", "red")
		  .attr("fill", "red");
		 		
}

//************************************** DESCRIPTORS HISTOGRAM **************************************************************************

function descriptors_histogram(){

	mode_hist = 0;
	//data separation
    var bins = Math.floor(Math.sqrt(xdata.length));
	var histogram = d3.layout.histogram().bins(bins)
				(xdata);	
	var y_hist = d3.scale.linear()
                    .domain([0, d3.max(histogram, function(d) { return d.y; })])
                    .range([height_scatterplot, 0]);
	//y axis
	yAxis_hist = d3.svg.axis()
	.scale(y_hist)
	.orient("right");

	mainEnter3_hist = main.selectAll('.mainAxisY_hist').data([0]).call(yAxis_hist);
	
	mainEnter3_hist.enter().append('g')
	.attr('fill', 'orange')
	.attr('opacity', .9)
	.attr("transform", "translate(" +width_scatterplot + ",0)")  
	.attr('class', 'mainAxisY_hist')
	.call(yAxis_hist)
	.append("text")
	.attr("transform","rotate(90)")
    .attr("x", width_scatterplot/2 - 110)
	.attr("y", height_scatterplot/2 - 270)	
    .attr("dy", ".71em")
	.attr("text-anchor", "middle")
	.style("font-size", "14")	 
    .text("Frequency (Histogram)");
	
    var g = main.selectAll(".bars").data([0]);
	g.enter().append("svg:g").attr("class", "bars");
	
	selectEnt_hist = main.selectAll('.bars').selectAll('.rectang').data(histogram);
	
	selectEnt_hist.transition().duration(500)
				 .attr("transform", function(d,i) { return "translate(" + x(histogram[i].x) + "," + y_hist(histogram[i].y) + ")"; })
				 .attr("x", 1)
				 .attr("width", function(d,i) { return x(histogram[0].x  + histogram[0].dx) - 3; })
				 .attr("height", function(d,i) { return height_scatterplot - y_hist(histogram[i].y); });

	selectEnt_hist.enter().append('svg:rect')
				  .attr("transform", function(d,i) { return "translate(" + x(histogram[i].x) + "," + y_hist(histogram[i].y) + ")"; })
	              .attr("class", 'rectang')
				  .attr("x", 1)				 
				  .attr("width", function(d,i) { return x(histogram[0].x  + histogram[0].dx) - 3; })
				  .style("fill","orange")
				  .style("stroke", "#000000")
				  .attr('opacity', .2)
				  .attr("height", function(d,i) { return height_scatterplot - y_hist(histogram[i].y); });
				
   selectEnt_hist.exit()
				 .attr("fill", "white")
				 .transition().duration(10)
				 .remove();
}

//*********************************************** PROPERTY HISTOGRAM ***********************************

function property_histogram(){
   mode_hist = 1;
   var prop_data = csv_data[0];
   //data separation
   var bins = Math.floor(Math.sqrt(prop_data.length));
   var histogram = d3.layout.histogram().bins(bins)
				(prop_data);	
   var x_hist = d3.scale.linear()
                    .domain([0, d3.max(histogram, function(d) { return d.y; })])
                    .range([0, width_scatterplot]);
	//y axis
	xAxis_hist_prop = d3.svg.axis()
	.scale(x_hist)
	.orient("top");

	mainEnter3_hist_prop = main.selectAll('.mainAxisX_hist_prop').data([0]).call(xAxis_hist_prop);
	
	mainEnter3_hist_prop.enter().append('g')
	.attr('fill', 'orange')
	.attr('opacity', .9)
	.attr("transform", "translate(0,0)")  
	.attr('class', 'mainAxisX_hist_prop')
	.call(xAxis_hist_prop)
	.append("text")
    .attr("x", width_scatterplot/2)
	.attr("y", -45)
    .attr("dy", ".71em")
	.attr("text-anchor", "middle")
	.style("font-size", "14")	
    .text("Frequency(Histogram)");
	
    var g = main.selectAll(".bars").data([0]);
	g.enter().append("svg:g").attr("class", "bars");
	
	selectEnt_hist_prop = main.selectAll('.bars').selectAll('.rectang').data(histogram);
	
	selectEnt_hist_prop.transition().duration(500)
						  .attr("transform", function(d,i) { 
								cx = 0;
								cy = y_scatt(histogram[i].x + histogram[0].dx);
								return "translate(" + cx + "," + cy + ")"; })
						  .attr("width", function(d,i) { return x_hist(histogram[i].y); })
						  .attr("height", function(d,i) { return (height_scatterplot - y_scatt(histogram[0].x  + histogram[0].dx)) - 3 ; });

	selectEnt_hist_prop.enter().append('svg:rect')
					 .attr("transform", function(d,i) { 
							cx = 0;
							cy = y_scatt(histogram[i].x + histogram[0].dx);
							return "translate(" + cx  + "," + cy + ")"; })
	                 .attr("class", 'rectang')
					 .attr("width", function(d,i) { return x_hist(histogram[i].y); })
					 .style("fill","orange")
					 .style("stroke", "#000000")
					 .attr('opacity', .2)
					 .attr("height", function(d,i) { return (height_scatterplot - y_scatt(histogram[0].x  + histogram[0].dx) ) - 3 ; });
   selectEnt_hist_prop.exit()
            .attr("fill", "white")
            .transition().duration(10)
            .remove();
}