const questionFiles =
[
    "data/atletas.json",
    "data/dojo.json",
    "data/filosofia.json",
    "data/historia.json",
    "data/historiaPRT.json",
    "data/katas.json",
    "data/regras.json",
    "data/tecnicas.json",
];

let shidos = 0;
let ippons = 0;
let wazaris = 0;
let yukos = 0;
let answeredCorrectly = [];
let questions = [];
let questionTimerInterval = null;
let gameTimerInterval = null;

let gameRunning = false;

//Funções de validação de user
window.onload = async function ()
{
    const accessGranted = await validateAccess();

    if(!accessGranted)
    {
        window.location.href = "index.html";
    }

    gameRunning = false;
    updateButtons();
    
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
function restartGame()
{
    clearInterval(
        gameTimerInterval
    );

    clearInterval(
        questionTimerInterval
    );

    currentQuestion = null;
    answeredCorrectly = [];

    ippons = 0;
    wazaris = 0;
    yukos = 0;
    shidos = 0;

    updateScoreBoard();
    updateShidos();
    gameRunning = false;
    updateButtons();
    showWelcomeScreen();
}

function confirmEndGame()
{
    if(!gameRunning)
    {
        return;
    }
    
    showConfirmDialog(
        "Terminar Jogo",
        "Pretende terminar o jogo e calcular a pontuação atual?",
        endGame
    );
}

function endGame()
{
    showFinalScreen(
        "quit"
    );
}

function showConfirmDialog(
    title,
    text,
    callback
)
{
    if(confirm(text))
    {
        callback();
    }
}

async function startQuiz()
{
    document
        .getElementById("gameContent")
        .innerHTML =
        `
        <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
                <div
                    class="
                    flex
                    justify-between
                    items-center
                    flex-wrap
                    gap-2">
                
                    <div
                        class="font-bold text-lg"
                        id="playerName">
                
                        ${localStorage.getItem("playerName")}
                
                    </div>
                
                    <div
                        id="timersBar"
                        class="text-sm font-semibold">
                
                        ⏱️ 00:00 | 🕒 00s
                
                    </div>
                
                </div>

                <div class="divider"></div>

                <div
                    class="flex flex-wrap justify-center gap-2">
                
                    <span class="badge badge-success badge-lg">
                        🥇
                        <span id="ippons">
                            0
                        </span>
                    </span>
                
                    <span
                        class="badge badge-neutral badge-lg">
                        🥈
                        <span id="wazaris">
                            0
                        </span>
                    </span>
                
                    <span
                        class="badge badge-info badge-lg">
                        🥉
                        <span id="yukos">
                            0
                        </span>
                    </span>
                
                    <span
                        id="shidos"
                        class="badge badge-error badge-lg">
                    </span>
                
                </div>

                <div class="divider"></div>

                <div class="
                            flex
                            flex-col
                            md:flex-row
                            md:justify-between
                            gap-2">

                <div
                    class="flex flex-wrap justify-center gap-2">
                
                    <span
                        id="questionCategory"
                        class="badge badge-primary badge-lg">
                    </span>
                
                    <span
                        id="questionLevel"
                        class="badge badge-secondary badge-lg">
                    </span>
                
                </div>
            </div>
            
            <div class="divider"></div>
                <h2
                    id="question"
                    class="text-xl md:text-2xl font-bold">
                </h2>
                <div
                    id="questionImage"
                    class="mx-auto
                           rounded-lg
                           shadow-lg
                           w-full
                           max-w-md
                           max-h-80
                           object-contain">
                </div>
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

    gameRunning = true;
    updateButtons();
}

function updateButtons()
{
    const endGameButton =
        document.getElementById(
            "btnEndGame"
        );

    if(endGameButton)
    {
        endGameButton.disabled =
            !gameRunning;
    }
}
//End Funções de inicio ou reinicio de Jogo

//Funções de gestão de pontos e vidas de jogo
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

    let text = "";

    for(let i = 0; i < 3; i++)
    {
        text +=
            i < shidos
            ? "S"
            : "-";
    }

    shidosElement.innerHTML =
        `⚠️ ${text}`;
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

    showDecision(
        "⚠️ SHIDO",
        "images/Shido.png"
    );
}

function answerCorrect()
{
    clearInterval(
        questionTimerInterval
    );
    awardScore();
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

function hansokuMake()
{
    clearInterval(
        gameTimerInterval
    );

    clearInterval(
        questionTimerInterval
    );

    document
        .getElementById(
            "hansokuStats"
        )
        .innerHTML =
        `
        <div class="space-y-2">
            <div>
                🏆 Ippons: ${ippons}
            </div>
            <div>
                🥈 Wazaris: ${wazaris}
            </div>
            <div>
                🥉 Yukos: ${yukos}
            </div>
        </div>
        `;
    
    const modal =
        document.getElementById(
            "hansokuModal"
        );
    modal.showModal();
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

let questionTimeRemaining = 0;
function awardScore()
{
    switch(currentQuestion.type)
    {
        case "multiple_choice":
        case "text":
            if(questionTimeRemaining >= 15)
            {
                ippons++;

                showDecision(
                    "🏆 IPPON",
                    "images/ippon.png"
                );
                
            }
            else if(questionTimeRemaining >= 10)
            {
                wazaris++;

                showDecision(
                    "🥈 WAZARI",
                    "images/Wazari.png"
                );
            }
            else
            {
                yukos++;
                showDecision(
                    "🥉 YUKO",
                    "images/Yuko.png"
                );
            }
            break;

        case "multiple_text":
        case "ordered_text":
            if(questionTimeRemaining >= 45)
            {
                ippons++;
            }
            else if(questionTimeRemaining >= 30)
            {
                wazaris++;
            }
            else
            {
                yukos++;
            }
            break;
    }
    updateScoreBoard();
}

function updateScoreBoard()
{
    document
        .getElementById(
            "ippons"
        )
        .innerHTML =
        ippons;

    document
        .getElementById(
            "wazaris"
        )
        .innerHTML =
        wazaris;

    document
        .getElementById(
            "yukos"
        )
        .innerHTML =
        yukos;
}

function answerText()
{
    const answer =
        document
            .getElementById(
                "txtAnswer"
            )
            .value
            .trim()
            .toLowerCase();

    const correct =
        currentQuestion.acceptedAnswers
            .some(
                a =>
                    a.toLowerCase() === answer
            );

    if(correct)
    {
        answerCorrect();
    }
    else
    {
        answerWrong();
    }
}

function showDecision(
    title,
    image
)
{
    document
        .getElementById(
            "decisionTitle"
        )
        .innerHTML =
        title;

    document
        .getElementById(
            "decisionImage"
        )
        .src =
        image;

    const modal =
        document.getElementById(
            "decisionModal"
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

function calculateFinalScore()
{
    const ipponPoints = ippons * 100;

    const wazariPoints = wazaris * 10;

    const yukoPoints = yukos;

    let bonus = 0;

    if(shidos === 0)
    {
        bonus = 2200;
    }
    else if(shidos === 1)
    {
        bonus = 2000;
    }
    else if(shidos === 2)
    {
        bonus = 1000;
    }

    const baseScore = ipponPoints + wazariPoints + yukoPoints;

    return {
        ipponPoints: ipponPoints,
        wazariPoints: wazariPoints,
        yukoPoints: yukoPoints,
        baseScore: baseScore,
        bonus: bonus,
        total:
            baseScore +
            bonus
    };
}

function getVictoryTitle()
{
    if(shidos === 0)
    {
        return "🥇 Ouro Olímpico";
    }

    if(shidos === 1)
    {
        return "🏆 Ouro Mundial";
    }

    return "🥋 Grand Slam";
}

function saveHighScore()
{
    const playerName =
        document
            .getElementById(
                "rankingName"
            )
            .value
            .trim();

    if(playerName === "")
    {
        alert(
            "Introduza um nome."
        );

        return;
    }

    const finalScore = calculateFinalScore();

    const ranking =
        JSON.parse(
            localStorage.getItem(
                "ranking"
            ) || "[]"
        );

    ranking.push({
        player: playerName,
        score: finalScore.total,
        ippons,
        wazaris,
        yukos,
        shidos,
        medal: getVictoryTitle()
    });

    ranking.sort(
        (a,b) =>
            b.score - a.score
    );

    ranking.splice(10);

    localStorage.setItem(
        "ranking",
        JSON.stringify(
            ranking
        )
    );

    restartGame();
}

function victory()
{
    showFinalScreen(
        "victory"
    );
}

function getVictoryDescription()
{
    if(shidos === 0)
    {
        return "Parabéns pela vitória. A sua prestação valeu-lhe o Ouro Olímpico.";
    }

    if(shidos === 1)
    {
        return "Parabéns pela vitória. A sua prestação valeu-lhe o Ouro Mundial.";
    }

    return "Parabéns pela vitória. A sua prestação valeu-lhe a vitória no Grand Slam.";
}

function showHighScores()
{
    const ranking =
        JSON.parse(
            localStorage.getItem(
                "ranking"
            ) || "[]"
        );

    let html =
        `
        <div class="overflow-x-auto">
        <table class="table table-zebra w-full">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Nome</th>
                    <th>Pontos</th>
                    <th>Título</th>

                </tr>
            </thead>
            <tbody>
        `;

    ranking.forEach(
        (entry,index) =>
        {
            html +=
            `
            <tr>
                <td>
                    ${index + 1}
                </td>
                <td>
                    ${entry.player}
                </td>
                <td>
                    ${entry.score}
                </td>
                <td>
                    ${entry.medal}
                </td>
            </tr>
            `;
        });

    html +=
        `    </tbody>
        </table>
        </div>
        `;

    document
        .getElementById(
            "highScoresTable"
        )
        .innerHTML =html;

    document.getElementById(
            "highScoresModal"
        ).showModal();
}

function showFinalScreen(
    resultType
)
{
    clearInterval(
        gameTimerInterval
    );

    clearInterval(
        questionTimerInterval
    );

    const score = calculateFinalScore();

    let title = "";
    let text = "";

    switch(resultType)
    {
        case "victory":
            title = getVictoryTitle();
            text = getVictoryDescription();
            break;

        case "hansoku":
            title = "🥋 HANSOKU-MAKE";
            text = "O jogo terminou por acumulação de 3 Shidos.";
            break;

        case "quit":
            title = "⏹️ JOGO TERMINADO";
            text = "O jogo foi terminado pelo utilizador. A pontuação apresentada corresponde ao progresso obtido até ao momento.";
            break;
    }

    document
        .getElementById(
            "victoryTitle"
        )
        .innerHTML =
        title;

    document
        .getElementById(
            "victoryText"
        )
        .innerHTML =
        text;

    document
        .getElementById(
            "finalIppons"
        )
        .innerHTML =
        ippons;

    document
        .getElementById(
            "finalWazaris"
        )
        .innerHTML =
        wazaris;

    document
        .getElementById(
            "finalYukos"
        )
        .innerHTML =
        yukos;

    document
        .getElementById(
            "finalIpponPoints"
        )
        .innerHTML =
        score.ipponPoints +
        " pontos";

    document
        .getElementById(
            "finalWazariPoints"
        )
        .innerHTML =
        score.wazariPoints +
        " pontos";

    document
        .getElementById(
            "finalYukoPoints"
        )
        .innerHTML =
        score.yukoPoints +
        " pontos";

    document
        .getElementById(
            "finalBonusTitle"
        )
        .innerHTML =
        getBonusTitle();

    document
        .getElementById(
            "finalBonusPoints"
        )
        .innerHTML =
        score.bonus +
        " pontos extra";

    document
        .getElementById(
            "finalTotalScore"
        )
        .innerHTML =
        score.total;

    document
        .getElementById(
            "rankingName"
        )
        .value =
        localStorage.getItem(
            "playerName"
        ) || "";

    document
        .getElementById(
            "victoryModal"
        )
        .showModal();

    gameRunning = false;
    updateButtons();
}

function validateMultipleText()
{
    const correctAnswers =
        currentQuestion.acceptedAnswers;

    const givenAnswers = [];

    for(
        let index = 0;
        index < correctAnswers.length;
        index++
    )
    {
        givenAnswers.push(
            document
                .getElementById(
                    `field_${index}`
                )
                .value
                .trim()
                .toLowerCase()
        );
    }

    let score = 0;

    correctAnswers.forEach(
        acceptedList =>
        {
            const found =
                givenAnswers.some(
                    answer =>
                        acceptedList.includes(
                            answer
                        )
                );

            if(found)
            {
                score++;
            }
        }
    );

    if(score === correctAnswers.length)
    {
        answerCorrect();
    }
    else
    {
        answerWrong();
    }
}

function validateOrderedText()
{
    const acceptedAnswers =
        currentQuestion.acceptedAnswers;

    let correct = true;

    for(
        let index = 0;
        index < acceptedAnswers.length;
        index++
    )
    {
        const answer =
            document
                .getElementById(
                    `field_${index}`
                )
                .value
                .trim()
                .toLowerCase();

        const accepted = acceptedAnswers[index];

        if(!accepted.includes(answer))
        {
            correct = false;
            break;
        }
    }

    if(correct)
    {
        answerCorrect();
    }
    else
    {
        answerWrong();
    }
}
//End Funções de gestão de pontos e vidas de jogo

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
        victory();

        return;
    }

    questionTimeRemaining = getQuestionTime();
    
    renderQuestion();
    startQuestionTimer();
}

function renderQuestion()
{
    document
        .getElementById(
            "questionCategory"
        )
        .innerHTML = currentQuestion.category;

    document
        .getElementById(
            "questionLevel"
        )
        .innerHTML = currentQuestion.level;

    const imageContainer =
        document.getElementById(
            "questionImage"
        );

    if(currentQuestion.image)
    {
        imageContainer.innerHTML =
        `
        <img
            src="${currentQuestion.image}"
            alt="Imagem da pergunta"
            class="mx-auto rounded-lg shadow-lg max-h-80">
        `;
    }
    else
    {
        imageContainer.innerHTML = "";
    }
    
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

    for(
        let index = 0;
        index < currentQuestion.acceptedAnswers.length;
        index++
    )
    {
        html += `
            <input
                id="field_${index}"
                class="input input-bordered w-full mb-2"
                placeholder="Resposta ${index + 1}">
        `;
    }

    html += `
        <button
            class="btn btn-primary w-full mt-3"
            onclick="answerMultiField()">

            Responder

        </button>
    `;

    document
        .getElementById(
            "questionArea"
        )
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
                    class="
                            btn
                            btn-outline
                            w-full
                            mb-2
                            min-h-14
                            whitespace-normal"
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
            class="
                    btn
                    btn-primary
                    mt-3
                    w-full"
            onclick="answerText()">
            Responder
        </button>
        `;
}
//End Funções de gestão de perguntas e respostas no ecrã

//Funções de Gestão de tempo
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

function updateTimersBar()
{
    const timerElement =
        document.getElementById(
            "timersBar"
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
        `⏱️ ${minutes}:${seconds} | 🕒 ${questionTimeRemaining}s`;
}

function updateGameTimer()
{
    updateTimersBar();
}

function startQuestionTimer()
{
    clearInterval(questionTimerInterval);
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
    updateTimersBar();
}

function getQuestionTime()
{
    if(
        currentQuestion.type === "multiple_text"
        ||
        currentQuestion.type === "ordered_text"
    )
    {
        return 20 + (
            (currentQuestion.acceptedAnswers.length - 1) * 5
        );
    }

    return 20;
}
//End Funções de Gestão de tempo

