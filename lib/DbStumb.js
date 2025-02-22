module.exports = function () {
	this.jsonValidate = require('jsonschema').validate;

	this.recordSchema = {
		"type": "object",
  		"properties": {
			"id": {"type": "integer"},
			"ts": {"type": "integer"},
			"note": {"type": "string"},
			"entries": {
				"type": "object",
  				"properties": {
					"title": {"type": "string"},
					"note": {"type": "string"},
				},
				"required": [ "title"]
			}
		},
		"required": [ "ts", "note", "entries" ]
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

