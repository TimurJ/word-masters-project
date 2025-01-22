let userWord = document.querySelectorAll(`.container-1`)
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
  userWord = document.querySelectorAll(`.container-${rowNumber}`)
}

async function handleEnter() {
  const promise = await fetch("https://words.dev-apis.com/word-of-the-day?puzzle=1031")
  const result = await promise.json()
  const correctWord = result.word.toUpperCase().split("")
  const duplicateLetters = correctWord.filter((item, index) => correctWord.indexOf(item) !== index)
  const userWordString = Array.from(userWord)
    .map((element) => element.innerText)
    .join("")

  correctWord.forEach((correctLetter, index) => {
    if (correctLetter === userWord[index].innerText && !duplicateLetters.includes(correctLetter)) {
      matchingLetters.push(correctLetter)
    }
  })

  userWord.forEach((element, index) => {
    const userLetter = element.innerText
    const correctLetter = correctWord[index]

    if (userLetter === correctLetter) {
      element.classList.add("correct-letter")
      return
    }

    if (correctWord.includes(userLetter) && !matchingLetters.includes(userLetter)) {
      if (!duplicateLetters.includes(userLetter)) {
        matchingLetters.push(userLetter)
      }
      element.classList.add("semi-correct-letter")
      return
    }

    element.classList.add("wrong-letter")
  })

  if (userWordString === correctWord.join("")) {
    gameEnd = true
    alert("You Win!")
  }

  if (rowNumber > 5 && userWordString !== correctWord.join("")) {
    gameEnd = true
    alert(`You Lost! The word of the day was ${correctWord.join("")}`)
  }

  getNewUserLetters()
}

function handleKeyPress(event) {
  if (gameEnd) {
    return
  }

  if (isLetter(event.key) && userLetterIndex < 5) {
    userWord[userLetterIndex].innerText = event.key.toUpperCase()
    userLetterIndex++
  }

  if (event.key === "Enter" && userLetterIndex === 5) {
    handleEnter()
  }

  if (event.key === "Backspace" && userLetterIndex > 0) {
    userLetterIndex--
    userWord[userLetterIndex].innerText = ""
  }
}

function initialise() {
  document.querySelector("body").addEventListener("keyup", handleKeyPress)
}

initialise()
