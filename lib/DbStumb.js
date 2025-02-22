module.exports = function () {
	this.jsonValidate = require('jsonschema').validate;

	this.recordSchema = {
		"type": "object",
  		"properties": {
			"id": {"type": "integer"},
			"ts": {"type": "integer"},
			"checked": {"type": "boolean"},
			"entries": {
				"type": "object",
  				"properties": {
					"title": {"type": "string"},
					"note": {"type": "string"},
				},
				"required": ["title"]
			}
		},
		"required": [ "id", "checked", "ts", "entries" ]
	}

	this.db = {
		"records": [
			{
				"id": 5,
				"ts": 1740229095,
				"checked": false,
				"entries": {"title": "erstes Element", "note": "bla"}
			}
		]
	};

	// testing set and get
	this.setRecord = function (record) {
		// find next free id and apply it to record
		var id = 0;
		this.db.records.forEach((e) => {
			if (id < e.id)
				id = e.id;
		});
		id++;
		record.id = id;
		if (this.jsonValidate(record, this.recordSchema).valid) {
			this.db.records.push(record);
			return record;
		}
		return null;
	}

	this.getRecords = function() {
		return this.db.records;
	}
}

