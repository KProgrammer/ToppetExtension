//Keys
const app_id = "UndlwaMHnxf9OeojE9KG18WBDUz9cf4HoiDHhZQB";
const js_key = "EAH5Mf9usnC5NssCOW6A0ErquwBX7q2wauGMI3tP";
const master_key = "NYTuBCBLHNW71CRiHrNZU00dcqIxMfOpieFTe00C"

let AnswersClass;

let keyArray = [];

async function checkIfAlreadyExists(question) {
    let query = new Parse.Query(AnswersClass);
    query.equalTo('question', question);
    let results = await query.find();
    if (results.length == 0) {
        return false;
    } else {
        return results[0];
    }

}

//Initialize Parse Connection
function initializeStuff() {
    Parse.initialize(app_id, js_key);
    Parse.serverURL = "https://parseapi.back4app.com/";
    AnswersClass = Parse.Object.extend('Answers');
}

//SAVES THE ANSWER TO THE SERVER

function saveAnswer(question, answer) {
    let newAnswer = new AnswersClass();
    checkIfAlreadyExists(question).then(existingElem => {
        if (existingElem) {
            for (let i = 0; i < keyArray.length; i++) {
                if (keyArray[i].question == question) {
                    keyArray.splice(i, 1);
                    updateText()
                }
            }
            existingElem.set('answer', answer);
            existingElem.save().then((obj) => {
                keyArray.push({
                    question: question,
                    answer: answer
                })
                updateText();
                console.log(`%cUpdated Answer ${question}.${answer}`, "background-color:green; font-size:20px; color:white;")
            }, error => {
                console.log("%cUpdated Not Saved, Error below", "background-color:red; font-size:20px; color:white;")
                console.error(error)
            })
        } else {
            newAnswer.save({
                question: question,
                answer: answer.toUpperCase()
            }).then(() => {
                console.log(`%cSaved Answer ${question}.${answer}`, "background-color:green; font-size:20px; color:white;")
                keyArray.push({
                    question: question,
                    answer: answer
                })
                updateText();
            }, error => {
                console.log("%cAnswer Not Saved, Error below", "background-color:red; font-size:20px; color:white;")
                console.error(error)
            })
        }
    });
    //console.log(`existingElem: ${existingElem}`)

}
//To send message to content script
function sendMessage(message){	
	let queryParams = {
		active: true,
		currentWindow: true
	}
	let querying = browser.tabs.query(queryParams);
	querying.then((tabs)=>{
		//console.log(tabs);
		//console.log(message);
		browser.tabs.sendMessage(tabs[0].id, message);
	})
}
//GETS THE KEY FROM THE SERVER

async function getKey() {
    let query = new Parse.Query(AnswersClass);
    let results = await query.find();
    let keyArr = [];
    for (let result of results) {
        keyArr.push({
            question: result.get('question'),
            answer: result.get('answer')
        });
    }
    console.log(`%cKey Retrieved`, "background-color:green; font-size:20px; color:white;")
    keyArray = keyArr;
	sendMessage(keyArr);
	console.log("Message bhejrela")
    return keyArr;
}

//DOM INTERACTION FUNCTIONS

function addText(text) {
    let list = document.getElementById('list-id');
    list.appendChild(document.createElement('li').appendChild(document.createTextNode(text)));
    list.appendChild(document.createElement('br'));
}

function removeText() {
    document.getElementById('list-id').parentNode.removeChild(document.getElementById('list-id'));
    document.getElementById('display-key').appendChild(document.createElement('ul')).setAttribute('id', 'list-id');
}

function updateText() {
    removeText();
    keyArray.sort((a, b) => a.question - b.question);
    for (let i = 0; i < keyArray.length; i++) {
        addText(`${keyArray[i].question}. ${keyArray[i].answer.toUpperCase()}`);
    }
}

//sets listener for button
document.getElementById('add-answer-btn').addEventListener('click', () => {
    saveAnswer(document.getElementById('question-text-input').value, document.getElementById('answer-text-input').value);
})

//enter key reaction
document.getElementById('question-text-input').addEventListener("keydown", (event) => {
    if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById('add-answer-btn').click();
    }
})

document.getElementById('answer-text-input').addEventListener("keydown", (event) => {
    if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById('add-answer-btn').click();
    }
})

//RUNS INT THE BEGINNING

initializeStuff();
console.log("Hallou");
getKey().then((key) => {
    updateText();
})

