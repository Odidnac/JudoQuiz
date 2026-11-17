let questions = [];
let currentQuestion = null;
let score = 0;
let shidos = 0;
let answeredCorrectly = [];
let currentTimer = null;
let timeRemaining = 30;

const questionFiles =
[
    "data/atletas.json",
    "data/filosofia.json",
    "data/historia.json",
    "data/katas.json",
    "data/regras.json",
    "data/tecnicas.json",
];

window.onload = async function ()
{
    const accessGranted = await validateAccess();

    if(!accessGranted)
    {
        window.location.href = "index.html";
    }
    
    await loadQuestions();

    loadNextQuestion();
}

function loadNextQuestion()
{
    currentQuestion =
        getRandomQuestion();

    if(!currentQuestion)
    {
        return;
    }

    console.log(
        "Pergunta atual:",
        currentQuestion
    );

    renderQuestion();
}

async function validateAccess()
{
    const playerName =
        localStorage.getItem(
            "playerName"
        );

    const playerCode =
        localStorage.getItem(
            "playerCode"
        );

    if (
        !playerName ||
        !playerCode
    )
    {
        window.location =
            "index.html";

        return false;
    }

    document
        .getElementById("playerName")
        .innerHTML =
        playerName;

    return true;
}

async function loadQuestions()
{
    questions = [];

    for(const file of questionFiles)
    {
        const response =
            await fetch(file);

        const fileQuestions =
            await response.json();

        questions.push(
            ...fileQuestions
        );
    }
}

function logout()
{
    localStorage.removeItem(
        "playerName");

    localStorage.removeItem(
        "playerCode");

    window.location =
        "index.html";
}

function getAvailableQuestions()
{
    return questions.filter(
        q =>
            !answeredCorrectly.includes(q.id)
    );
}

function getRandomQuestion()
{
    const availableQuestions =
        getAvailableQuestions();

    if (availableQuestions.length === 0)
    {
        victory();
        return null;
    }

    const randomIndex =
        Math.floor(
            Math.random()
            * availableQuestions.length
        );

    return availableQuestions[randomIndex];
}

function answerCorrect()
{
    score++;

    if(
        !answeredCorrectly.includes(
            currentQuestion.id
        )
    )
    {
        answeredCorrectly.push(
            currentQuestion.id
        );
    }

    loadNextQuestion();
}

function restartGame()
{
    answeredCorrectly = [];

    score = 0;

    shidos = 0;

    loadNextQuestion();
}

function renderQuestion()
{
    document
        .getElementById("question")
        .innerHTML =
        currentQuestion.question;

    switch(currentQuestion.type)
    {
        case "multiple_choice":

            renderMultipleChoice();

            break;

        case "text":

            renderText();

            break;

        case "multiple_text":

            renderMultipleText();

            break;

        case "ordered_text":

            renderOrderedText();

            break;
    }
}

function renderMultipleChoice()
{
    let html = "";

    currentQuestion.options.forEach(
        (option,index) =>
        {
            html +=
            `
            <button
                class="btn btn-outline w-full mb-2"
                onclick="answerMultipleChoice(${index})">

                ${option}

            </button>
            `;
        });

    document
        .getElementById("questionArea")
        .innerHTML =
        html;
}

function renderText()
{
    document
        .getElementById("questionArea")
        .innerHTML =
        `
        <input
            id="txtAnswer"
            class="input input-bordered w-full">

        <button
            class="btn btn-primary mt-3"
            onclick="answerText()">

            Responder

        </button>
        `;
}

function renderMultipleText()
{
    let html = "";

    currentQuestion.fields.forEach(
        (field,index)=>
        {
            html +=
            `
            <input
                id="field_${index}"
                class="input input-bordered w-full mb-2"
                placeholder="${field}">
            `;
        });

    html +=
    `
    <button
        class="btn btn-primary"
        onclick="answerMultipleText()">

        Responder

    </button>
    `;

    document
        .getElementById("questionArea")
        .innerHTML =
        html;
}

function renderOrderedText()
{
    let html = "";

    currentQuestion.fields.forEach(
        (field,index)=>
        {
            html +=
            `
            <input
                id="field_${index}"
                class="input input-bordered w-full mb-2"
                placeholder="${field}">
            `;
        });

    html +=
    `
    <button
        class="btn btn-primary"
        onclick="answerOrderedText()">

        Responder

    </button>
    `;

    document
        .getElementById("questionArea")
        .innerHTML =
        html;
}

function answerMultipleChoice(index)
{
    if(index === currentQuestion.correct)
    {
        answerCorrect();
    }
    else
    {
        answerWrong();
    }
}

function restartGame()
{
    clearInterval(
        currentTimer
    );

    score = 0;

    shidos = 0;

    answeredCorrectly = [];

    currentQuestion = null;

    updateScore();

    updateShidos();

    loadNextQuestion();
}

function closeConfirmDialog()
{
    document
        .getElementById(
            "confirmDialog"
        )
        .close();
}

function showConfirmDialog(
    title,
    text,
    yesCallback
)
{
    document
        .getElementById(
            "confirmTitle"
        )
        .innerHTML =
        title;

    document
        .getElementById(
            "confirmText"
        )
        .innerHTML =
        text;

    document
        .getElementById(
            "confirmYes"
        )
        .onclick =
        function()
        {
            closeConfirmDialog();

            yesCallback();
        };

    document
        .getElementById(
            "confirmDialog"
        )
        .showModal();
}

function confirmRestart()
{
    showConfirmDialog(
        "Reiniciar Quiz",
        "Todo o progresso atual será perdido. Pretende continuar?",
        restartGame
    );
}
