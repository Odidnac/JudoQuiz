let questions = [];

let currentQuestion = null;

let score = 0;

let shidos = 0;

let answeredCorrectly = [];

let currentTimer = null;

let timeRemaining = 30;

window.onload = async function ()
{
    if(document.getElementById("question"))
    {
        await loadQuestions();

        loadNextQuestion();
    }
}

async function login()
{
    const nome =
        document
        .getElementById("txtNome")
        .value
        .trim();

    const codigo =
        document
        .getElementById("txtCodigo")
        .value
        .trim()
        .toUpperCase();

    const erro =
        document
        .getElementById("erro");

    erro.innerHTML = "";

    const response =
        await fetch("data/players.json");

    const data =
        await response.json();

    const player =
        data.players.find(
            p =>
                p.name.toLowerCase() ===
                nome.toLowerCase()

                &&

                p.code.toUpperCase() ===
                codigo
        );

    if (!player)
    {
        erro.innerHTML =
            "Nome ou código inválido.";

        return;
    }

    localStorage.setItem(
        "playerName",
        player.name);

    localStorage.setItem(
        "playerCode",
        player.code);

    window.location =
        "quiz.html";
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

    nextQuestion();
}

function restartGame()
{
    answeredCorrectly = [];

    score = 0;

    shidos = 0;

    nextQuestion();
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
