const algorithmSelect = document.getElementById('dropdown-algorithm');
const processes = document.getElementById('processes');
const tarrival = document.getElementById('tarrival');
const texecution = document.getElementById('texecution');
const resultContainer = document.getElementById('result-container');
const boxContainer = document.getElementById('box-container');

function fifo(processes) {
    let arr = [];
    let time = 0;
    let sequence = new Sequence();
    let nowExecuting = null;

    while(processes.length !== 0) {
        for(let i = 0; i < processes.length; i++) {
            if(time === processes[i].arrival) {
                arr.push(processes[i])
            }
        }

        if(arr.length === 0) {
            let lastSeq = sequence.peek();
            if(lastSeq == null || lastSeq.process == null)
                sequence.push(new SequenceNode(null, time, time));
            sequence.peek().endTime++;

            time++;
            continue;
        }

        if(nowExecuting == null || arr[0] !== nowExecuting) {
            nowExecuting = arr[0];
            sequence.push(new SequenceNode(nowExecuting, time, time));
        }

        sequence.peek().endTime++;
        nowExecuting.time--;
        if(nowExecuting.time === 0) {
            arr.shift();
            processes.shift();
        }

        time++;
    }

    return sequence;
} 

function srtn(processes) {
    let arr = [];
    let time = 0;
    let sequence = new Sequence();
    let nowExecuting = null;

    while(processes.length !== 0) {
        for(let i = 0; i < processes.length; i++) {
            if(time === processes[i].arrival) {
                arr.push(processes[i])
            }
        }

        if(arr.length === 0) {
            let lastSeq = sequence.peek();
            if(lastSeq == null || lastSeq.process == null)
                sequence.push(new SequenceNode(null, time, time));
            sequence.peek().endTime++;

            time++;
            continue;
        }

        let min = arr[0];
        for(let i = 1; i < arr.length; i++) {
            if(min.time > processes[i].time) {
                min = arr[i];
            }
        }

        if(nowExecuting == null || min !== nowExecuting) {
            nowExecuting = min;
            sequence.push(new SequenceNode(nowExecuting, time, time));
        }

        sequence.peek().endTime++;
        nowExecuting.time--;
        if(nowExecuting.time === 0) {
            let i1 = arr.indexOf(nowExecuting);
            let i2 = processes.indexOf(nowExecuting);
            if(i1 !== -1) arr.splice(i1, 1)
            if(i2 !== -1) processes.splice(i1, 1)
        }

        time++;
    }

    return sequence;
}

function roundrobin(processes) {
    let arr = [];
    let q = 5;
    let time = 0;
    let sequence = new Sequence();
    let nowExecuting = null, next = null;

    while(processes.length !== 0) {
        for(let i = 0; i < processes.length; i++) {
            if(time === processes[i].arrival) {
                arr.push(processes[i]);
                if(arr.indexOf(next) === 0) {
                    next = arr[arr.length - 1];
                }
            }
        }

        if(arr.length === 0) {
            let lastSeq = sequence.peek();
            if(lastSeq == null || !next && lastSeq.process !== null)
                sequence.push(new SequenceNode(null, time, time));
            sequence.peek().endTime++;

            time++;
            continue;
        } else {
            if(next == null) next = arr[0];
        }

        if(nowExecuting == null || nowExecuting.time === 0 || sequence.peek() !== null && (sequence.peek().executionTime() === q)) {
            let newNext = (arr.indexOf(next) + 1) % arr.length;
            nowExecuting = next;
            sequence.push(new SequenceNode(nowExecuting, time, time));

            if(arr[newNext] === next) {
                next = null;
            } else {
                next = arr[newNext]
            }
        }

        sequence.peek().endTime++;
        if(nowExecuting) {
            nowExecuting.time--;
            if(nowExecuting.time === 0) {
                let i1 = arr.indexOf(nowExecuting);
                let i2 = processes.indexOf(nowExecuting);
                if(i1 !== -1) arr.splice(i1, 1);
                if(i2 !== -1) processes.splice(i1, 1);
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
                if(lprocesses[idx].name.localeCompare(lprocesses[idx].name < 0)) {
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
    console.log(sequence)
}