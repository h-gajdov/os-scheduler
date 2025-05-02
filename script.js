const algorithmSelect = document.getElementById('dropdown-algorithm');
const processes = document.getElementById('processes');
const tarrival = document.getElementById('tarrival');
const texecution = document.getElementById('texecution');
const resultContainer = document.getElementById('result-container');
const boxContainer = document.getElementById('box-container');
const rrquantumInput = document.getElementById('rr-quantum');

algorithmSelect.addEventListener('change', (e) => {
    const rr = document.getElementById('rr-quantum-div');
    const ml = document.getElementById('mlfq-quantum-div');
    rr.setAttribute('hidden', e.target.value);
    ml.setAttribute('hidden', e.target.value);
    switch (e.target.value) {
        case 'rr':
            rr.removeAttribute('hidden');
            break;
        case 'mlfq':
            ml.removeAttribute('hidden');
            break;
    }
})

function fifo(processes) {
    let arr = new FIFOQueue();
    let time = 0;
    let sequence = new Sequence();
    let nowExecuting = null;

    while(processes.length !== 0) {
        for(let i = 0; i < processes.length; i++) {
            if(time === processes[i].arrival) {
                arr.enqueue(processes[i])
            }
        }

        if(arr.isEmpty()) {
            let lastSeq = sequence.peek();
            if(lastSeq == null || lastSeq.process !== null)
                sequence.push(new SequenceNode(null, time, time));
            sequence.peek().endTime++;

            time++;
            continue;
        }

        if(nowExecuting == null) {
            nowExecuting = arr.execute();
            sequence.push(new SequenceNode(nowExecuting, time, time));
        }

        sequence.peek().endTime++;
        if(nowExecuting) {
            nowExecuting.time--;
            if(nowExecuting.time === 0) {
                arr.removeEmpty();
                processes.shift();
                nowExecuting = null;
            }
        }

        time++;
    }

    return sequence;
} 

function srtn(processes) {
    let arr = new SRTNQueue();
    let time = 0;
    let sequence = new Sequence();
    let nowExecuting = null;
    let flag = false;

    while(processes.length !== 0) {
        for(let i = 0; i < processes.length; i++) {
            if(time === processes[i].arrival) {
                arr.enqueue(processes[i])
                flag = true;
            }
        }

        if(arr.isEmpty()) {
            let lastSeq = sequence.peek();
            if(lastSeq == null || lastSeq.process !== null)
                sequence.push(new SequenceNode(null, time, time));
            sequence.peek().endTime++;

            time++;
            continue;
        }

        if(nowExecuting == null || flag) {
            let prev = nowExecuting;
            nowExecuting = arr.execute(nowExecuting);
            if(prev !== nowExecuting) sequence.push(new SequenceNode(nowExecuting, time, time));
            flag = false;
        }

        sequence.peek().endTime++;
        if(nowExecuting) {
            nowExecuting.time--;
            if(nowExecuting.time === 0) {
                arr.removeEmpty();
                let i = processes.indexOf(nowExecuting);
                if(i !== -1) processes.splice(i, 1)
                nowExecuting = null;
            }
        }
        time++;
    }

    return sequence;
}

function roundrobin(processes) {
    let arr = new RRQueue();
    let q = parseInt(rrquantumInput.value);
    let time = 0;
    let sequence = new Sequence();
    let nowExecuting = null;

    while(processes.length !== 0) {
        for(let i = 0; i < processes.length; i++) {
            if(time === processes[i].arrival) {
                arr.enqueue(processes[i]);
            }
        }

        if(arr.isEmpty()) {
            let lastSeq = sequence.peek();
            if(lastSeq == null || lastSeq.process !== null)
                sequence.push(new SequenceNode(null, time, time));
            sequence.peek().endTime++;

            time++;
            continue;
        }

        if(nowExecuting == null || nowExecuting.time === 0 || sequence.peek() !== null && (sequence.peek().executionTime() === q)) {
            nowExecuting = arr.execute();
            sequence.push(new SequenceNode(nowExecuting, time, time));
        }

        sequence.peek().endTime++;
        if(nowExecuting) {
            nowExecuting.time--;
            if(nowExecuting.time === 0) {
                arr.removeEmpty();
                let i = processes.indexOf(nowExecuting);
                if(i !== -1) processes.splice(i, 1);
                nowExecuting = null;
            }
        }
        time++;
    }
    return sequence;
}

function quantumIsDone(executionTime, quants, priority) {
    return quants[priority] && quants[priority] === executionTime;
}

function mlfq(processes) {
    let arr0, arr1, arr2;
    let isfifo = document.getElementById('is-fifo').checked;
    arr0 = new RRQueue(); arr1 = new RRQueue(); arr2 = (isfifo) ? new FIFOQueue() : new SRTNQueue();
    console.log(arr2);
    let q0 = parseInt(document.getElementById('q0').value);
    let q1 = parseInt(document.getElementById('q1').value);

    let time = 0;
    let sequence = new Sequence();
    let nowExecuting = null, priority;

    while(processes.length !== 0) {
        for(let i = 0; i < processes.length; i++) {
            if(time === processes[i].arrival) {
                arr0.enqueue(processes[i]);
            }
        }

        if(arr0.isEmpty() && arr1.isEmpty() && arr2.isEmpty() && nowExecuting == null) {
            let lastSeq = sequence.peek();
            if(lastSeq == null || lastSeq.process !== null)
                sequence.push(new SequenceNode(null, time, time));
            sequence.peek().endTime++;

            time++;
            continue;
        }

        let contextSwitch = false;
        if(nowExecuting == null || nowExecuting.time === 0 || priority === 2 || quantumIsDone(sequence.peek().executionTime(), [q0, q1], priority)) {
            if(!arr0.isEmpty()) {
                nowExecuting = arr0.execute(true);
                if(nowExecuting.time > q0) arr1.enqueue(nowExecuting);
                contextSwitch = true;
                priority = 0;
            } else if(!arr1.isEmpty()) {
                nowExecuting = arr1.execute(true);
                if(nowExecuting.time > q1) arr2.enqueue(nowExecuting);
                contextSwitch = true;
                priority = 1;
            } else if(!arr2.isEmpty()) {
                if(priority !== 2 || nowExecuting === null) {
                    nowExecuting = arr2.execute(nowExecuting);
                    contextSwitch = true;
                    priority = 2;
                }
            }
        }

        if(contextSwitch) sequence.push(new SequenceNode(nowExecuting, time, time));

        sequence.peek().endTime++;
        if(nowExecuting) {
            nowExecuting.time--;
            if(nowExecuting.time === 0) {
                arr0.removeEmpty();
                arr1.removeEmpty();
                arr2.removeEmpty();

                let i = processes.indexOf(nowExecuting);
                if(i !== -1) processes.splice(i, 1);
                nowExecuting = null;
            }
        }
        time++;
    }

    return sequence;
}

function solve() {
    let algorithm = algorithmSelect.value;
    let labels = processes.value.split(' ');
    let arrivals = tarrival.value.split(' ');
    for(let i = 0; i < arrivals.length; i++)
        arrivals[i] = parseInt(arrivals[i]);
    let executions = texecution.value.split(' ');
    for(let i = 0; i < executions.length; i++)
        executions[i] = parseInt(executions[i]);

    let lprocesses = [];

    for(let i = 0; i < labels.length; i++) {
        lprocesses.push(new Process(labels[i], arrivals[i], executions[i]));
    }

    //SORT ACCORDING TO ARRIVAL
    for(let i = 0; i < lprocesses.length; i++) {
        let idx = i;
        for(let j = i + 1; j < lprocesses.length; j++) {
            if(lprocesses[idx].arrival > lprocesses[j].arrival) {
                idx = j;
            } else if(lprocesses[idx].arrival === lprocesses[j].arrival) {
                if(lprocesses[idx].name.localeCompare(lprocesses[j].name) > 0) {
                    idx = j;
                }
            }
        }
        let tmp = lprocesses[i];
        lprocesses[i] = lprocesses[idx];
        lprocesses[idx] = tmp;
    }

    switch(algorithm) {
        case 'fifo':
            showResult(fifo(lprocesses));
            break;
        case 'srtn':
            showResult(srtn(lprocesses));
            break;
        case 'rr':
            showResult(roundrobin(lprocesses));
            break;
        case 'mlfq':
            showResult(mlfq(lprocesses));
            break;
    }
}

function showResult(sequence) {
    while(boxContainer.children.length !== 0) {
        boxContainer.removeChild(boxContainer.children[0]);
    }

    for(let i = 0; i < sequence.sequence.length; i++) {
        let proc = sequence.sequence[i].process;
        let div = document.createElement('div');
        let c = (proc === null) ? 'empty' : 'box';
        div.setAttribute('class', c);

        if(c !== 'empty') {
            div.innerHTML = `
                <span class="label">${proc.name}</span>
                <span class="start-time">${sequence.sequence[i].startTime}</span>
                <span class="end-time">${sequence.sequence[i].endTime}</span>
        `
        }
        boxContainer.appendChild(div);
    }
    fillTable(sequence);
}

function fillTable(sequence) {
    let table = document.querySelector('table');
    let processes = sequence.getProcesses();

    //clear table
    table.innerHTML =`<tr><th>Process</th><th>Response Time</th><th>Waiting Time</th><th>Turnaround Time</th></tr>`

    for(let i = 0; i < processes.length; i++) {
        let proc = processes[i];
        let turnaround = sequence.getTurnaroundTimeOfProcess(proc);
        let waiting = sequence.getWaitingTimeOfProcess(proc);
        let response = sequence.getResponseTimeOfProcess(proc)
        table.innerHTML += `
            <td>${processes[i].name}</td>
            <td>${response}</td>
            <td>${waiting}</td>
            <td>${turnaround}</td>
        `
    }
}