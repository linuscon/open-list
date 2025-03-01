let ekApi = "/api/v1";
let nextId = 0;
let lastData = "";
let reloadTimer = setInterval(reloadList, 1500);
let errorTimer = null;

window.addEventListener('DOMContentLoaded', () => {
	setLoading(true);
	document.getElementById("newItem").addEventListener('keydown', function(event) {
	  if (event.key === 'Enter') {
		  addItem();
	  }
	})
});

updateLookAndFeel();

// fetch look and feel
async function updateLookAndFeel() {
	try {
		const response = await fetch(ekApi + "/siteinfo");
		if (!response.ok)
			throw new Error();
		siteInfo = await response.json();
		document.getElementById("page-title").innerText = siteInfo.title;
		document.getElementById("tab-title").innerText = siteInfo.title;
	} catch (error) {
		console.log('Fetch error: ', error);
	}
}

function setLoading(state){
	if(state == true){
		document.getElementById("loadingscreen").classList.remove("hidden");
	}else{
		document.getElementById("loadingscreen").classList.add("hidden");
	}
}

function showError(text){
	if (errorTimer){
		clearInterval(errorTimer);
		lastData = "";
	}
	let errorBox = document.getElementById("errorBox");
	document.getElementById("errorText").innerHTML = text;
	errorBox.classList.remove("hidden");
	errorTimer = setInterval(() => document.getElementById("errorBox").classList.add("hidden"), 3000);
}

function checkOnline(){
	if (navigator.onLine) {
		return true;
	} else {
		showError("du bist offline :( <br> Änderungen werden nicht gespeichert");
		return false;
	}
}

async function editEntry(id, action, text, state){
	try{
	let response;
	switch(action) {
		case "add":
			response = await fetch(ekApi + "/record", {
				method: "PUT",
				body: JSON.stringify({
					"checked": false,
					"entries": {"title": text}
				}),
				headers: {
					"Content-type": "application/json; charset=UTF-8",
				}
			});
		break;
		case "remove":
			response = await fetch(ekApi + "/record", {
				method: "post",
				body: JSON.stringify({
					"id": id,
					"deleted": true,
				}),
				headers: {
					"Content-type": "application/json; charset=UTF-8",
				}
			});

		break;
		case "update":
			response = await fetch(ekApi + "/record", {
				method: "post",
				body: JSON.stringify({
					"id": id,
					"checked": state,
				}),
				headers: {
					"Content-type": "application/json; charset=UTF-8",
				}
			});

		break;
		case "update-note":
			response = await fetch(ekApi + "/record", {
				method: "post",
				body: JSON.stringify({
					"id": id,
					"entries": {"note": text},
				}),
				headers: {
					"Content-type": "application/json; charset=UTF-8",
				}
			});

		break;

	}
	if (!response.ok){
		showError("Einträge konnten nicht aktualisiert werden! Der Server ist nicht erreichbar");
		return null;
	}
	return response;

	} catch(error) {
		showError("Einträge konnten nicht aktualisiert werden! Der Server ist nicht erreichbar");
	}
}

function clearCbs(){
	let list = document.getElementById("list");
	while(list.firstElementChild) {
		list.removeChild(list.firstElementChild);
	}
}

function getJSON (url, callback) {
	try{
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'json';
		xhr.onload = function() {
		  var status = xhr.status;
		  if (status === 200) {
		    callback(null, xhr.response);
		  } else {
		    callback(status, xhr.response);
		  }
		};
		xhr.send();
	}catch(error) {
		setLoading(false);
		showError("Einträge konnten nicht aktualisiert werden! Der Server ist nicht erreichbar");
	}
};

function reloadList(byFunct) {
	if (!checkOnline())
		return
	if(byFunct)
		setLoading(true);
	getJSON(ekApi + "/records",
	async function(err, records) {
		if (err !== null) {
			console.log('Something went wrong: ' + err);
			showError("Einträge konnten nicht aktualisiert werden! Der Server ist nicht erreichbar");
		} else {
			let dataStr = JSON.stringify(records);
			if (dataStr == lastData){
				setLoading(false);
				return;
			}
			lastData = dataStr;
			records.sort(function(a,b){return a.checked-b.checked});
			clearCbs();
			for(let i = 0; i < records.length; i++){
				await addItem(records[i]);
			}
			if (records.length == 0) {
				document.getElementById("all-done-div").classList.remove("hidden");
			}else {
				document.getElementById("all-done-div").classList.add("hidden");
			}
				
			setLoading(false);
		}});
}
