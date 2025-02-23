module.exports = function () {
	this.jsonValidate = require('jsonschema').validate;
	this.fs = require('fs');

	this.dbFile = process.env.npm_package_config_dbFile;

	this.recordSchema = {
		"type": "object",
  		"properties": {
			"id": {"type": "integer"},
			"ts": {"type": "integer"},
			"checked": {"type": "boolean"},
			"deleted": {"type": "boolean"},
			"entries": {
				"type": "object",
  				"properties": {
					"title": {"type": "string"},
					"note": {"type": "string"},
				},
				"required": ["title"]
			},
			"owners": {
				"type": "object",
  				"properties": {
					"lastChange": {"type": "string"},
					"added": {"type": "string"},
					"deleted": {"type": "string"},
				},
				"required": ["added"]
			}
		},
		"required": [ "id", "checked", "deleted", "ts", "entries" ]
	}

	this.db = {
		"records": []
	};

	this.reloadDb = function () {
		try{
			this.db = JSON.parse(this.fs.readFileSync(this.dbFile, 'utf8'));
		}catch(e){
			console.log("creating DB...");
			this.fs.writeFileSync(this.dbFile, JSON.stringify({"records": []}), 'utf8', function(err) { if (err) error ('could not create db!')});
			console.log("created DB...");
			this.reloadDb();
		}
	}

	this.flushDb = function () {
		this.fs.writeFileSync(this.dbFile, JSON.stringify(this.db), 'utf8', function(err) { if (err) error ('could not create db!')});
	}

	console.log(`db file is: ${this.dbFile}`);

	this.reloadDb();
	



	// testing set and get
	this.addRecord = function (record, username) {
		this.reloadDb();
		// find next free id and apply it to record
		var id = 0;
		this.db.records.forEach((e) => {
			if (id < e.id)
				id = e.id;
		});
		id++;
		record.id = id;
		record.deleted = false;
		record.owners = {
			"lastChanged": username,
			"added": username,
		};
		// set timestamp
		record.ts = new Date().getTime()
		if (this.jsonValidate(record, this.recordSchema).valid) {
			this.db.records.push(record);
			this.flushDb();
			return record;
		}
		return null;
	}

	this.changeRecord = function (record, username) {
		this.reloadDb();
		// find record
		let idMatches = this.db.records.filter((e) => e.id == record.id);
		if (idMatches.length != 1)
			return null;
		let recordIndex = this.db.records.findIndex((e) => e.id == record.id);
		
		let changeRecord = Object.assign({}, this.db.records[recordIndex]);

		// every non null value has changed
		if (record.deleted != undefined) {
			changeRecord.deleted = record.deleted;
			changeRecord.owners.deleted = username
		}

		if (record.checked != undefined)
			changeRecord.checked = record.checked;


		if (record.entries != undefined){
			if (record.entries.title != undefined)
				changeRecord.entries.title = record.entries.title;

			if (record.entries.note != undefined)
				changeRecord.entries.note = record.entries.note;
		}

		changeRecord.owners.lastChanged = username;

		changeRecord.ts = new Date().getTime();

		// validate change
		if (!this.jsonValidate(changeRecord, this.recordSchema).valid) {
			return null;
		}

		this.db.records[recordIndex] = changeRecord;

		this.flushDb();
		return this.db.records[recordIndex];
	}


	this.getRecords = function() {
		this.reloadDb();
		return this.db.records;
	}
}

