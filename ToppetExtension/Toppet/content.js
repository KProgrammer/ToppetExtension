console.log("Hallou");
browser.runtime.onMessage.addListener(handleRequest)
//key is an array of objects of type {question: "", answer: ""}
//C, response for Q1
function isQChecked(question){
	let a = ["A", "B", "C", "D"];
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
	let xpathresult = document.evaluate(`//div[@aria-label='${answer}, response for Q${question}']` ,document, null, XPathResult.ANY_TYPE, null);
	try {
		console.log(`${answer}, response for Q${question}`);
		if (!isQChecked(question)){
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
	for (obj of key){
		clickOption(obj.question, obj.answer);
	}
}
