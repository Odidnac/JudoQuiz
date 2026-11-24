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
    const filterText =
        document
            .getElementById(
                "filterText"
            )
            .value
            .toLowerCase();

    const filterType =
        document
            .getElementById(
                "filterType"
            )
            .value;

    const filterLevel =
        document
            .getElementById(
                "filterLevel"
            )
            .value;

    const filteredQuestions =
        questions.filter(
            question =>
            {
                const matchesText =
                    question.question
                        .toLowerCase()
                        .includes(
                            filterText
                        );

                const matchesType =
                    !filterType
                    ||
                    question.type ===
                    filterType;

                const matchesLevel =
                    !filterLevel
                    ||
                    question.level ===
                    filterLevel;

                return (
                    matchesText
                    &&
                    matchesType
                    &&
                    matchesLevel
                );
            }
        );

    let html = "";

    filteredQuestions.forEach(
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
                    ${question.question}
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
                        onclick="editQuestion(${question.id})">
                        Editar
                    </button>

                    <button
                        class="btn btn-error btn-sm"
                        onclick="deleteQuestion(${question.id})">
                        Apagar
                    </button>
                </td>
            </tr>
            `;
        }
    );

    document
        .getElementById(
            "questionsTable"
        )
        .innerHTML =
        html;
}
