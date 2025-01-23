const ANSWER_LENGTH = 5
const NUMBER_OF_TRIES = 6
const loadingIcon = document.querySelector(".loading-icon")

//State of the function.
let userLetters = document.querySelectorAll(`.container-1`)
let userLetterIndex = 0
let rowNumber = 1
let isLoading = true
let gameEnd = false

function setLoading(isLoading) {
  //Toggles the class hidden on the loadingIcon html element.
  loadingIcon.classList.toggle("hidden", !isLoading)
}

function isLetter(letter) {
  //Only allows lower and uppercase letters from a to z
  return /^[a-zA-Z]$/.test(letter)
}

function makeMap(array) {
  //Makes a object with the key being the letter and the value being how many times it comes up in the word.
  const object = {}

  for (let i = 0; i < array.length; i++) {
    if (object[array[i]]) {
      object[array[i]]++
    } else {
      object[array[i]] = 1
    }
  }

  return object
}

async function getWordOfTheDay() {
  //Getting the word of the day.
  const response = await fetch("https://words.dev-apis.com/word-of-the-day")
  const processedResponse = await response.json()
  isLoading = false
  setLoading(isLoading)
  return processedResponse.word.toUpperCase()
}

async function validateWord(word) {
  //Sets the loading state to true, calls the API to check if the word if valid, sets loading to false and returns the response.
  isLoading = true
  setLoading(isLoading)

  const response = await fetch("https://words.dev-apis.com/validate-word", {
    method: "POST",
    body: JSON.stringify({ word: word }),
  })
  const processedResponse = await response.json()

  isLoading = false
  setLoading(isLoading)

  return processedResponse.validWord
}

function handleInvalidWord() {
  //For each letter container it removes the class invalid-word if it's already there and 100 milliseconds later adds it.
  //setTimeout is used because to trigger the animation we have to add the class, but if we call add and remove back to back the animation wil not have enough time to show.
  userLetters.forEach((userLetter) => {
    userLetter.classList.remove("invalid-word")
    setTimeout(() => {
      userLetter.classList.add("invalid-word")
    }, 100)
  })
}

async function initialise() {
  //Getting the word of the day and splitting it into a array of individual letters.
  const wordOfDay = await getWordOfTheDay()
  const wordOfDayLetters = wordOfDay.split("")

  function handleLetter(letter) {
    //Handling adding the letter to innerHTML of th letter container and incrementing the index.
    if (userLetterIndex < ANSWER_LENGTH) {
      userLetters[userLetterIndex].innerHTML = letter.toUpperCase()
      userLetterIndex++
    }
  }

  function handleDelete() {
    //Handling the deletion of the letter from the HTML container and decrementing the letter index.
    if (userLetterIndex > 0) {
      userLetterIndex--
      userLetters[userLetterIndex].innerHTML = ""
    }
  }

  async function handleEnter() {
    //Because userLetters is a NodeList we cannot call array functions like map directly on it, therefore you can convert it with Arrow.from().
    //.map() function returns a new array after applying the function.
    //.join() function returns a comma separated string of the values in the array, if you give it a empty string it will remove the comma separation.
    const userWord = Array.from(userLetters)
      .map((userLetter) => userLetter.innerText)
      .join("")

    //If the user entered word is less than the 5 letters ignore the it.
    if (userWord.length < ANSWER_LENGTH) {
      return
    }

    //Makes a map of the letters and how many times they occur. Checks if the word is valid.
    const wordOfDayMap = makeMap(wordOfDayLetters)
    const isValidWord = await validateWord(userWord)

    //If the word is not valid, calls the handleInvalidWord function and flashed the red box.
    if (!isValidWord) {
      handleInvalidWord()
      return
    }

    //Goes through each letter in the answer and marks all that are fully correct.
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (userLetters[i].innerText === wordOfDayLetters[i]) {
        userLetters[i].classList.add("correct-letter")
        wordOfDayMap[wordOfDayLetters[i]]--
      }
    }

    //Goes through each letters and marks the half correct and wrong ones.
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      //Skip to the next iteration of the loop if the letter is correct
      if (userLetters[i].innerText === wordOfDayLetters[i]) {
        continue
      }

      if (wordOfDayLetters.includes(userLetters[i].innerText) && wordOfDayMap[userLetters[i].innerText] > 0) {
        userLetters[i].classList.add("close-letter")
        wordOfDayMap[userLetters[i].innerText]--
      } else {
        userLetters[i].classList.add("wrong-letter")
      }
    }

    //If the user entered the correct word they win.
    if (userWord === wordOfDay) {
      alert("You Win!")
      gameEnd = true
    }

    //If you run out of tries then end the game.
    if (rowNumber === NUMBER_OF_TRIES) {
      alert(`You lose, the word of the day was ${wordOfDay}`)
      gameEnd = true
    }

    //Resetting the state to handle the row.
    rowNumber++
    userLetterIndex = 0
    userLetters = document.querySelectorAll(`.container-${rowNumber}`)
  }

  document.addEventListener("keyup", function handleKeyPress(event) {
    const action = event.key

    //If the game is finished they do nothing.
    if (gameEnd) {
      return
    }

    //Listen to specific key presses and call the corresponding functions.
    if (isLetter(action)) {
      handleLetter(action)
    } else if (action === "Backspace") {
      handleDelete()
    } else if (action === "Enter") {
      handleEnter()
    }
  })
}

initialise()
