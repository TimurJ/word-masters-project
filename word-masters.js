const loadingIcon = document.querySelector(".loading-icon")
let userWordContainer = document.querySelectorAll(`.container-1`)
let userLetterIndex = 0
let rowNumber = 1
let matchingLetters = []
let gameEnd = false

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter)
}

function getNewUserLetters() {
  userLetterIndex = 0
  rowNumber++
  matchingLetters = []
  userWordContainer = document.querySelectorAll(`.container-${rowNumber}`)
}

async function validateWord(word) {
  loadingIcon.style.visibility = "visible"
  const promise = await fetch("https://words.dev-apis.com/validate-word", {
    method: "POST",
    body: JSON.stringify({ word: word }),
  })
  const result = await promise.json()
  loadingIcon.style.visibility = "hidden"
  return result.validWord
}

async function getWordOfTheDay() {
  loadingIcon.style.visibility = "visible"
  const promise = await fetch("https://words.dev-apis.com/word-of-the-day")
  const result = await promise.json()
  loadingIcon.style.visibility = "hidden"
  return result.word.toUpperCase().split("")
}

async function handleEnter() {
  const wordOfTheDay = await getWordOfTheDay()
  const userWord = Array.from(userWordContainer)
    .map((element) => element.innerText)
    .join("")
  const isValidWord = await validateWord(userWord)

  const duplicateLetters = wordOfTheDay.filter((item, index) => wordOfTheDay.indexOf(item) !== index)

  if (!isValidWord) {
    userWordContainer.forEach((element) => (element.style.animation = "border-flash 1s"))
    return
  }

  wordOfTheDay.forEach((correctLetter, index) => {
    if (correctLetter === userWordContainer[index].innerText && !duplicateLetters.includes(correctLetter)) {
      matchingLetters.push(correctLetter)
    }
  })

  userWordContainer.forEach((element, index) => {
    const userLetter = element.innerText
    const correctLetter = wordOfTheDay[index]

    if (userLetter === correctLetter) {
      element.classList.add("correct-letter")
      return
    }

    if (wordOfTheDay.includes(userLetter) && !matchingLetters.includes(userLetter)) {
      if (!duplicateLetters.includes(userLetter)) {
        matchingLetters.push(userLetter)
      }
      element.classList.add("semi-correct-letter")
      return
    }

    element.classList.add("wrong-letter")
  })

  if (userWord === wordOfTheDay.join("")) {
    gameEnd = true
    alert("You Win!")
  }

  if (rowNumber > 5 && userWord !== wordOfTheDay.join("")) {
    gameEnd = true
    alert(`You Lost! The word of the day was ${wordOfTheDay.join("")}`)
  }

  getNewUserLetters()
}

function handleKeyPress(event) {
  if (gameEnd) {
    return
  }

  if (isLetter(event.key) && userLetterIndex < 5) {
    userWordContainer[userLetterIndex].innerText = event.key.toUpperCase()
    userLetterIndex++
  }

  if (event.key === "Enter" && userLetterIndex === 5) {
    handleEnter()
  }

  if (event.key === "Backspace" && userLetterIndex > 0) {
    userLetterIndex--
    userWordContainer[userLetterIndex].innerText = ""
  }
}

function initialise() {
  document.querySelector("body").addEventListener("keyup", handleKeyPress)
}

initialise()
