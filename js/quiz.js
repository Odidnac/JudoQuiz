const questionFiles =
[
    "data/atletas.json",
    "data/filosofia.json",
    "data/historia.json",
    "data/katas.json",
    "data/regras.json",
    "data/tecnicas.json",
];

//Funções de validação de user
window.onload = async function ()
{
    const accessGranted = await validateAccess();

    if(!accessGranted)
    {
        window.location.href = "index.html";
    }
    
    showWelcomeScreen();
}

function showWelcomeScreen()
{
    document
        .getElementById("gameContent")
        .innerHTML =
        `
        <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
                <h2 class="card-title text-2xl">
                    Bem-vindo
                    ${localStorage.getItem("playerName")}
                </h2>
                <p>
                    Testa os teus conhecimentos sobre Judo.
                </p>
                <h3 class="font-bold mt-2">
                    Regras
                </h3>
                <ul class="list-disc ml-6 space-y-2">
                    <li>
                        3 Shidos = Hansoku-Make
                    </li>
                    <li>
                        Perguntas simples:
                        20 segundos
                    </li>
                    <li>
                        Perguntas múltiplas:
                        60 segundos
                    </li>
                    <li>
                        Consoante o tempo demora a responder, respostas podem valer:
                        Yuko, Wazari ou Ippon
                    </li>
                    <li>
                        Responder a todas as perguntas sem perder vidas:
                        Medalha de Ouro Olímpica
                    </li>
                </ul>

                <button
                    class="btn btn-primary btn-lg w-full mt-5"
                    onclick="startQuiz()">
                    Iniciar Jogo
                </button>
            </div>
        </div>
        `;
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

    if ( !playerName || !playerCode )
    {
        window.location = "index.html";
        return false;
    }

    return true;
}

function logout()
{
    localStorage.removeItem("playerName");
    localStorage.removeItem("playerCode");

    window.location = "index.html";
}
//END Funções de validação de user e inicio de jogo

//Funções de inicio ou reinicio de Jogo
function confirmRestart()
{
    showConfirmDialog(
        "Reiniciar Quiz",
        "Todo o progresso atual será perdido. Pretende continuar?",
        restartGame
    );
}

async function startQuiz()
{
    document
        .getElementById("gameContent")
        .innerHTML =
        `
        <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
                <div class="font-bold text-xl">
                    ${localStorage.getItem("playerName")}
                </div>

                <div class="flex justify-between">
                    <div id="gameTimer">
                        ⏱️ Tempo Total Jogo: 00:00
                    </div>

                    <div id="questionTimer">
                        🕒 Tempo Restante Pergunta: 00
                    </div>
                </div>

                <div class="divider"></div>

                <div class="grid grid-cols-4 gap-3">
                    <div class="text-center">
                        <div class="text-xs opacity-70">
                            Ippons
                        </div>
                
                        <div
                            id="ippons"
                            class="badge badge-success badge-lg">
                            0
                        </div>
                    </div>
                
                    <div class="text-center">
                        <div class="text-xs opacity-70">
                            Wazaris
                        </div>
                        <div
                            id="wazaris"
                            class="badge badge-neutral badge-lg">
                            0
                        </div>
                    </div>
                
                    <div class="text-center">
                        <div class="text-xs opacity-70">
                            Yukos
                        </div>
                        <div
                            id="yukos"
                            class="badge badge-info badge-lg">
                            0
                        </div>
                    </div>
                
                    <div class="text-center">
                        <div class="text-xs opacity-70">
                            Shidos
                        </div>
                
                        <div
                            id="shidos"
                            class="flex gap-1 justify-center">
                        </div>
                    </div>
                </div>

                <div class="divider"></div>

                <h2
                    id="question"
                    class="text-2xl font-bold">
                </h2>
                
                <div
                    id="questionArea"
                    class="mt-5">
                </div>
            </div>
        </div>
        `;

    await loadQuestions();
    updateScoreBoard();
    updateShidos();
    startGameTimer();
    loadNextQuestion();
}
//End Funções de inicio ou reinicio de Jogo

//Funções de gestão de pontos e vidas de jogo
function updateScoreBoard()
{
}

let shidos = 0;
function updateShidos()
{
    const shidosElement =
        document.getElementById(
            "shidos"
        );

    if(!shidosElement)
    {
        return;
    }

    let html = "";
    for(let i = 0; i < 3; i++)
    {
        html +=
            i < shidos
                ? '<div class="badge badge-error">S</div>'
                : '<div class="badge badge-outline">-</div>';
    }

    shidosElement.innerHTML = html;
}

function answerWrong()
{
    clearInterval(
        questionTimerInterval
    );

    shidos++;
    updateShidos();
    
    if(shidos >= 3)
    {
        hansokuMake();
        return;
    }

    const modal =
        document.getElementById(
            "shidoModal"
        );

    modal.showModal();
    
    setTimeout(
        function()
        {
            modal.close();

            loadNextQuestion();
        },
        1500
    );
}

function hansokuMake()
{
    alert(
        "Hansoku-Make!"
    );
}
//End Funções de gestão de pontos e vidas de jogo

let answeredCorrectly = [];
let questions = [];
//Funções de gestão de perguntas e respostas no ecrã
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

    console.log(
        "Total de perguntas:",
        questions.length
    );
}

function getRandomQuestion()
{
    const availableQuestions =
        questions.filter(
            q =>
                !answeredCorrectly.includes(
                    q.id
                )
        );

    if( availableQuestions.length === 0 )
    {
        return null;
    }

    const randomIndex =
        Math.floor(
            Math.random()
            * availableQuestions.length
        );

    return availableQuestions[
        randomIndex
    ];
}

function loadNextQuestion()
{
    currentQuestion = getRandomQuestion();

    if(!currentQuestion)
    {
        return;
    }

    questionTimeRemaining = getQuestionTime();
    
    renderQuestion();
    startQuestionTimer();
}

function renderQuestion()
{
    const questionElement =
        document.getElementById(
            "question"
        );

    const answerElement =
        document.getElementById(
            "questionArea"
        );

    questionElement.innerHTML =
        currentQuestion.question;

    answerElement.innerHTML = "";

    switch(currentQuestion.type)
    {
        case "multiple_choice":
            renderMultipleChoice();
            break;

        case "text":
            renderText();
            break;

        case "multiple_text":
        case "ordered_text":
            renderMultiFieldQuestion();
            break;
    }
}

function renderMultiFieldQuestion()
{
    let html = "";

    currentQuestion.fields.forEach(
        (field,index) =>
        {
            html += `
                <input
                    id="field_${index}"
                    class="input input-bordered w-full mb-2"
                    placeholder="${field}">
            `;
        });

    html += `
        <button
            class="btn btn-primary mt-3">

            Responder

        </button>
    `;

    document
        .getElementById("questionArea")
        .innerHTML =
        html;
}

function answerMultiField()
{
    switch(currentQuestion.type)
    {
        case "multiple_text":
            validateMultipleText();
            break;

        case "ordered_text":
            validateOrderedText();
            break;
    }
}

function renderMultipleChoice()
{
    let html = "";

    currentQuestion.options.forEach(
        (option,index) =>
        {
            html += `
                <button
                    class="btn btn-outline w-full mb-2"
                    onclick="answerMultipleChoice(${index})">
                    ${option}
                </button>
            `;
        });

    document
        .getElementById(
            "questionArea"
        )
        .innerHTML =
        html;
}

function renderText()
{
    document
        .getElementById(
            "questionArea"
        )
        .innerHTML =
        `
        <input
            id="txtAnswer"
            class="input input-bordered w-full"
            autocomplete="off">

        <button
            class="btn btn-primary mt-3"
            onclick="answerText()">
            Responder
        </button>
        `;
}

//End Funções de gestão de perguntas e respostas no ecrã

//Funções de Gestão de tempo
let questionTimerInterval = null;
let gameTimerInterval = null;

function startGameTimer()
{
    clearInterval(
        gameTimerInterval
    );

    gameStartTime =
        new Date();

    updateGameTimer();

    gameTimerInterval =
        setInterval(
            updateGameTimer,
            1000
        );
}

function updateGameTimer()
{
    const timerElement =
        document.getElementById(
            "gameTimer"
        );

    if(!timerElement)
    {
        return;
    }

    const elapsedSeconds =
        Math.floor(
            (
                new Date() -
                gameStartTime
            ) / 1000
        );

    const minutes =
        String(
            Math.floor(
                elapsedSeconds / 60
            )
        ).padStart(2,"0");

    const seconds =
        String(
            elapsedSeconds % 60
        ).padStart(2,"0");

    timerElement.innerHTML =
        `⏱️ Tempo Total Jogo: ${minutes}:${seconds}`;
}

function startQuestionTimer()
{
    clearInterval(questionTimerInterval);
    updateQuestionTimer();
    
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
    const questionTimer =
        document.getElementById(
            "questionTimer"
        );

    if(!questionTimer)
    {
        return;
    }

    questionTimer.innerHTML =
        `🕒 Tempo Restante Pergunta: ${questionTimeRemaining}s`;
}

function getQuestionTime()
{
    switch(currentQuestion.type)
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
//End Funções de Gestão de tempo

