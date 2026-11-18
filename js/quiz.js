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
                        Respostas rápidas podem valer:
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

function confirmRestart()
{
    showConfirmDialog(
        "Reiniciar Quiz",
        "Todo o progresso atual será perdido. Pretende continuar?",
        restartGame
    );
}
//END Funções de validação de user e inicio de jogo

