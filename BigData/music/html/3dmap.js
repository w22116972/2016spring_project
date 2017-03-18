
var colors2=["#c994c7",
"#df65b0",
"#e7298a",
"#ce1256",
"#980043",
"#67001f"]
var colors3=["#a6bddb",
"#67a9cf",
"#3690c0",
"#02818a",
"#016c59",
"#014636"]
var colors=[
"#e66101",
"#fdb863",
"#f7f7f7",
"#b2abd2",
"#5e3c99"]
var width = document.getElementById("container").offsetWidth - 2,
    height = document.getElementById("container").offsetHeight - 2,
    active = d3.select(null);

var projection = d3.geo.naturalEarth();

var defaultZoom = 1.3;
var defaultTranslateX = -220;
var defaultTranslateY = -40;
	

var path = d3.geo.path()
    .projection(projection);

var tiptext = "no data";

var tooltipdiv = d3.select("body")
	.append("div")
	.attr("class", "tooltip")
	.style("visibility", "hidden")

var tipshow = function() {
	tooltipdiv.style("visibility", "visible");

	tooltipdiv.html(function() {
			var tt = '<table><tr><td colspan="2"  style="color:#e66101;">' + tiptext[0].name +
				'</td></tr><tr><td>Rank: </td><td>'+tiptext[0].rank+'</td></tr>'
				
			for (ii=0;ii<tiptext[1].length;ii++){
			
				var queue=true;
				if (tiptext[2][ii]==2011) {
					queue=false;
					var save=tiptext[1][ii];
					}
				if (queue)
					{tt=tt+'<tr><td>'+tiptext[2][ii]+'</td>'+'<td>'+tiptext[1][ii]+'</td></tr>';}
				if ((tiptext[2][ii]==2010)&&(queue))
					{tt=tt+'<tr><td>2011</td>'+'<td>'+save+'</td></tr>';}
			}
				
			return tt+'</table>';
		})
		.style("left", (d3.event.pageX + 30) + "px")
		.style("top", (d3.event.pageY - 30) + "px");

}
var tiphide = function() {
	tooltipdiv.style("visibility", "hidden");
}	
	
 
d3.json("u.json",  function(error, u) {
d3.json("v.json",  function(error, v) {

var svg = d3.select("#container").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("click", stopped, true);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

var g = svg.append("g");
	
var zoom = d3.behavior.zoom()
    .translate([defaultTranslateX, defaultTranslateY])
    .scale(defaultZoom)
    .scaleExtent([defaultZoom, 100])
    .on("zoom", zoomed);

svg
    .call(zoom) // delete this line to disable free zooming
    .call(zoom.event);

d3.json("world-110m.json", function(error, world) {
  g.selectAll("path")
      .data(topojson.feature(world, world.objects.countries).features)
    .enter().append("path")
      .attr("d", path)
      .attr("class", "feature")
      .on("click", clicked);

  g.append("path")
      .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
      .attr("class", "mesh")
      .attr("d", path);
 });	
	
var yr =2003;
var scale=defaultZoom;
var translate=[defaultTranslateX, defaultTranslateY];

var update=function(year){
	
	svg.selectAll(".pin")
                .data(u[year])
				.exit().remove();
	
	svg.selectAll(".pin")
                .data(u[year])
				.enter().append("circle")
				.attr("class", "pin")
				.attr("stroke", "black")
				.style("opacity",0.8)
                .on("mouseout", tiphide);
	
	svg.selectAll(".pin")
                .attr("r",function(d){
					return (Math.sqrt(2000/Math.max(1,(d.rank.substr(0,3)-0)))+2)/scale;
				})
                .attr("cx", function(d) {
                    return (projection([v[d.name].coord[1], v[d.name].coord[0]])[0]-0)*1;
                })
                .attr("cy", function(d) {
                    return (projection([v[d.name].coord[1], v[d.name].coord[0]])[1]-0)*1;
                })
				.attr("fill", function(d){
					return colors[parseInt(d.rank.substr(0,3)/100)];
				})
				.attr("transform", "translate(" + translate + ")scale(" + scale + ")")
    			.attr("stroke-width",1/scale)
				.on("mouseover", function(d) {
                    tiptext = [d,v[d.name].ranks,v[d.name].years];
                    tipshow();
                    return;
                });
				
				center();
				d3.select("#pslider").select("#syear").text(year);

function center(){

	svg.selectAll(".geocurrent").remove();
	
	var lat = 0;
	var lon = 0;
	var su =0;
	for (var i in u[year]) {
		lat = lat + v[u[year][i].name].coord[1]*1.0/parseInt(Math.sqrt(u[year][i].rank.slice(0,3)))
		lon = lon + v[u[year][i].name].coord[0]*1.0/parseInt(Math.sqrt(u[year][i].rank.slice(0,3)))
		su = su + 1.0/parseInt(Math.sqrt(u[year][i].rank.slice(0,3)));
	}

	lat = lat / su;
	lon = lon / su;
	var xs = projection([lat, lon])[0];
	var ys = projection([lat, lon])[1];
	svg.append("polygon")
		.attr("points", xs+","+(ys+5)+" "+(xs+5/defaultZoom)+","+(ys+17/defaultZoom)+" "+(xs-5/defaultZoom)+","+(ys+17/defaultZoom))
		.attr("transform", "translate(" + translate + ")scale(" + scale + ")")
    	.attr("class","geocurrent geocenter")
		.attr("fill", "#74c476" )
				.attr("stroke", "black")
				.attr("stroke-width",1/defaultZoom)
				.style("opacity",0.8)
				.on("mouseover", function() {
                    tiptext = [{"name":"Geocenter","rank":"Weighted"},[year],["Year"]];
                    tipshow();
                    return;
                })
				.on("mouseout", tiphide);
	
	var lat = 0;
	var lon = 0;
	for (var i in u[year]) {
		lat = lat + v[u[year][i].name].coord[1]*1
		lon = lon + v[u[year][i].name].coord[0]*1
	}

	lat = lat / u[year].length;
	lon = lon / u[year].length;
	var xs = projection([lat, lon])[0];
	var ys = projection([lat, lon])[1];
	svg.append("polygon")
		.attr("points", xs+","+(ys+5)+" "+(xs+5/defaultZoom)+","+(ys+17/defaultZoom)+" "+(xs-5/defaultZoom)+","+(ys+17/defaultZoom))
		.attr("transform", "translate(" + translate + ")scale(" + scale + ")")
    	.attr("class","geocurrent geocenter")
		.attr("fill", "red" )
				.attr("stroke", "black")
				.attr("stroke-width",1/defaultZoom)
				.style("opacity",0.8)
				.on("mouseover", function() {
                    tiptext = [{"name":"Geocenter","rank":"Unweighted"},[year],["Year"]];
                    tipshow();
                    return;
                })
				.on("mouseout", tiphide);
	//console.log(lat,lon);
};
				
};

function geos(){
	for (var year=2003; year<2015; year++){
		var lat = 0;
		var lon = 0;
		var su =0;
		for (var i in u[year]) {
			lat = lat + v[u[year][i].name].coord[1]*1.0/parseInt(Math.sqrt(u[year][i].rank.slice(0,3)))
			lon = lon + v[u[year][i].name].coord[0]*1.0/parseInt(Math.sqrt(u[year][i].rank.slice(0,3)))
			su = su + 1.0/parseInt(Math.sqrt(u[year][i].rank.slice(0,3)));
		}

		lat = lat / su;
		lon = lon / su;
		var xs = projection([lat, lon])[0];
		var ys = projection([lat, lon])[1];
		svg.append("polygon")
			.datum(year)
			.attr("points", xs+","+ys+" "+(xs+10/scale)+","+(ys+20/scale)+" "+(xs-10/scale)+","+(ys+20/scale))
			
			.attr("class","geocenter")
			.attr("fill", colors3[parseInt((year-2003)/2)] )
					.attr("stroke", "black")
					.attr("stroke-width",1/scale)
					.style("opacity",0.8)
					.on("mouseover", function(d) {
	                    tiptext = [{"name":"Geocenter","rank":"Weighted"},[d],["Year"]];
	                    tipshow();
	                    return;
	                })
					.on("mouseout", tiphide);
		
		var lat = 0;
		var lon = 0;
		for (var i in u[year]) {
			lat = lat + v[u[year][i].name].coord[1]*1.0
			lon = lon + v[u[year][i].name].coord[0]*1.0
		}

		lat = lat / u[year].length;
		lon = lon / u[year].length;
		var xs = projection([lat, lon])[0];
		var ys = projection([lat, lon])[1];
		svg.append("polygon")
			.datum(year)
			.attr("points", xs+","+ys+" "+(xs+10/scale)+","+(ys+20/scale)+" "+(xs-10/scale)+","+(ys+20/scale))
			
			.attr("class","geocenter")
			.attr("fill", colors2[parseInt((year-2003)/2)] )
					.attr("stroke", "black")
					.attr("stroke-width",1/scale)
					.style("opacity",0.8)
					
					.on("mouseover", function(d) {
	                    tiptext = [{"name":"Geocenter","rank":"Unweighted"},[d],["Year"]];
	                    tipshow();
	                    return;
	                })
					.on("mouseout", tiphide);
		
		
		if (year<2010){
		xs=25;
		ys=393-(2013-year)*15;
		svg.append("polygon")
			.attr("points", xs+","+ys+" "+(xs+5)+","+(ys+10)+" "+(xs-5)+","+(ys+10))
			
			.attr("fill", colors2[parseInt(year-2003)] )
					.attr("stroke", "black")
					.attr("stroke-width",1)
					.style("opacity",0.8)
		xs=13;			
		svg.append("polygon")
			.attr("points", xs+","+ys+" "+(xs+5)+","+(ys+10)+" "+(xs-5)+","+(ys+10))
			
			.attr("fill", colors3[parseInt(year-2003)] )
					.attr("stroke", "black")
					.attr("stroke-width",1)
					.style("opacity",0.8)
		svg.append("text")
			.attr("x",xs+21)
			.text(2003+parseInt(year-2003)*2)
			.attr("y",ys+9)
			.style("fill", colors2[parseInt(year-2003)] )
			.style("font-size","10px");
		
		svg.append("text")
			.attr("x",29)
			.text("Unweighted")
			.attr("y",237)
			.attr("transform","rotate(-90 29,237)")
			.style("fill", colors2[1] )
			.style("font-size","8px");
		svg.append("text")
			.attr("x",17)
			.text("Weighted")
			.attr("y",236)
			.attr("transform","rotate(-90 17,236)")
			.style("fill", colors3[1] )
			.style("font-size","8px");
	}}
};


