var first = true;

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent =
  SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

var grammar = "#JSGF V1.0";

var recognition = new SpeechRecognition();
var speechRecognitionList = new SpeechGrammarList();

speechRecognitionList.addFromString(grammar, 1);

recognition.grammars = speechRecognitionList;
recognition.continuous = false;
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

let speech = new SpeechSynthesisUtterance();

function speak(msg) {
  speech.lang = "en-US";
  speech.text = msg;
  speech.volume = 1;
  speech.rate = 1;
  speech.pitch = 1;

  window.speechSynthesis.speak(speech);
}

function getSpeech() {
  recognition.start();

  const user = JSON.parse(localStorage.getItem("User"));

  recognition.onresult = function (event) {
    var result = event.results[0][0].transcript;

    if (
      result === "stop" ||
      result === "enough" ||
      result === "just stop" ||
      result === "mute" ||
      result === "please stop" ||
      result === "stop please" ||
      result === "I would like you to stop" ||
      result === "shut up" ||
      result === "why are you talking" ||
      result === "stop talking" ||
      result === "please stop talking" ||
      result === "why wont you stop talking" ||
      result === "my ears are bursting"
    ) {
      stopSpeaking();
    }

    document.getElementById("textarea").innerHTML = result;

    setTimeout(() => {
      const result2 = result
        .replace("coronavirus", "covid")
        .replace("covid19", "covid")
        .replace("corona", "covid")
        .replace("statistics", "stats")
        .toLocaleLowerCase();

      axios
        .post("/api/commands/identify", {
          text: result2,
          id: user.data ? user.data.id : false,
        })
        .then((res) => {
          let result = res.data.message;

          speak(result);
          document.getElementById("textarea").innerHTML = result;
        })
        .catch((err) => {
          console.log(err);
          speak("Sorry, I encountered an error!");
          document.getElementById("textarea").innerHTML =
            "Sorry, I encountered an error!";
        });
    }, 3000);
  };
}

function stopSpeaking() {
  window.speechSynthesis.cancel();
  document.getElementById("textarea").innerHTML = "Stopped Speaking....";
}

function submitTodo() {
  if (!window.Notification) {
    speak("Your browser doesnt allow desktop notifications");
  } else {
    if (Notification.permission === "granted") {
      const time =
        parseFloat(document.getElementById("dur").value) * 60 * 1000 * 60;
      const todo = document.getElementById("todo").value;
      speak(
        `You will be notified in ${time / 1000 / 60} minutes for your event!`
      );

      setTimeout(() => {
        var notify = new Notification(`New ToDo!`, {
          body: `Your event ${todo} has begun!`,
        });

        notify.vibrate = true;
        speak(`Your event ${todo} has begun!`);
      }, time);
    } else {
      speak(
        "Please grant permission for me to show desktop notifications to notify you when your to do has to be done!"
      );
      Notification.requestPermission()
        .then(function (p) {
          if (p === "granted") {
            const time =
              parseInt(document.getElementById("dur").value) * 60 * 1000;

            const todo = document.getElementById("todo").value;

            speak(
              `Your will be notified in ${time / 1000} minutes for your event!`
            );

            setTimeout(() => {
              var notify = new Notification(`New ToDo!`, {
                body: `Your event ${todo} has begun!`,
              });

              notify.vibrate = true
              speak(`Your event ${todo} has begun!`);
            }, time);
          } else {
            console.log("User blocked notifications.");
          }
        })
        .catch(function (err) {
          console.error(err);
        });
    }
  }
}
