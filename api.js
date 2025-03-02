const express = require('express');
const bodyParser = require('body-parser');
const DbStumb = require('./lib/DbStumb.js');
const Decorator = require('./lib/Decorator.js');
const cors = require('cors')
const app = express();

app.use(cors());

// set api root
const apiRoot = '/api/v1';

// setting db stump
const db = new DbStumb();
const deco = new Decorator();

app.use(bodyParser.json());

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

app.get([`${apiRoot}/siteinfo`], (req, res) => {
	let title = process.env.npm_package_config_look_title || "open-list";
	let result = {"title": title};
	res.status(200).json(result);
});

app.get([`${apiRoot}/decorations/record/*`], (req, res) => {
	recordID = req.params[0];
	if (!recordID)
		res.status(400).json();

	let record = db.getRecords().filter(d => d.id == recordID)[0];
	
	let decorations = deco.getDecorations(record)
	res.status(200).json(decorations);
});

app.get([`${apiRoot}/records*`, `${apiRoot}/record`], (req, res) => {
	let subParams = [undefined, undefined];
	if (req.params[0])
		subParams = req.params[0].split('/');

	switch(subParams[1]){
		case undefined:
			var dbRes = db.getRecords();
			res.status(200).json(dbRes.filter(d => !d.deleted));
			return;
			break;
		case "by-id":
			var reqID = subParams[2];
			var dbRes = db.getRecords();
			res.status(200).json(dbRes.filter(d => d.id == reqID));
			break;
		case "after-ts":
			var reqTS = subParams[2];
			var dbRes = db.getRecords();
			res.status(200).json(dbRes.filter(d => d.ts >= reqTS && !d.deleted));
			break;
		case "checked":
			var reqState = subParams[2];
			var dbRes = db.getRecords();
			console.log(dbRes);
			res.status(200).json(dbRes.filter(d => d.checked != (reqState == 'false') && !d.deleted));
			return;
			break;
		default:
			res.status(400).json();
			console.log("CLIENT_ERROR");
	}
});

app.put(`${apiRoot}/record`, (req, res) => {
	let username = "";
	if (req.headers.authorization)
		username = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString().split(':')[0];
	let response = db.addRecord(req.body, username);
	if (response != null){
		console.log(`${username} made changes: ${JSON.stringify(response)}`)
		res.status(201).json(response);
	} else {
		res.status(400).json();
		console.log("CLIENT_ERROR");
	}
	return;
});


app.post(`${apiRoot}/record`, (req, res) => {
	let username = "";
	if (req.headers.authorization)
		username = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString().split(':')[0];
	let response = db.changeRecord(req.body, username);
	if (response != null){
		console.log(`${username} made changes: ${JSON.stringify(response)}`)
		res.status(201).json(response);
	} else {
		res.status(400).json();
		console.log("CLIENT_ERROR");
	}
	return;
});
