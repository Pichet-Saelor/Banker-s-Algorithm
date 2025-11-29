let process, resource;

function createTables() {
    process = Number(document.getElementById("ProcessNum").value);
    resource = Number(document.getElementById("ResourceNum").value);

    if (!process) { alert('Enter process'); return; }
    if (!resource) { alert('Enter resource'); return; }

    document.getElementById("allTables").style.visibility = "visible";

    columnTable('r', 'Resource', 'resourceTable', 'allTables');
    gridTable('a', 'Allocation', 'allocationTable', 'allTables');
    gridTable('m', 'Maximum', 'maximumTable', 'allTables');

    document.getElementById("createTables").disabled = true;
    document.getElementById("findNeedandAvailable").disabled = false;

    scrollToBottom();
}

function columnTable(ch, tableName, tableId, divId) {
    var myTableDiv = document.getElementById(divId);

    var title = document.createElement('P');
    title.appendChild(document.createTextNode(tableName));
    myTableDiv.appendChild(title);

    var table = document.createElement('TABLE');
    table.id = tableId;

    var tableBody = document.createElement('TBODY');
    table.appendChild(tableBody);

    for (let i = 1; i <= resource; i++) {
        var tr = document.createElement('TR');
        tableBody.appendChild(tr);

        var td = document.createElement('TD');
        td.appendChild(document.createTextNode(String.fromCharCode("A".charCodeAt(0) + (i - 1))));
        tr.appendChild(td);

        td = document.createElement('TD');
        var input = document.createElement("input");
        input.type = "text";
        input.id = ch + i;
        td.appendChild(input);
        tr.appendChild(td);
    }

    myTableDiv.appendChild(table);
}

function gridTable(ch, tableName, tableId, divId) {
    var myTableDiv = document.getElementById(divId);

    var title = document.createElement('P');
    title.appendChild(document.createTextNode(tableName));
    myTableDiv.appendChild(title);

    var table = document.createElement('TABLE');
    table.id = tableId;
    var tableBody = document.createElement('TBODY');
    table.appendChild(tableBody);

    for (let i = 0; i <= process; i++) {
        var tr = document.createElement('TR');
        tableBody.appendChild(tr);

        for (let j = 0; j <= resource; j++) {
            var td = document.createElement('TD');
            if (i == 0 && j == 0) td.appendChild(document.createTextNode("Resource / Process"));
            else if (i == 0) td.appendChild(document.createTextNode(String.fromCharCode("A".charCodeAt(0) + (j - 1))));
            else if (j == 0) td.appendChild(document.createTextNode("P" + (i-1)));
            else {
                var input = document.createElement("input");
                input.type = "text";
                input.id = ch + i + j;
                td.appendChild(input);
            }
            tr.appendChild(td);
        }
    }

    myTableDiv.appendChild(table);
}

function finishAndWorkTable(ch, tableName, tableId, divId, count, valueFunc, isInputValue=false) {
    var myTableDiv = document.getElementById(divId);

    var title = document.createElement('P');
    title.appendChild(document.createTextNode(tableName));
    myTableDiv.appendChild(title);

    var table = document.createElement('TABLE');
    table.id = tableId;
    var tbody = document.createElement('TBODY');
    table.appendChild(tbody);

    var trHeader = document.createElement('TR');
    for (let i = 1; i <= count; i++) {
        var td = document.createElement('TD');
        td.appendChild(document.createTextNode(ch === 'finish' ? "P" + (i-1) : String.fromCharCode("A".charCodeAt(0) + (i-1))));
        trHeader.appendChild(td);
    }
    tbody.appendChild(trHeader);

    var trInput = document.createElement('TR');
    for (let i = 1; i <= count; i++) {
        var td = document.createElement('TD');
        var input = document.createElement("input");
        input.type = "text";
        input.id = ch + i;
        input.disabled = true;
        if (isInputValue) input.value = valueFunc(i);
        td.appendChild(input);
        trInput.appendChild(td);
    }
    tbody.appendChild(trInput);

    myTableDiv.appendChild(table);
}

function safeSequenceTable(ch, tableName, tableId, divId) {
    var myTableDiv = document.getElementById(divId);

    var title = document.createElement('P');
    title.appendChild(document.createTextNode(tableName));
    myTableDiv.appendChild(title);

    var table = document.createElement('TABLE');
    table.id = tableId;
    var tableBody = document.createElement('TBODY');
    table.appendChild(tableBody);

    var tr = document.createElement('TR');
    tableBody.appendChild(tr);

    for (let i = 1; i <= process; i++) {
        var td = document.createElement('TD');
        var input = document.createElement("input");
        input.type = "text";
        input.id = ch + i;
        td.appendChild(input);
        tr.appendChild(td);
    }

    myTableDiv.appendChild(table);
}

function findNeedandAvailable() {
    if (!isValid()) return;

    gridTable('n', 'Need', 'needTable', 'allTables');
    calculateNeed();

    columnTable('av', 'Available', 'availableTable', 'allTables');
    calculateAvailable();

    document.getElementById("findNeedandAvailable").disabled = true;
    document.getElementById("checkSafety").disabled = false;

    scrollToBottom();
}

function calculateNeed() {
    for (var i = 1; i <= process; i++) {
        for (var j = 1; j <= resource; j++) {
            var max = document.getElementById('m' + i + j).value;
            var allocate = document.getElementById('a' + i + j).value;
            document.getElementById('n' + i + j).value = max - allocate;
            document.getElementById('n' + i + j).disabled = true;
        }
    }
}

function calculateAvailable() {
    for (var i = 1; i <= resource; i++) {
        var res = document.getElementById('r' + i).value;
        var allocate = 0;
        for (var j = 1; j <= process; j++) allocate += Number(document.getElementById('a' + j + i).value);
        document.getElementById('av' + i).value = res - allocate;
        document.getElementById('av' + i).disabled = true;
    }
}

function checkAndGenerateSafeSeq() {
    calculateNeed();
    calculateAvailable();

    var myTableDiv = document.getElementById('allTables');

    finishAndWorkTable('finish', 'Finish', 'finishTable', 'allTables', process);

    finishAndWorkTable('work', 'Work', 'workTable', 'allTables', resource, (i) => Number(document.getElementById('av' + i).value), true);

    let completed = new Array(process).fill(false);
    let safeSequence = [];
    let progress = true;

    var work = [];
    for (let j = 0; j < resource; j++) {
        work[j] = Number(document.getElementById('av' + (j + 1)).value);
        document.getElementById('work' + (j + 1)).value = work[j];
    }

    while (safeSequence.length < process && progress) {
        progress = false;

        for (let i = 0; i < process; i++) {
            if (completed[i]) continue;

            let canRun = true;
            for (let j = 0; j < resource; j++) {
                let need = Number(document.getElementById('n' + (i + 1) + (j + 1)).value);
                if (need > work[j]) { canRun = false; break; }
            }

            if (canRun) {
                for (let j = 0; j < resource; j++) {
                    let allocate = Number(document.getElementById('a' + (i + 1) + (j + 1)).value);
                    work[j] += allocate;
                    document.getElementById("work" + (j + 1)).value = work[j];
                }
                completed[i] = true;
                safeSequence.push(i + 1);
                progress = true;

                document.getElementById("finish" + (i + 1)).value = "True";
            }
        }
    }

    for (let i = 0; i < process; i++) {
        if (!completed[i]) document.getElementById("finish" + (i + 1)).value = "False";
    }

    var resultMessage = document.createElement('h2');
    resultMessage.style.textAlign = "center";
    resultMessage.style.marginTop = "20px";

    if (safeSequence.length === process) {
        safeSequenceTable('safe', 'Safe Sequence', 'safeSequence', 'allTables');
        for (let i = 1; i <= process; i++) {
            document.getElementById('safe' + i).value = "P" + (safeSequence[i - 1] - 1);
            document.getElementById('safe' + i).disabled = true;
        }
        resultMessage.textContent = "System is Safe. Safe Sequence : " + safeSequence.map(p => "P" + (p-1)).join(", ");
    } else {
        let unfinished = completed.filter(c => !c).length;
        let canRunAny = completed.some(c => !c) && safeSequence.length > 0;

        if (canRunAny) {
            resultMessage.textContent = "System is Unsafe. " + unfinished + " process cannot run.";
        } else {
            resultMessage.textContent = "Deadlock detected. No process can run.";
        }
    }

    myTableDiv.appendChild(resultMessage);

    document.getElementById("checkSafety").disabled = true;

    scrollToBottom();
}

function isValid() {
    for (let i = 1; i <= resource; i++) {
        if (document.getElementById('r' + i).value === "") {
            alert("Invalid data: All fields must be filled.");
            return false;
        }
    }

    for (let i = 1; i <= process; i++) {
        for (let j = 1; j <= resource; j++) {
            let alloc = document.getElementById('a' + i + j).value;
            let max = document.getElementById('m' + i + j).value;
            if (alloc === "" || max === "") {
                alert("Invalid data: All fields must be filled.");
                return false;
            }

            alloc = Number(alloc);
            max = Number(max);

            if (alloc > max) {
                alert("Invalid data: Maximum cannot be less than allocation.");
                return false;
            }
        }
    }

    for (let j = 1; j <= resource; j++) {
        let res = Number(document.getElementById('r' + j).value);
        let totalAlloc = 0;
        for (let i = 1; i <= process; i++) {
            totalAlloc += Number(document.getElementById('a' + i + j).value);
        }
        if (totalAlloc > res) {
            alert("Invalid data: Sum of allocations for Resource " + String.fromCharCode(64 + j) + " exceeds available amount.");
            return false;
        }
    }

    return true;
}

function scrollToBottom() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.onscroll = function () {
    let button = document.getElementById("scrollTopButton");
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        button.style.display = "block";
    } else {
        button.style.display = "none";
    }
};

function reset() { location.reload(); }