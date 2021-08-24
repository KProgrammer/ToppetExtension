let app_id, js_key, master_key;

app_id = secrets.app_id;
js_key = secrets.js_key;
master_key = secrets.master_key;

let AnswersClass;

let keyArray = [];

//Initialize Parse Connection
function initializeStuff() {
    Parse.initialize(app_id, js_key);
    Parse.serverURL = "https://parseapi.back4app.com/";
    AnswersClass = Parse.Object.extend('Answers');
}

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

function saveAnswer(question, answer) {
    let newAnswer = new AnswersClass();
    checkIfAlreadyExists(question).then(existingElem => {
        if (existingElem) {
            for (let i = 0; i < keyArray.length; i++) {
                if (keyArray[i].question == question) {
                    keyArray.splice(i, 1);
                }
            }
            existingElem.set('answer', answer.toUpperCase());
            existingElem.save().then((obj) => {
                keyArray.push({
                    question: question,
                    answer: answer.toUpperCase()
                })
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
                    answer: answer.toUpperCase()
                })
            }, error => {
                console.log("%cAnswer Not Saved, Error below", "background-color:red; font-size:20px; color:white;")
                console.error(error)
            })
        }
    });
    //console.log(`existingElem: ${existingElem}`)
}

function readText(){
		text = document.getElementById("main_file").value
		text = text.split("\n");
		for (let elem of text){
				let s = elem.split(" ");	
				if (s.length == 1){
						console.log("missing - in", elem);
				}
				saveAnswer(s[0], s[1]);
		}
		return text;
}

initializeStuff();

document.getElementById('submitButton').addEventListener('click', readText);
