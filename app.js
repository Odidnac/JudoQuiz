let questions = [];

let currentQuestion = null;

let score = 0;

let shidos = 0;

let answeredCorrectly = [];

let currentTimer = null;

let timeRemaining = 30;


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
