const express = require('express');
const bodyParser = require('body-parser');
const DbStumb = require('./lib/DbStumb.js');
const app = express();

// set api root
const apiRoot = '/api/v1';

// setting db stump
const db = new DbStumb();

app.use(bodyParser.json());

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

app.get(`${apiRoot}/hello`, (req, res) => {
	res.json({ message: 'Hello, People!' });
});

app.get([`${apiRoot}/records*`], (req, res) => {
	let subParams = req.params[0].split('/');
	console.log(subParams);
	switch(subParams[1]){
		case undefined:
			res.status(200).json(db.getRecords());
			return;
			break;
		case "by-id":
			var reqID = subParams[2];
			var dbRes = db.getRecords();
			res.status(200).json(dbRes.filter(d => d.id == reqID));
			break;
		case "checked":
			var reqState = subParams[2];
			var dbRes = db.getRecords();
			console.log(dbRes);
			res.status(200).json(dbRes.filter(d => d.checked != (reqState == 'false')));
			return;
			break;
		default:
			res.status(400).json();
			console.log("CLIENT_ERROR");
	}
});

app.post(`${apiRoot}/record`, (req, res) => {
	let response = db.setRecord(req.body);
	if (response != null){
		res.status(201).json(response);
		console.log("OK");
	} else {
		res.status(400).json();
		console.log("CLIENT_ERROR");
	}
});
