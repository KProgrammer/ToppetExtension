//Initialization for variables
const app_id = "UndlwaMHnxf9OeojE9KG18WBDUz9cf4HoiDHhZQB";
const js_key = "EAH5Mf9usnC5NssCOW6A0ErquwBX7q2wauGMI3tP";
const master_key = "NYTuBCBLHNW71CRiHrNZU00dcqIxMfOpieFTe00C"
let Answers;
let client;
let status;
let vm;
let keyGlobal = [];

//Initialize Parse Connection
function initializeStuff() {
    Parse.initialize(app_id, js_key);
    Parse.serverURL = "https://parseapi.back4app.com/";
    Answers = Parse.Object.extend("Answers");
    document.getElementById('status').innerHTML = "Server Connection Initialized, setting up live query"

}

//Initialize Live Query Connection
function liveQueryInit() {
    client = new Parse.LiveQueryClient({
        applicationId: app_id,
        serverURL: 'wss://toppet.back4app.io',
        javascriptKey: js_key,
        masterKey: master_key
    });
    client.open();
    document.getElementById('status').innerHTML = "Live query initialized, waiting for data"
}

//Gets initial data and set onCreate Listener
async function getInitialData() {
    const query1 = new Parse.Query(Answers);
    results = await query1.find()
    for (let result of results) {
        keyGlobal.push({
            question: result.get('question'),
            answer: result.get('answer')
        });
    }
    document.getElementById('status').innerHTML = "Initial Data recieved"
    //Add onCreate Listener
    let query = new Parse.Query(Answers);
    let subscription = client.subscribe(query);

    subscription.on('delete', obj => {
        console.log(obj)
        for (let i = 0; i < vm.answer_key.length; i++) {
            if (vm.answer_key[i].question == obj.get('question') && vm.answer_key[i].answer == obj.get('answer')) {
                vm.answer_key.splice(i, 1);
            }
        }
    });


    subscription.on('create', obj => {
        console.log('Object Created')
        vm.answer_key.push({
            question: obj.get('question'),
            answer: obj.get('answer')
        })
        console.log(vm.answer_key)
    });


    document.getElementById('status').innerHTML += ", listener set up"
}

initializeStuff();
liveQueryInit();
getInitialData().then(main);

//Vue Instance
function main() {
    vm = new Vue({
        el: "#app",
        data: {
            app_id: app_id,
            js_key: js_key,
            master_key: master_key,
            current_question: 0,
            current_answer: "",
            answer_key: keyGlobal
        },
        computed: {
            sorted_answer_key: function () {
                return this.answer_key.sort((a, b) => {
                    return a.question - b.question;
                })
            }
        },
        methods: {
            addAnswer() {
                const answers = new Answers();
                let query2 = new Parse.Query(Answers);
                query2.equalTo('question', this.current_question)
                query2.find().then(results2 => {
                    if (results2.length != 0) {
                        results2[0].destroy().then(obj => {
                            console.log("successfully destroyed")
                            /* for (let i = 0; i < this.answer_key.length; i++) {
                                if (this.answer_key[i].question == this.current_question) {
                                    console.log("REMOVING")
                                    this.answer_key.splice(i, 1)
                                }
                            } */
                            answers.save({
                                question: this.current_question,
                                answer: this.current_answer
                            }).then(obj => {
                                console.log("Saved")
                                document.getElementById('status').innerHTML = "Added answer successfully"
                            }, error => {
                                document.getElementById('status').innerHTML = "Tatti ho gaya, error recieved, right click and click inspect and kulla ko dikhao"
                                console.log(error)
                            })
                        }, error => {
                            console.log("TATTI HO GAYA DESTROY ME")
                            console.error(error)
                        })
                        document.getElementById('status').innerHTML = "Answer already there";
                    } else {
                        answers.save({
                            question: this.current_question,
                            answer: this.current_answer
                        }).then(obj => {
                            console.log("Saved")
                            document.getElementById('status').innerHTML = "Added answer successfully"
                        }, error => {
                            document.getElementById('status').innerHTML = "Tatti ho gaya, error recieved, right click and click inspect and kulla ko dikhao"
                            console.log(error)
                        })

                    }
                })

            }
        }
    });
}