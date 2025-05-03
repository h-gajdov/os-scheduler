class Queue {
    constructor() {
        this.arr = []
    }

    isEmpty() {
        return this.arr.length === 0;
    }

    removeEmpty() {
        for(let i = 0; i < this.arr.length; i++) {
            if(this.arr[i].time === 0) {
                if(this.next === this.arr[i]) this.next = null;
                this.arr.splice(i, 1);
            }
        }
    }
}

class FIFOQueue extends Queue {
    constructor() {
        super();
    }

    enqueue(process) {
        this.arr.push(process);
    }

    execute() {
        if(this.isEmpty()) return null;
        return this.arr[0];
    }
}

class SRTNQueue extends Queue {
    constructor() {
        super();
    }

    enqueue(process) {
        this.arr.push(process);
    }

    execute(prev) {
        if(this.isEmpty()) return null;

        let result = (prev !== null) ? prev : this.arr[0];
        for(let i = 0; i < this.arr.length; i++) {
            if(prev !== null && prev.time === this.arr[i].time) continue;

            if(result.time > this.arr[i].time) {
                result = this.arr[i];
            } else if(result.time === this.arr[i].time && result.name.localeCompare(this.arr[i].name) > 0) {
                result = this.arr[i];
            }
        }
        return result;
    }
}

class RRQueue extends Queue {
    constructor() {
        super();
        this.next = null;
        this.looped = false;
    }

    enqueue(process) {
        if(this.next == null) this.next = process;
        else if(this.arr[0] === this.next && this.looped) this.next = process;
        this.arr.push(process);
        this.looped = false;
    }

    execute(pop) {
        let result = this.next;

        let idx = this.arr.indexOf(this.next);
        this.next = this.arr[(idx + 1) % this.arr.length];
        if((idx + 1) % this.arr.length === 0) this.looped = true;

        if(pop) {
            if(this.next === this.arr[idx]) this.next = null;
            this.arr.splice(idx, 1);
        }

        return result;
    }

    removeEmpty() {
        for(let i = 0; i < this.arr.length; i++) {
            if(this.arr[i].time === 0) {
                if(this.next === this.arr[i]) this.next = null;
                this.arr.splice(i, 1);
            }
        }
        if(this.arr.length === 0) this.looped = false;
    }

    isEmpty() {
        return this.arr.length === 0;
    }
}

class SequenceNode {
    constructor(process, startTime, endTime) {
        this.process = process;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    executionTime() {
        return this.endTime - this.startTime;
    }

    print() {
        if(this.process != null)
            console.log(`${this.process.name}(${this.startTime} - ${this.endTime})`)
        else
            console.log(`(${this.startTime} - ${this.endTime})`)
    }
}

class Sequence {
    constructor() {
        this.sequence = [];
        this.hash = new Map();
    }

    push(node) {
        this.sequence.push(node)
        if(!this.hash.has(node.process)) {
            this.hash.set(node.process, []);
        }
        this.hash.get(node.process).push(node);
    }

    peek() {
        return this.sequence[this.sequence.length - 1];
    }

    getProcesses() {
        let set = new Set();
        for(let i = 0; i < this.sequence.length; i++) {
            if(this.sequence[i].process == null) continue;
            set.add(this.sequence[i].process);
        }
        return Array.from(set);
    }

    getResponseTimeOfProcess(process) {
        return this.hash.get(process)[0].startTime - process.arrival;
    }

    getSequenceExecutingAtTime(time) {
        for(let i = 0; i < this.sequence.length; i++) {
            if(time >= this.sequence[i].startTime && time <= this.sequence[i].endTime) {
                return this.sequence[i];
            }
        }
    }

    getWaitingTimeOfProcess(process) {
        let sequences = this.hash.get(process);
        let result = 0;

        let initial = process.arrival;
        let atTime = this.getSequenceExecutingAtTime(initial);
        if(atTime.process !== process) {
            result += sequences[0].startTime - initial;
        }

        for(let i = 0; i < sequences.length - 1; i++) {
            result += sequences[i + 1].startTime - sequences[i].endTime;
        }
        return result;
    }

    getTurnaroundTimeOfProcess(process) {
        let arrival = process.arrival;
        let sequences = this.hash.get(process);
        let lastAppearance = sequences[sequences.length - 1];
        return lastAppearance.endTime - arrival;
    }

    print() {
        for(let i = 0; i < this.sequence.length; i++) {
            this.sequence[i].print();
        }
    }
}