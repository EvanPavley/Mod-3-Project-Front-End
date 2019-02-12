let quizUrl = 'http://localhost:3000/api/v1/quizzes'
let questionUrl = 'http://localhost:3000/api/v1/questions'
let answerUrl = 'http://localhost:3000/api/v1/answers'
let allquizzes = []
let allquestions = []
let allanswers = []
let showPage = document.querySelector('#show-page')
showPage.innerHTML = addHTMLforShowPage()

document.addEventListener('DOMContentLoaded', e => {
  let newQuizBtn = document.querySelector('#new-quiz-btn')
  let newPage = document.querySelector('#new-page')
  let startQuiz = document.querySelector('#start-quiz')
  let quizNameRow = document.querySelector('#quiz-name-row')

  function fetchAllQuizzes(ele) {
    fetch(quizUrl)
    .then(r => r.json())
    .then(d => {
      allquizzes = d
      ele.innerHTML = allquizzes.map(q => addHTMLforQuizShow(q)).join('')
    })
  }
  fetchAllQuizzes(quizNameRow)

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

  showPage.addEventListener('click', e =>{
    showPageToggle = document.querySelector('#show-page-toggle')
    if (e.target.id === 'new-quiz-btn') {
      showPageToggle.remove()
      newPage.innerHTML = addHTMLforNewQuizForm()
    }
    if (e.target.id === 'quiz-block'){
      let thisQuizId = parseInt(e.target.dataset.id)
      let thisQuiz = allquizzes.find(q => q.id === thisQuizId)
      let theseQuestions = allquestions.filter(q => q.quiz_id == thisQuiz.id)
      showPageToggle.remove()
      startQuiz.innerHTML = addHTMLtoStartQuiz(thisQuiz, theseQuestions)
    }
  })

  newPage.addEventListener('click', e => {

    if (e.target.id === 'rerender-show-btn') {
      newPageToggle = document.querySelector('#new-page-toggle')
      newPageToggle.remove()
      showPage.innerHTML = addHTMLforShowPage()
      quizNameRow = document.querySelector('#quiz-name-row')
      fetchAllQuizzes(quizNameRow)
    }

    if (e.target.id === 'answer-done-btn') {
      createAnswerForm = document.querySelector('#create-answer-form')
      createAnswerForm.remove()
    }

  })

  newPage.addEventListener('submit', e => {
    e.preventDefault()

    if (e.target.id === 'create-quiz-form') {
      let newQuiz
      let newQuizTitle = e.target.quizTitle.value
      let newQuizImage = e.target.quizImage.value
      fetch(quizUrl, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body:JSON.stringify({
          name: newQuizTitle,
          image: newQuizImage
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
    }//end of if for quiz form

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
    }//end of if for question form

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
        completedAnswers.innerHTML += `<span>${newAnswer.description}, </span>`
        createAnswerForm.reset()
      })
    }//end of if for answer form
  })

  startQuiz.addEventListener('click', e => {

    if (e.target.id === 'rerender-show-btn') {
      startQuizToggle = document.querySelector('#start-quiz-toggle')
      startQuizToggle.remove()
      showPage.innerHTML = addHTMLforShowPage()
      quizNameRow = document.querySelector('#quiz-name-row')
      fetchAllQuizzes(quizNameRow)
    }
    console.log(e.target);

    if (e.target.id === 'answer'){
      let thisAnswerId = parseInt(e.target.dataset.id)
      let thisAnswer = allanswers.find(a => a.id === thisAnswerId)
      if (thisAnswer.solution === true){
        e.target.parentElement.innerHTML += '<p style="color: #00e600" >Correct!</p>'
      }else {
        e.target.parentElement.innerHTML += '<p style="color: #FF3131" >Incorrect :(</p>'
      }
    }
  })
});
function addHTMLforShowPage() {
  return `
  <div id='show-page-toggle'>
    <nav class="navbar navbar-light bg-light">
      <a class="navbar-brand">Quiz Yo Self</a>
      <div class="form-inline">
        <button id='new-quiz-btn' class="btn my-2 my-sm-0" type="submit">Create Quiz</button>
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
    ${quiz.name}
  </div>
  `
}

function addHTMLforNewQuizForm(){
  return `
  <div id='new-page-toggle'>
    <h2>Create Yo Quiz</h2>
    <form id=create-quiz-form>
      <div class="form-group">
        <label for="quizTitle">Quiz Title</label>
        <input name="quizTitle" class="form-control" id="quizTitleInput" placeholder="Enter Your Title">
      </div>

      <div class="form-group">
        <label for="quizImage">Image</label>
        <input name="quizImage" class="form-control" placeholder="Enter Your Image">
      </div>
      <button type="submit" class="btn btn-primary">Submit</button>
      <button id='rerender-show-btn' class="btn btn-secondary" type="button">Go Back</button>
    </form>
    <br>
    <hr>
  </div>
  `
}
function addHTMLforNewQuestionForm(quiz){
  return `
  <div id='new-page-toggle'>
    <h1>${quiz.name}</h1>
    <hr>
    <div id='completed-questions'>
    </div>
    <hr>
    <h2>Add Questions Fo Yo Quiz</h2>
    <form data-id=${quiz.id} id=create-question-form>
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
      <button id='rerender-show-btn' class="btn btn-secondary" type="button">Finished</button>
    </form>
    <hr>
    <br>
  </div>
  `
}
function addHTMLforNewAnswerForm(question){
  return `
    <h3>${question.description}</h3>
    <div id='completed-answers-for-${question.id}'>
    </div>
    <hr>
    <form data-id='${question.id}' id='create-answer-form'>
      <h5>Add Answers Fo Yo Question</h5>
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
  `
}

function addHTMLtoStartQuiz(quiz, questions) {
return `
<div class='align-middle' id='start-quiz-toggle'>
  <h1> ${quiz.name}</h1>
  <hr>
  <div id='question-container'>
    <br>
    ${showAllQuestions(questions)}
  </div>
  <button id='submit-quiz' class="btn btn-primary" type="button">Submit</button>
  <button id='rerender-show-btn' class="btn btn-secondary" type="button">Go Back</button>
</div>
`
}

function addHTMLtoShowQuestions(question) {
  let theseAnswers = allanswers.filter(a => a.question_id == question.id)
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
}

function showAllQuestions(questions) {
  return questions.map(q => addHTMLtoShowQuestions(q)).join('')
}

function addHTMLforAnswerOnQuestions(answer) {
  return `
  <li class="list-group-item">
    <p id="answer" data-id=${answer.id}>
    ${answer.description}
    </p>
  </li>
  `
}

function showAllAnswers(answers) {
  return answers.map(a => addHTMLforAnswerOnQuestions(a)).join('')
}
