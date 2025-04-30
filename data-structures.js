class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class Queue {
    constructor() {
        this.front = null;  
        this.rear = null; 
        this.size = 0; 
    }
    enqueue(data) {
        const newNode = new Node(data);
        if (this.isEmpty()) {
            this.front = newNode;
            this.rear = newNode;
        } else {
            this.rear.next = newNode;
            this.rear = newNode;
        }
        this.size++;
    }
    dequeue() {
        if (this.isEmpty()) {
            return null; 
        }
        const removedNode = this.front;
        this.front = this.front.next;
        if (this.front === null) {
            this.rear = null;
        }
        this.size--;
        return removedNode.data;
    }
    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this.front.data;
    }
    isEmpty() {
        return this.size === 0;
    }
    getSize() {
        return this.size;
    }
    print() {
        let current = this.front;
        const elements = [];
        while (current) {
            elements.push(current.data);
            current = current.next;
        }
        console.log(elements.join(' -> '));
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