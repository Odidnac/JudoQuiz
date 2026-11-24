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

function exportJson()
{
    const exportQuestions =
        questions.map(
            question =>
            {
                const obj =
                {
                    id:
                        question.id,

                    category:
                        question.category,

                    level:
                        question.level,

                    type:
                        question.type,

                    question:
                        question.question,

                    image:
                        question.image || null
                };

                switch(question.type)
                {
                    case "multiple_choice":
                        obj.options = question.options || [];

                        obj.correct = question.correct ?? 0;
                        break;

                    case "text":
                        obj.acceptedAnswers = question.acceptedAnswers || [];
                        break;

                    case "multiple_text":

                    case "ordered_text":
                        obj.answers = question.answers || [];
                        break;
                }
                return obj;
            }
        );

    const json =
        JSON.stringify(
            exportQuestions,
            null,
            2
        );

    const blob =
        new Blob(
            [json],
            {
                type: "application/json"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href = url;

    link.download = currentFile;

    document.body.appendChild(
        link
    );

    link.click();

    document.body.removeChild(
        link
    );

    URL.revokeObjectURL(
        url
    );
}

function deleteQuestion(id)
{
    const question =
        questions.find(
            q => q.id === id
        );

    if(!question)
    {
        return;
    }

    if(
        !confirm(
            `Apagar a pergunta:\n\n"${question.question}"?`
        )
    )
    {
        return;
    }

    questions =
        questions.filter(
            q => q.id !== id
        );

    renderTable();
}
