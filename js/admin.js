let currentFile = "";
let questions = [];

async function loadJsonFile()
{
    try
    {
        currentFile =
            document
                .getElementById(
                    "jsonSelector"
                )
                .value;

        const response =
            await fetch(
                `data/${currentFile}`
            );

        if(!response.ok)
        {
            throw new Error(
                "Erro ao carregar ficheiro"
            );
        }

        questions =
            await response.json();

        document
            .getElementById(
                "currentFileLabel"
            )
            .innerHTML =
            `Ficheiro atual: ${currentFile}`;

        renderTable();
    }
    catch(error)
    {
        alert(
            `Erro: ${error.message}`
        );
    }
}

function renderTable()
{
    let html = "";

    questions.forEach(
        (question,index) =>
        {
            html +=
            `
            <tr>

                <td>
                    ${question.id}
                </td>

                <td>
                    ${question.level}
                </td>

                <td>
                    ${question.type}
                </td>

                <td>
                    ${
                        question.question.length > 80
                        ? question.question.substring(0,80) + "..."
                        : question.question
                    }
                </td>

                <td>

                    ${
                        question.image
                        ?
                        '<span class="badge badge-info">IMG</span>'
                        :
                        ''
                    }

                </td>

                <td>

                    <button
                        class="btn btn-warning btn-sm me-1"
                        onclick="editQuestion(${index})">

                        Editar

                    </button>

                    <button
                        class="btn btn-error btn-sm"
                        onclick="deleteQuestion(${index})">

                        Apagar

                    </button>

                </td>

            </tr>
            `;
        });

    document
        .getElementById(
            "questionsTable"
        )
        .innerHTML =
        html;
}
