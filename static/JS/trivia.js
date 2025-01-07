const start = document.getElementById('start');
const qContainer = document.getElementById('question-container');
const question = document.getElementById('question');
const choices = document.getElementsByClassName('mcq-choice');

const buzzer = document.getElementById('buzzer')
const correct = document.getElementById('correct')

let score = 0;
let lives = 3;
let correctAnswer;
let prevQuestion;
let musicGainNode;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function fadeIn(gainNode, duration) {
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + duration);
}

function fadeOut(gainNode, duration) {
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
  setTimeout(() => {
    gainNode.disconnect();
  }, duration * 1000);
}

function playAudio() {
  return fetch('static/AUDIO/trivia-background-music.mp3')
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();

      source.buffer = audioBuffer;
      source.loop = true;
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      source.start();
      
      fadeIn(gainNode, 2);
      
      return gainNode;
    });
}

function stopAudio(gainNode) {
  if (gainNode) {
    fadeOut(gainNode, 2);
  }
}

async function fetchJSONData(file_path) {
  return fetch(file_path)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP Error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      console.error("Unable to fetch data:", err);
      return null;
    });
}

async function getQuestions() {
  const data = await fetchJSONData('../static/JSON/trivia.json');
  if (data) {
    return data.questions;
  } else {
    console.error("Failed to retrieve questions");
    return null;
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function newQuestion() {
  question.style.opacity = 0;
  for (let i = 0; i < choices.length; i++) {
    choices[i].style.opacity = 0;
  }

  setTimeout(async function() {
    const questions = await getQuestions();
    if (!questions) {
      return;
    }

    let randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    correctAnswer = randomQuestion.correctOption;
    question.innerHTML = randomQuestion.question;

    const options = [...randomQuestion.wrongOptions, correctAnswer];
    shuffleArray(options);

    for (let i = 0; i < options.length; i++) {
      const option = document.getElementById('choice' + (i + 1));
      if (option) {
        option.innerHTML = options[i];
        option.onclick = () => checkAnswer(option.innerHTML, randomQuestion.question);
      } else {
        console.error(`Element with id 'choice${i + 1}' not found.`);
      }
    }

    question.style.opacity = 1;
    for (let i = 0; i < choices.length; i++) {
      choices[i].style.opacity = 1;
    }
  }, 500);
}

function checkAnswer(userAnswer, _question) {
  if (_question === prevQuestion) return;
  prevQuestion = _question;
  if (userAnswer === correctAnswer) {
    question.innerHTML += "<br>Correct! The answer is " + correctAnswer;
    score++;
    correct.play()
    setTimeout(newQuestion, 2000);
  } else {
    question.innerHTML += "<br>Incorrect. The correct answer was " + correctAnswer;
    lives--;

    buzzer.play()

    if (lives === 0) {
      endGame();
    } else {
      setTimeout(newQuestion, 2000);
    }
  }
}

function endGame() {
  question.innerHTML = "<br>Game Over! Your score is " + score;
  start.style.visibility = 'visible';
  start.style.opacity = 1;
  start.style.height = "15%";
  start.style.width = "40%";
  start.style.top = "80%";
  start.style.border = "4px black solid";
  for (let i = 0; i < choices.length; i++) {
    choices[i].style.opacity = 0;
  }
  start.innerHTML = "Play Again";
  stopAudio(musicGainNode);
}

function startGame() {
  score = 0;
  lives = 3;
  start.style.opacity = 0;
  start.style.height = '45%';
  start.style.width = '120%';
  setTimeout(() => {
    start.style.visibility = 'hidden';
    qContainer.style.visibility = 'visible';
  }, 350);

  playAudio().then(gainNode => {
    musicGainNode = gainNode;
  });

  newQuestion();
}

start.addEventListener('click', startGame);
