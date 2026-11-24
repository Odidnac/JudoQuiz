let currentFile = "";
let questions = [];

const filePrefixes =
{
    "atletas.json": "ATL",
    "dojo.json": "DOJ",
    "filosofia.json": "FIL",
    "historia.json": "HIS",
    "historiaPRT.json": "HIC",
    "katas.json": "KAT",
    "regras.json": "REG",
    "tecnicas.json": "TEC"
};

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

        document
            .getElementById(
                "btnNewQuestion"
            )
            .disabled = false;
        
        document
            .getElementById(
                "btnExportJson"
            )
            .disabled = false;

        document
            .getElementById(
                "btnDuplicates"
            )
            .disabled = false;
        
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

function addQuestion()
{
    document
        .getElementById(
            "editIndex"
        )
        .value = "";

    document
        .getElementById(
            "level"
        )
        .value = "all";

    document
        .getElementById(
            "type"
        )
        .value =
        "multiple_choice";

    document
        .getElementById(
            "question"
        )
        .value = "";

    document
        .getElementById(
            "image"
        )
        .value = "";

    updateQuestionTypeFields();

    document
        .getElementById(
            "questionModal"
        )
        .showModal();
}

function updateQuestionTypeFields()
{
    const type =
        document
            .getElementById(
                "type"
            )
            .value;

    let html = "";

    switch(type)
    {
        case "multiple_choice":
            html =
            `
            <label class="font-bold">
                Opções
                (1 por linha)
            </label>

            <textarea
                id="options"
                rows="5"
                class="textarea textarea-bordered w-full">
            </textarea>

            <label
                class="font-bold mt-4 block">

                Índice da resposta correta

            </label>

            <input
                id="correct"
                type="number"
                min="0"
                class="input input-bordered w-full">
            `;
            break;

        case "text":
            html =
            `
            <label class="font-bold">
                Respostas Aceites
                (1 por linha)
            </label>

            <textarea
                id="acceptedAnswers"
                rows="5"
                class="textarea textarea-bordered w-full">
            </textarea>
            `;
            break;

        case "multiple_text":
            html =
            `
            <label class="font-bold">
                Respostas
                (1 por linha)
            </label>

            <textarea
                id="answers"
                rows="10"
                class="textarea textarea-bordered w-full">
            </textarea>
            `;
            break;

        case "ordered_text":
            html =
            `
            <label class="font-bold">
                Respostas pela ordem correta
                (1 por linha)
            </label>

            <textarea
                id="answers"
                rows="10"
                class="textarea textarea-bordered w-full">
            </textarea>
            `;
            break;
    }

    document
        .getElementById(
            "questionTypeSpecificArea"
        )
        .innerHTML =
        html;
}

function closeModal()
{
    document
        .getElementById(
            "questionModal"
        )
        .close();
}

function getNextQuestionId()
{
    const prefix =
        filePrefixes[currentFile];

    const numbers =
        questions.map(
            q =>
                parseInt(
                    q.id.split(".")[1]
                )
        );

    const nextNumber =
        numbers.length === 0
            ? 1
            : Math.max(...numbers) + 1;

    return `${prefix}.${nextNumber}`;
}

function detectDuplicateIds()
{
    const ids =
        new Set();

    return questions.filter(
        question =>
        {
            if(ids.has(question.id))
            {
                return true;
            }

            ids.add(
                question.id
            );

            return false;
        }
    );
}
