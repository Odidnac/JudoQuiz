// ====================
// Estado do Jogo
// ====================

let questions = [];

let currentQuestion = null;

let score = 0;

let shidos = 0;

let answeredCorrectly = [];

let currentTimer = null;

let timeRemaining = 30;

// ====================
// Inicialização
// ====================

window.onload = async function ()
{
    await validateAccess();

    await loadQuestions();

    loadNextQuestion();
};

// ====================
// Segurança
// ====================

async function validateAccess()
{
    const playerName =
        localStorage.getItem(
            "playerName");

    const playerCode =
        localStorage.getItem(
            "playerCode");

    if(!playerName || !playerCode)
    {
        window.location =
            "index.html";

        return;
    }

    document
        .getElementById(
            "playerName")
        .innerHTML =
        playerName;
}

// ====================
// Perguntas
// ====================

async function loadQuestions()
{
    const response =
        await fetch(
            "data/questions.json"
        );

    questions =
        await response.json();
}

function getAvailableQuestions()
{
    return questions.filter(
        q =>
            !answeredCorrectly.includes(
                q.id
            )
    );
}

function getRandomQuestion()
{
    const availableQuestions =
        getAvailableQuestions();

    if(
        availableQuestions.length === 0
    )
    {
        victory();

        return null;
    }

    const index =
        Math.floor(
            Math.random()
            *
            availableQuestions.length
        );

    return availableQuestions[
        index
    ];
}

function loadNextQuestion()
{
    currentQuestion =
        getRandomQuestion();

    if(!currentQuestion)
    {
        return;
    }

    renderQuestion();

    startTimer();
}
