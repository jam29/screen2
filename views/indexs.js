<!DOCTYPE html>
<html>
<head>
	<meta name="viewport" content="width=device-width" />
	<title><%= magasin %></title>
	
	<link rel='stylesheet' href='/stylesheets/style.css' />
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/bootstrap/3.3.7/css/bootstrap.min.css">

	<script type="text/javascript" src="https://code.jquery.com/jquery.min.js"></script>
	<script src="https://cdn.jsdelivr.net/lodash/4.17.4/lodash.core.min.js"></script>
	<script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
	<script src="/socket.io/socket.io.js"></script>
	<script>
	
	$("document").ready(function() {
		var socket = io.connect({secure: true, rejectUnauthorized: false});
				var socketName = "<%= url_longue %><%= magasin %><%= caisse %>" ;
				socket.emit("enregistrer",socketName);
				socket.on("affiche_ticket",function(ticket){
					var jtik = $.parseJSON(ticket);
					$("#client_prenom").html(jtik.cust.firstname+" ");
					$("#client_nom").html(jtik.cust.lastname);
					$("ul#liste").empty();
					_.map(jtik.products,function(art) {
						$("ul#liste").append('<li><span class="art_name">'+art.name+'</span><span class="art_qty">'+art.qty+'</span><span class="art_price">'+art.price+'</span></li>');
					});
					$("#tht").html(jtik.total_cart_vat_excl);
					$("#tva").html(jtik.total_vat);
					$("#ttc").html(jtik.total_cart);
					$("#liste").scrollTop($("#liste")[0].scrollHeight);
					// $("li").last().css("font-size","22px").animate({ "font-size" : "12px" }, 5000, function() { });
					$("li").last().css("background-color","orange").animate({ "font-size" : "12px" }, 5000, function() { });
				})

				socket.on("reconnect",function(){
					socket.emit("enregistrer",socketName);
				})
		})


		$(window).resize(function(){ 
			var window_height = $(window).height();
                        $("#liste").css("height",window_height-100+"px");  
		});

	</script>
</head>

<body>
	<div class="container-fluid">
		<div class="row">
			<div id="pub" class="col-md-6 col-xs-6">
				<div>
					<img class="img-responsive" src='https://37.187.152.12:3030/uploads/<%= magasin %>/<%= caisse %>/pub_<%= magasin %>.jpg' />	
				</div>
			</div>

			<div class="col-md-6 col-xs-6 pre-scrollable" >
				  <div id="ticket">
					<div id="logo"><img src='https://37.187.152.12:3030/uploads/<%= magasin %>/<%= caisse %>/logo_<%= magasin %>.jpg'></div>	
					<div id="client">
						<span> Bienvenue </span>
						<span id="client_prenom" ></span> 
						<span id="client_nom" ></span> 
					</div>

					<ul id="liste">	
					</ul>

				</div>
			</div>
		</div>
		
		<div class="row">
			<div class="col-md-6 col-xs-6">
				<span id="kerawen">KERAWEN.COM &copy </span>
			</div>
			<div class="col-md-6 col-xs-6" style="background-color:silver">
					<div id="footer">
						<span>Total HT: </span><span id="tht">0.00</span>  
						<span>TVA: </span><span id="tva">0.00</span>  
						<span>TTC: </span><span id="ttc">0.00</span>  
					</div>
			</div>
		</div>
	</div>
</body>
</html>
