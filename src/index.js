//******************************************************************************
// GLOBAL VARIBALS *************************************************************
// Assigning URLs
let quizUrl = 'http://localhost:3000/api/v1/quizzes'
let questionUrl = 'http://localhost:3000/api/v1/questions'
let answerUrl = 'http://localhost:3000/api/v1/answers'
// Assigning Database Arrays
let allquizzes = []
let allquestions = []
let allanswers = []
// Global Selecting
let showPage = document.querySelector('#show-page')
// Creating the Show page Seleton
showPage.innerHTML = addHTMLforShowPage()

//******************************************************************************
// DOM CONTENT LOADED EVENT LISTENER *******************************************
document.addEventListener('DOMContentLoaded', e => {
  // Selecting onload
  let newQuizBtn = document.querySelector('#new-quiz-btn')
  let newPage = document.querySelector('#new-page')
  let startQuiz = document.querySelector('#start-quiz')
  let quizNameRow = document.querySelector('#quiz-name-row')

  // INITIAL FETCHING **********************************************************
  // Fetching and rendering all quizzes for the show page
  function fetchAllQuizzes(ele) {
    fetch(quizUrl)
    .then(r => r.json())
    .then(d => {
      allquizzes = d
      ele.innerHTML = allquizzes.map(q => addHTMLforQuizShow(q)).join('')
    })
  }
  fetchAllQuizzes(quizNameRow)
  // Fetching questions and answers for local varaibals
  fetch(questionUrl)
  .then(r => r.json())
  .then(d => {
    allquestions = d
  })
  fetch(answerUrl)
  .then(r => r.json())
  .then(d => {
    allanswers = d
  })

  // EVENT LISTENERS FOR PAGES *************************************************

  // SHOW PAGE LISTENER --------------------------------------------------------
  showPage.addEventListener('click', e =>{
    showPageToggle = document.querySelector('#show-page-toggle')
    // for clicking on create a quiz
    if (e.target.id === 'new-quiz-btn') {
      showPageToggle.remove()
      newPage.innerHTML = addHTMLforNewQuizForm()
    }
    // for clicking on a quiz
    if (e.target.id === 'quiz-block'){
      let thisQuizId = parseInt(e.target.dataset.id)
      let thisQuiz = allquizzes.find(q => q.id === thisQuizId)
      let theseQuestions = allquestions.filter(q => q.quiz_id == thisQuiz.id)
      showPageToggle.remove()
      startQuiz.innerHTML = addHTMLtoStartQuiz(thisQuiz, theseQuestions)
    }
  })// END OF SHOW PAGE LISTENER -----------------------------------------------

  // NEW PAGE CLICK LISTENER ---------------------------------------------------
  newPage.addEventListener('click', e => {
    // for clicking the back button
    if (e.target.dataset.id === 'rerender-show-btn') {
      newPageToggle = document.querySelector('#new-page-toggle')
      newPageToggle.remove()
      showPage.innerHTML = addHTMLforShowPage()
      quizNameRow = document.querySelector('#quiz-name-row')
      fetchAllQuizzes(quizNameRow)
    }
    // for clicking the done button on the answer form
    if (e.target.id === 'answer-done-btn') {
      answerFormDiv = document.querySelector('#answer-form-div')
      answerFormDiv.remove()
    }
  })// END OF NEW PAGE CLICK LISTENER ------------------------------------------

  // NEW PAGE SUBMIT LISTENER --------------------------------------------------
  newPage.addEventListener('submit', e => {
    e.preventDefault()
    // for submitting the create quiz form
    if (e.target.id === 'create-quiz-form') {
      let newQuiz
      let newQuizTitle = e.target.quizTitle.value
      fetch(quizUrl, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body:JSON.stringify({
          name: newQuizTitle
        })
      })//end of fetch
      .then(r => r.json())
      .then(d => {
        newQuiz = d
        allquizzes.push(newQuiz)
        newPageToggle = document.querySelector('#new-page-toggle')
        newPageToggle.remove()
        newPage.innerHTML = addHTMLforNewQuestionForm(newQuiz)
      })
    }
    // for submitting the create question form
    if (e.target.id === 'create-question-form') {
      let createQuestionForm = document.querySelector('#create-question-form')
      let newQuestion;
      let newQuestionDesc = e.target.questionDescription.value
      let newQuestionM = e.target.multipleChoice.checked
      let quizId = e.target.quizId.value
      fetch(questionUrl, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body:JSON.stringify({
          description: newQuestionDesc,
          multiple_choice: newQuestionM,
          timed_value: 0,
          correct: false,
          quiz_id: quizId
        })
      })//end of fetch
      .then(r => r.json())
      .then(d => {
        newQuestion = d
        allquestions.push(newQuestion)
        completedQuestions = document.querySelector('#completed-questions')
        completedQuestions.innerHTML += addHTMLforNewAnswerForm(newQuestion)
        createQuestionForm.reset()
      })
    }
    // for submitting the create answer form
    if (e.target.id === 'create-answer-form') {
      let createAnswerForm = document.querySelector('#create-answer-form')
      let newAnswer;
      let newAnswerDesc = e.target.answerDescription.value
      let newSolution = e.target.solution.checked
      let questionId = e.target.questionId.value
      fetch(answerUrl, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body:JSON.stringify({
          description: newAnswerDesc,
          solution: newSolution,
          question_id: questionId
        })
      })//end of fetch
      .then(r => r.json())
      .then(d => {
        newAnswer = d
        allanswers.push(newAnswer)
        newId = parseInt(newAnswer.question_id)
        completedAnswers = document.querySelector(`#completed-answers-for-${newId}`)
        completedAnswers.innerHTML += `<span id='answer-span'>${newAnswer.description}, </span>`
        createAnswerForm.reset()
      })
    }
  })// END OF NEW PAGE SUBMIT LISTENER -----------------------------------------

  //Assigning variables for showing the quiz score
  let numberCorrect = 0;
  let numberIncorrect = 0;
  // START QUIZ CLICK LISTENER -------------------------------------------------
  startQuiz.addEventListener('click', e => {
    // for clicking the go back button
    if (e.target.dataset.id === 'rerender-show-btn') {
      startQuizToggle = document.querySelector('#start-quiz-toggle')
      startQuizToggle.remove()
      //reset numbers
      numberCorrect = 0
      numberIncorrect = 0
      showPage.innerHTML = addHTMLforShowPage()
      quizNameRow = document.querySelector('#quiz-name-row')
      fetchAllQuizzes(quizNameRow)
    }
    // for clicking on a multiple choice answer
    if (e.target.id === 'answer'){
      let thisAnswerId = parseInt(e.target.dataset.id)
      let thisAnswer = allanswers.find(a => a.id === thisAnswerId)
      if (thisAnswer.solution === true){
        e.target.style.backgroundColor = "#9AFB8D"
        numberCorrect++
      }else {
        let answersForQuestion = allanswers.filter(a => a.question_id === thisAnswer.question_id)
        let correctAnswer = answersForQuestion.find(a => a.solution === true)
        let eachLi = e.target.parentElement.querySelectorAll('li')
        function getCorrectLi() {
          for (var i = 0; i < eachLi.length; i++) {
            if (eachLi[i].dataset.id == correctAnswer.id){
              return eachLi[i]
            }
          }
        }
        theCorrectLi = getCorrectLi()
        theCorrectLi.style.backgroundColor = "#dbf9d6"
        e.target.style.backgroundColor = "#ff8484"
        numberIncorrect++
      }
    }
    // for clicking on the submit quiz button (which is not a submit)
    if (e.target.id === 'submit-quiz') {
      quizResults = document.querySelector('#quiz-results')
      quizBodyToggle = document.querySelector('#quiz-body-toggle')
      submitQuizBtn = document.querySelector('#submit-quiz')
      let total = numberCorrect + numberIncorrect
      precentCorrect = Math.round((numberCorrect / total) * 100)
      quizBodyToggle.remove()
      submitQuizBtn.remove()
      quizResults.innerHTML = addHTMLforResults(precentCorrect)
    }
  });// END OF START QUIZ CLICK LISTENER ---------------------------------------

  // START QUIZ SUBMIT LISTENER ------------------------------------------------
  startQuiz.addEventListener('submit', e => {
    thisSubmitBtn = e.target.children[2]
    e.preventDefault()
    let thisAnswerId = parseInt(e.target.dataset.id)
    let thisAnswer = allanswers.find(a => a.id == thisAnswerId)
    let userInputAnswer = e.target.users_answer.value
    let checker = e.target.parentElement.querySelector('#checker')
    if (userInputAnswer.includes(thisAnswer.description)){
      thisSubmitBtn.style.backgroundColor = "#28BA14"
      thisSubmitBtn.style.borderColor = "#28BA14"
      thisSubmitBtn.innerText = "Correct"
      numberCorrect++
    }else {
      thisSubmitBtn.style.backgroundColor = "#E01136"
      thisSubmitBtn.style.borderColor = "#E01136"
      thisSubmitBtn.innerText = "Incorrect"
      checker.innerHTML += `<p style="color: white" >The Correct Answer is: "${thisAnswer.description}"</p>`
      numberIncorrect++
    }
  })// END OF START QUIZ SUBMIT LISTENER ---------------------------------------
});// END OF DOM CONTENT LOADED EVENT LISTENER *********************************

//******************************************************************************
//HTML INSERT FUNCTIONS*********************************************************

//SHOW PAGE---------------------------------------------------------------------
function addHTMLforShowPage() {
  return `
  <div id='show-page-toggle'>
    <nav class="navbar">
      <a class="navbar-brand"><img src="images/questionMarkLogo.png" alt="Question Mark Logo">Quiz YourSelf!</a>
      <div class="form-inline">
        <button id='new-quiz-btn' class="btn btn-outline-light" type="submit">Create Quiz</button>
      </div>
    </nav>

    <div class="container">
      <div class="row" id="quiz-name-row">

      </div>
    </div>
  </div>
  `
}
function addHTMLforQuizShow(quiz) {
  return `
  <div id='quiz-block' data-id=${quiz.id} class="col-sm-6 text-center">
    <h1 id='quiz-block' data-id=${quiz.id} >${quiz.name}</h1>
  </div>
  `
}//END OF SHOW PAGE-------------------------------------------------------------

//NEW QUIZ PAGE-----------------------------------------------------------------
function addHTMLforNewQuizForm(){
  return `
  <div id='new-page-toggle'>
    <div class='container text-center quiz-form'>
      <form id=create-quiz-form>
        <h2>Create Your Quiz!</h2>
        <div class="form-group">
          <label for="quizTitle">Quiz Title</label>
          <input name="quizTitle" class="form-control" id="quizTitleInput" placeholder="Enter Your Title">
        </div>
        <button type="submit" class="btn btn-primary btn-lg">Submit</button>
        <button data-id='rerender-show-btn' class="btn btn-secondary btn-lg" type="button">Go Back</button>
      </form>
      <br>
    </div>
  </div>
  `
}

function addHTMLforNewQuestionForm(quiz){
  return `
  <div id='new-page-toggle' class= "container question-form">
    <div class='row'>
      <div class='col-sm-6' id='leftcol' >
        <div class='header text-left'>
          <h1 id='quiz-name'>${quiz.name}</h1>
        </div>
        <div id='completed-questions' class='text-left'>
        </div>
      </div>
      <div class='col-sm-6'>
        <div class='question-form'>
            <form data-id=${quiz.id} id='create-question-form'>
              <h2 id='question-from-header'>Add Questions For YourQuiz</h2>
              <div class="form-group">
                <label for="questionDescription">Question Description</label>
                <input name="questionDescription" class="form-control" id="questionDescription" placeholder="Enter Your Question Description">
              </div>
              <div class="form-group form-check">
                <input type="checkbox" name="multipleChoice" class="form-check-input" id="multipleChoice">
                <label class="form-check-label" for="multipleChoice">Multiple Choice?</label>
              </div>
              <input type="hidden" name="quizId" value=${quiz.id}>
              <button type="submit" class="btn btn-primary">Submit</button>
              <button data-id='rerender-show-btn' class="btn btn-secondary" type="button">Finished</button>
            </form>
          </div>
        <br>
      </div>
    </div>
  </div>
  `
}

function addHTMLforNewAnswerForm(question){
  return `
    <h3 id='input-question-text'>${question.description}</h3>
    <div id='completed-answers-for-${question.id}'>
    </div>
    <div id='answer-form-div'class='container text-center answer-form'>
      <form data-id='${question.id}' id='create-answer-form'>
        <h5 id='answer-from-header'>Add Answers For Your Question</h5>
        <div class="form-group">
          <label for="answerDescription">Answer Description</label>
          <input name="answerDescription" class="form-control" id="answerDescription" placeholder="Enter Your Answer Description">
        </div>
        <div class="form-group form-check">
          <input type="checkbox" name="solution" class="form-check-input" id="solution">
          <label class="form-check-label" for="solution" checked>Solution?</label>
        </div>
        <input type="hidden" name="questionId" value=${question.id}>
        <button type="submit" class="btn btn-primary btn-sm">Submit</button>
        <button type="button" class="btn btn-secondary btn-sm" id='answer-done-btn' >Done</button>
      </form>
    </div>
  `
}// END OF NEW QUIZ PAGE--------------------------------------------------------

//START QUIZ PAGE---------------------------------------------------------------
function addHTMLtoStartQuiz(quiz, questions) {
return `
<div id='start-quiz-toggle'>
  <div id='quiz-body-toggle' class = "quiz-title">
    <h1 id='quiz-name'> ${quiz.name}</h1>
    <div id='question-container' class = 'container'>
      <br>
      ${showAllQuestions(questions)}

    </div>
  </div>
  <div id="quiz-results">
  </div>
  <div id="center-btn" class="container">
  <button id="submit-quiz" type="button" class="btn btn-primary answer-btn ">Submit</button>
  <button data-id='rerender-show-btn' id='quiz-start-goback' class="btn btn-secondary answer-btn" type="button">Go Back</button>
  </div>
</div>
`
}

function addHTMLtoShowQuestions(question) {
  let theseAnswers = allanswers.filter(a => a.question_id == question.id)
  if (question.multiple_choice === true){
    return `
    <div>
      <form data-id=${question.id}>
        <h3>${question.description}</h3>
        ${showAllAnswers(theseAnswers)}
        <br>
        <br>
      </form>
    </div>
    `
  }else {
    thisAnswersId = theseAnswers.map(a => a.id)
    return `
    <div>
      <form data-id=${thisAnswersId}>
        <h3>${question.description}</h3>
        <div class="form-group">
          <input name="users_answer" class="form-control" id="userAnswer" data-id=${thisAnswersId} placeholder="Enter Your Answer Here">
        </div>
        <button id="userAnswerSubmit" type="submit" class="btn btn-primary btn">Submit</button>
      </form>
      <div id='checker'>
      </div>
      <br>
    </div>
    `
  }
}

function showAllQuestions(questions) {
  return questions.map(q => addHTMLtoShowQuestions(q)).join('')
}

function addHTMLforAnswerOnQuestions(answer) {
  return `
  <li class="list-group-item" id="answer" data-id=${answer.id}>
    ${answer.description}
  </li>
  `
}
// <p id="answer" data-id=${answer.id}>
// </p>

function showAllAnswers(answers) {
  return answers.map(a => addHTMLforAnswerOnQuestions(a)).join('')
}

function addHTMLforResults(correct) {
  return `
  <h1 style="color: #0279FF" > You got ${correct}% Correct!</h1>
  <div class="text-center">
    <img height="300" width="300" src="https://media.giphy.com/media/IB9foBA4PVkKA/giphy.gif" alt="Banana Danceing">
  </div>
  <br>
  `
}// END OF START QUIZ PAGE------------------------------------------------------
