module.exports = function () {
	// requirements
	this.fs = require('fs');

	// load emojis for target language
	this.lang = process.env.npm_package_lang || "de";
	this.emojis = JSON.parse(this.fs.readFileSync('node_modules/emojibase-data/' + this.lang + '/data.json', 'utf8')).filter(e => {
		// select groups. See https://emojibase.dev/shortcodes/?
		return [4, 5, 6, 7].includes(e.group);
	});
	console.log("loaded "+ Object.keys(this.emojis).length +" "+ this.lang +" emojis");

	this.zapUmlauts = function (text) {
		try{
			text = text.replace(/\u00e4/g, 'a');
			text = text.replace(/\u00f6/g, 'o');
			text = text.replace(/\u00fc/g, 'u');
			return text;
		}catch{
			return "";
		}
	}

	this.getDecorations = function (record) {
		let title = record.entries.title.toLowerCase();
		let emoResult = this.emojis.filter(e => {
			if(e.label.toLowerCase() == title){
				return true;
			} else{
				if(e.tags){
					let feRes = false;
					e.tags.forEach((t) => {
						if (t == title){
							feRes = true;
						}
					});
					return feRes;
				}
			}
			return false;
		});
		// checking broader if no perfect match was found
		// replace umlauts with normal letters to make german words singular
		title = this.zapUmlauts(title);
		// german really loves the letter combination "ei". Trying to not make everything an egg ;)
		if ((!title.includes("ei") || title.startsWith("ei") || title.endsWith("ei")) && (!emoResult || emoResult.length == 0 || !emoResult[0])){
			emoResult = this.emojis.filter(e => {
				lable = this.zapUmlauts(e.label.toLowerCase());
				if(title.includes(lable)){
					return true;
				}else{
					if(e.tags){
						let feRes = false;
						e.tags.forEach((t) => {
							t = this.zapUmlauts(t);
							if (title.includes(t))
								feRes = true;
						});
						return feRes;
					}
				}
				return false;
			});
		}

		let emo = "";
		if (emoResult[0] != undefined)
			emo = "&#" + emoResult[0].hexcode;
		
		return {"emoji": emo};
	}
}

