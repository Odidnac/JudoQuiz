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
        await fetch("players.json");

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
