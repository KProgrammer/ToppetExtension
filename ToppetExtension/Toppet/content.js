console.log("Hallou");
chrome.runtime.onMessage.addListener(handleRequest)
//key is an array of objects of type {question: "", answer: ""}
//C, response for Q1

function isMulti(elem){
	if (elem.getAttribute("checkbox")){
		return true;
	} else {
		return false;
	}
}

function isQChecked(question, a){
	for (opt of a){
		console.log("Checking for", opt,"option in", question);
		let xpathresult = document.evaluate(`//div[@aria-label='${opt}, response for Q${question}']` ,document, null, XPathResult.ANY_TYPE, null);
		if (xpathresult.iterateNext().getAttribute("aria-checked") == "true"){
			console.log("Got option", opt, "for question", question);
			return true;
		}	
	}
	console.log("Checking for E");
	try {
		let xpathresult = document.evaluate(`//div[@aria-label='E, response for Q${question}']` ,document, null, XPathResult.ANY_TYPE, null);
		if (xpathresult.iterateNext().getAttribute("aria-checked") == "true"){
			console.log("Found E");
			return true;
		}
	}
	catch (error){
		console.log("Error in doing for E", error);
	}
	console.log("Did not find for question", question);
	return false;
}
function clickOption(question, answer){
	let xpathresult;
	let isMatrix = false;	
	xpathresult = document.evaluate(`//div[@aria-label='${answer}, response for Q${question}']` ,document, null, XPathResult.ANY_TYPE, null);
	if (["P", "Q", "R", "S", "T"].includes(answer)){
		xpathresult = document.evaluate(`//div[@aria-label='${answer.toLowerCase()}, response for Q${question}']` ,document, null, XPathResult.ANY_TYPE, null);
		isMatrix = true;
	}
	try {
		console.log(`${answer}, response for Q${question}`);
		if (!isQChecked(question, isMatrix ? ["p", "q", "r", "s", "t"] : ["A", "B", "C", "D"])){
			let thisNode = xpathresult.iterateNext();
			//console.log(thisNode);
			thisNode.click();
		}
	} catch (error){
		console.error("There is an error", error);
	}
}

function handleRequest(key){
	console.log("Printing Key", key);
	for (let obj of key){
		for (let opt of obj.answer.split("/")){
			clickOption(obj.question, opt);
		}
	}
}
