const figureParts = Array.from(document.getElementsByClassName("figure-part"));
const wrongLettersContainer = document.querySelector(
   ".wrong-letters-container"
);
const wrongLetters = document.querySelector(".wrong-letters");
const word = document.querySelector(".word");
const template = document.querySelector("template");
const popup = document.querySelector(".popup-container");
const result = document.querySelector(".result");
const button = document.querySelector(".btn");
const message = document.querySelector(".message");

const words = [];
const lettersEntered = [];
const lettersRevealed = [];

let hiddenWord;
let wrongCount = 0;
let gameOver = false;
let isShowingMessage = false;

const fetchWords = () => {
   fetch("./data/words.json")
      .then((res) => res.json())
      .then((data) => {
         words.push(...data);
         getHiddenWord();
      })
      .catch((err) => console.error(err));
};

const getHiddenWord = () => {
   const index = Math.floor(Math.random() * words.length);
   hiddenWord = words[index];
   words.splice(index, 1);

   renderDashes(hiddenWord);
   hideFigureParts();
};

const renderDashes = (hiddenWord) => {
   [...hiddenWord].forEach((letter) => {
      const clone = template.content.cloneNode(true);
      clone.querySelector(".letter").textContent = letter;
      word.appendChild(clone);
   });
};

const revealHiddenWord = () =>
   `The hidden word was <span class="highlight">${hiddenWord}</span>`;

const hideFigureParts = () => figureParts.forEach(hideElement);

const showElement = (element) => element.classList.remove("hidden");
const hideElement = (element) => element.classList.add("hidden");

const showMessage = () => message.classList.add("visible");
const hideMessage = () => message.classList.remove("visible");

const isValidInput = (which, input, ctrlKey) => {
   // don't register input if the ctrl key is pressed down
   if (ctrlKey) return false;

   // only register a to z by checking the `which` property of the keyboard event
   if (which < 65 || which > 90) return false;

   if (lettersEntered.includes(input)) {
      if (isShowingMessage) return false;

      showMessage();
      isShowingMessage = true;

      setTimeout(() => {
         hideMessage();
         isShowingMessage = false;
      }, 2000);

      return false;
   }

   return true;
};

const handleInput = ({ which, key, ctrlKey }) => {
   if (gameOver) return;

   const input = key.toLowerCase();

   if (!isValidInput(which, input, ctrlKey)) return;

   lettersEntered.push(input);

   hiddenWord.includes(input) ? handleCorrect(input) : handleIncorrect(input);
};

const handleCorrect = (input) => {
   const lettersList = Array.from(document.getElementsByClassName("letter"));
   const matches = lettersList.filter((letter) => letter.textContent === input);

   matches.forEach(showElement);
   lettersRevealed.push(...matches);

   if (lettersRevealed.length === hiddenWord.length) {
      gameOver = true;
      showElement(popup);
      result.innerHTML = `Correct! <br> ${revealHiddenWord()}`;
   }
};

const handleIncorrect = (input) => {
   showElement(figureParts[wrongCount]);
   wrongCount += 1;

   if (wrongCount === 1) {
      showElement(wrongLettersContainer);
      wrongLetters.textContent = input;
   } else {
      wrongLetters.textContent += `, ${input}`;
      if (wrongCount === figureParts.length) {
         gameOver = true;
         showElement(popup);
         result.innerHTML = `Dead! <br> ${revealHiddenWord()}`;
      }
   }
};

const resetGame = () => {
   wrongCount = 0;
   gameOver = false;

   lettersEntered.splice(0);
   lettersRevealed.splice(0);

   wrongLetters.textContent = "";
   word.innerHTML = "";

   hideElement(popup);
   hideElement(wrongLettersContainer);

   getHiddenWord();
};

window.addEventListener("DOMContentLoaded", fetchWords);
document.addEventListener("keydown", handleInput);
button.addEventListener("click", resetGame);
