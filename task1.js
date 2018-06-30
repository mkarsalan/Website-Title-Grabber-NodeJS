const express =  require('express');
const cheerio = require('cheerio');
const https = require('https');

app = express();
app.get('/I/want/title/', (req,res) => {

	// CHECK IF ADDRESS PRESENT
	if (typeof(req.query.address) != 'undefined') {
		
		let allTitles = "";
		let numsites = 0;

		if(req.query.address instanceof Array){
			var requestedAddresses = req.query.address
		} else{
			var requestedAddresses = [req.query.address]
		}

		for (let address of requestedAddresses) {

			// BASIC NORMALIZATION OF ADDRESS
			if (address.substring(0, 4) == "www.") {
				address = "https://" + address
			} else if ((address.substring(0, 12) == "https://www.") || (address.substring(0, 8) == "https://")) {
			} else {
				address = "https://www." + address
			}

			// REQUESTING ADDRESS
			https.get(address, (resp) => {

				var data = '';
				var temp = 0;
			  	resp.on('data', (chunk) => {
					var htmlBody = chunk.toString()
					// PARSING TO GET TITLE
					var $ = cheerio.load(htmlBody);
					var title = $('title').text();

					if (title != "" && temp === 0) { 	// GET FROM FIRST TITLE TAG
						temp++;
						numsites++;
						allTitles += ("<li>" + address + " - \"" + title + "\"</li>");
					}
					if (numsites === (requestedAddresses.length)) {		// RESPOND WHEN ALL SITES VISITED
						var variable = "<html><head></head><body><h1> Following are the titles of given websites: </h1><ul>" + allTitles + "</ul></body></html>"
						res.end(variable)
					}
				});
			}).on("error", (err) => {
				allTitles += ("<li>" + address + " - \"" + "NO RESPONSE" + "\"</li>");
				numsites++;
				if (numsites === (requestedAddresses.length)) {
						var variable = "<html><head></head><body><h1> Following are the titles of given websites: </h1><ul>" + allTitles + "</ul></body></html>"
						res.end(variable)
				}
			});
		}
	} else {
		res.end("ERROR: No Address Entered!")
	}
})

// ALL OTHER ROUTES
app.get('*', (req, res) => {
	res.end('ERROR 404', 404);
});

// SERVER
var port = 5000
app.listen(port, () => {
	console.log(`Server started at port ${port}`)
})