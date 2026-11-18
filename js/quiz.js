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

function startQuiz()
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
                            class="badge badge-warning badge-lg">
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

    updateScoreBoard();
    updateShidos();
}
//End Funções de inicio ou reinicio de Jogo

