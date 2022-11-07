const http = require('http');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 8000;

const server = http.createServer((req, res) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/html');

	const routeMap = {
		'': 'index.html',
		'profile': 'js_profile.html',
        'login': 'login.html',
		'employee': 'employer.html'
	}

	render(res, routeMap[req.url.slice(1)]);
});

function render(res, htmlFile) {
  	fs.stat(`./${htmlFile}`,  (err, stats) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/html');

  		if(stats) {
		  	fs.createReadStream(htmlFile).pipe(res);
  		} else {
  			res.statusCode = 404;
  			res.end('Sorry, page not found');
  		}
  	});
}

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});