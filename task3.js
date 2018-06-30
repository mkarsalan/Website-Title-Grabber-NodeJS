const express =  require('express');
const cheerio = require('cheerio');
const https = require('https');

function getTitle(address){

	return new Promise((resolve,reject) => {

		var originalAddress = address;

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
				if (title != "" && temp === 0) { // GET FROM FIRST TITLE TAG
					temp++;
					title = ("<li>" + originalAddress + " - \"" + title + "\"</li>");
					resolve(title)		// PROMISE RESOLVED
				}
			});
		}).on("error", (err) => {
			var title = ("<li>" + originalAddress + " - \"" + "NO RESPONSE" + "\"</li>");
			resolve(title)		// PROMISE RESOLVED
		});

	});

}


app = express();
app.get('/I/want/title/', (req,res) => {

	var promises = []

	// CHECK IF ADDRESS PRESENT
	if (typeof(req.query.address) != 'undefined') {
	
		if(req.query.address instanceof Array) {
			var requestedAddresses = req.query.address
		} else{
			var requestedAddresses = [req.query.address]
		}
		
		for (let address of requestedAddresses) {
			promises.push(getTitle(address))
		}

		Promise.all(promises).then((data) => {
			var variable = "<html><head></head><body><h1> Following are the titles of given websites: </h1><ul>" + data.join([""]) + " </ul></body></html>"
			res.end(variable)
		});

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