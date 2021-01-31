var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

var grammar = '#JSGF V1.0'

var recognition = new SpeechRecognition();
var speechRecognitionList = new SpeechGrammarList();

speechRecognitionList.addFromString(grammar, 1);

recognition.grammars = speechRecognitionList;
recognition.continuous = false;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

window.onload = () => {
    recognition.start()
}

recognition.onresult = function(event) {
  var result = event.results[0][0].transcript;

  if (result.startsWith("cobalt")) {

  }
}


function textToAudio() {
  let msg = document.getElementById("text-to-speech").value;

  let speech = new SpeechSynthesisUtterance();
  var synth = window.speechSynthesis;
  const voices = synth.getVoices()
  voices.forEach(v => {
      if (v.lang.startsWith("en-")) {
          console.log(v)
      }
  })
  speech.lang = "en-US"
  speech.voice = voices[2]
  speech.text = msg;
  speech.volume = 1;
  speech.rate = 1;
  speech.pitch = 1;

  window.speechSynthesis.speak(speech);
}