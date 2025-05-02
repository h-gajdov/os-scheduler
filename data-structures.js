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
    }

    push(node) {
        this.sequence.push(node)
    }

    peek() {
        return this.sequence[this.sequence.length - 1];
    }

    print() {
        for(let i = 0; i < this.sequence.length; i++) {
            this.sequence[i].print();
        }
    }
}