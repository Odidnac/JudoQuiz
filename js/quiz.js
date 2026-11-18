let questions = [];
let currentQuestion = null;
let yukos = 0;
let wazaris = 0;
let ippons = 0;
let shidos = 0;
let answeredCorrectly = [];
let gameStartTime = null;
let gameTimerInterval = null;
let questionTimerInterval = null;
let questionTimeRemaining = 0;

const questionFiles =
[
    "data/atletas.json",
    "data/filosofia.json",
    "data/historia.json",
    "data/katas.json",
    "data/regras.json",
    "data/tecnicas.json",
];

//Funções de validação de user e inicio de jogo
window.onload = async function ()
{
    const accessGranted = await validateAccess();

    if(!accessGranted)
    {
        window.location.href = "index.html";
    }
    
    await loadQuestions();
    showWelcomeScreen();
}

function showWelcomeScreen()
{
    document
        .getElementById(
            "gameContent"
        )
        .innerHTML =
        `
        <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
                <h2 class="card-title">
                    Bem-vindo
                    ${localStorage.getItem("playerName")}
                </h2>
                <ul class="list-disc ml-6">
                    <li>3 Shidos = Hansoku-Make</li>
                    <li>
                        Perguntas simples:
                        20 segundos
                    </li>
                    <li>
                        Perguntas múltiplas:
                        60 segundos
                    </li>
                    <li>
                        Consoante a rapidez da resposta podes obter:
                        Yuko, Wazari ou Ippon
                    </li>
                    <li>
                        Responder a todas as perguntas sem perder vidas só com Ippons: Ouro Olímpico
                        Responder a todas as perguntas sem perder vidas: Parata Olímpica
                        Responder a todas as perguntas com vidas perdidas: Bronze Olímpico
                    </li>
                </ul>
                <button
                    class="btn btn-primary mt-5"
                    onclick="startQuiz()">
                    Iniciar Jogo
                </button>
            </div>
        </div>
        `;
}

function startQuiz()
{
    document
        .getElementById(
            "gameContent"
        )
        .innerHTML =
        `
        <h2
            id="question"
            class="text-2xl font-bold">
        </h2>
        <div
            id="questionArea"
            class="mt-5">
        </div>
        `;

    startGameTimer();
    updateScoreBoard();
    updateShidos();
    loadNextQuestion();
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

function logout()
{
    localStorage.removeItem(
        "playerName");

    localStorage.removeItem(
        "playerCode");

    window.location =
        "index.html";
}

function restartGame()
{
    currentQuestion = null;
    yukos = 0;
    wazaris = 0;
    ippons = 0;
    shidos = 0;
    answeredCorrectly = [];
    gameStartTime = null;
    questionTimeRemaining = 0;

    clearInterval(
        gameTimerInterval
    );
    clearInterval(
        questionTimerInterval
    );
    
    updateScoreBoard();
    updateShidos();
    loadNextQuestion();
    loadNextQuestion();
}

function closeConfirmDialog()
{
    document
        .getElementById(
            "confirmDialog"
        ).close();
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
        .innerHTML = title;

    document
        .getElementById(
            "confirmText"
        )
        .innerHTML = text;

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
        ).showModal();
}

function confirmRestart()
{
    showConfirmDialog(
        "Reiniciar Quiz",
        "Todo o progresso atual será perdido. Pretende continuar?",
        restartGame
    );
}
//END Funções de validação de user e inicio de jogo

//Funções de carregamento de perguntas
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
    startQuestionTimer();
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

function getAvailableQuestions()
{
    return questions.filter(
        q =>!answeredCorrectly.includes(q.id)
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
//End Funções de carregamento de perguntas

//Funções validação de respostas
function answerCorrect()
{
    clearInterval(
        questionTimerInterval
    );

    if( !answeredCorrectly.includes(currentQuestion.id) )
    {
        answeredCorrectly.push(
            currentQuestion.id
        );
    }

    loadNextQuestion();
}

function updateShidos()
{
    const shidosElement =
        document.getElementById("shidos");

    if(!shidosElement)
    {
        return;
    }

    let html = "";

    for(let i = 0; i < 3; i++)
    {
        if(i < shidos)
        {
            html += `
                <div class="badge badge-warning badge-lg">
                    Shido
                </div>
            `;
        }
        else
        {
            html += `
                <div class="badge badge-outline badge-lg">
                    -
                </div>
            `;
        }
    }

    shidosElement.innerHTML = html;
}

function answerWrong()
{
    clearInterval(
        questionTimerInterval
    );

    updateScoreBoard();
    shidos++;
    updateShidos();

    if(shidos >= 3)
    {
        hansokuMake();
        return;
    }
    
    loadNextQuestion();
}

//Funções de cálculo de Pontuação
function hansokuMake()
{
    alert(
        "Hansoku-Make!"
    );
}

function victory()
{
    alert(
        "Yaktaze!"
    );
}

function updateScoreBoard()
{
    document
        .getElementById("yukos")
        .innerHTML =
        yukos;

    document
        .getElementById("wazaris")
        .innerHTML =
        wazaris;

    document
        .getElementById("ippons")
        .innerHTML =
        ippons;
}
//End Funções de cálculo de Pontuação

//Funções de cáclulco de Timer
function startGameTimer()
{
    gameStartTime =
        new Date();

    gameTimerInterval =
        setInterval(
            updateGameTimer,
            1000
        );
}

function updateGameTimer()
{
    const elapsedSeconds =
        Math.floor(
            (new Date() - gameStartTime)
            / 1000
        );

    const minutes =
        String(
            Math.floor(
                elapsedSeconds / 60
            )
        ).padStart(2,'0');

    const seconds =
        String(
            elapsedSeconds % 60
        ).padStart(2,'0');

    document
        .getElementById(
            "gameTimer"
        )
        .innerHTML =
        `⏱️ Jogo: ${minutes}:${seconds}`;
}

function getQuestionTime()
{
    switch(
        currentQuestion.type
    )
    {
        case "multiple_choice":

        case "text":

            return 20;

        case "multiple_text":

        case "ordered_text":

            return 60;

        default:

            return 20;
    }
}

function startQuestionTimer()
{
    clearInterval(questionTimerInterval);
    questionTimeRemaining = getQuestionTime();
    updateQuestionTimer();

    questionTimerInterval =
        setInterval(
            function()
            {
                questionTimeRemaining--;
                updateQuestionTimer();

                if(questionTimeRemaining <= 0)
                {
                    clearInterval(
                        questionTimerInterval
                    );
                    answerWrong();
                }
            },
            1000
        );
}

function updateQuestionTimer()
{
    document
        .getElementById(
            "questionTimer"
        )
        .innerHTML =
        "🕒 Pergunta: "
        +
        questionTimeRemaining;
}
//END Funções de cáclulco de Timer
