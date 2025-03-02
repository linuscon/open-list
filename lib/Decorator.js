module.exports = function () {
	// requirements
	this.fs = require('fs');

	// load emojis for target language
	this.lang = process.env.npm_package_lang || "de";
	this.emojis = JSON.parse(this.fs.readFileSync('node_modules/emojibase-data/' + this.lang + '/data.json', 'utf8'));
	console.log("loaded "+ Object.keys(this.emojis).length +" "+ this.lang +" emojis");

	this.getDecorations = function (record) {
		console.log(record);
		let title = record.entries.title.toLowerCase();
		let emoResult = this.emojis.filter(e => {
			return title.includes(e.label.toLowerCase());
		});

		let emo = "";
		if (emoResult != [])
			emo = "&#" + emoResult[0].hexcode;
		
		return {"emoji": emo}
	}
}

