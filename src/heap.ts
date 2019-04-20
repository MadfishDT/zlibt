import { USE_TYPEDARRAY } from './define/typedarray/hybrid';

export class Heap {
    
    public buffer: Uint16Array | Array<number>;
    public length: number;
    
    constructor(length: number) {
        this.buffer = new (USE_TYPEDARRAY ? Uint16Array : Array)(length * 2);
        this.length = 0;
    }

    public getParent(index: number) {
        return ((index - 2) / 4 | 0) * 2;
    };

    public getChild = function(index: number) {
        return 2 * index + 2;
    };

    public push(index: number, value: number) {
        let current, parent,
            heap = this.buffer,
            swap;
      
        current = this.length;
        heap[this.length++] = value;
        heap[this.length++] = index;
      
        while (current > 0) {
          parent = this.getParent(current);
      
          if (heap[current] > heap[parent]) {
            swap = heap[current];
            heap[current] = heap[parent];
            heap[parent] = swap;
      
            swap = heap[current + 1];
            heap[current + 1] = heap[parent + 1];
            heap[parent + 1] = swap;
      
            current = parent;
          } else {
            break;
          }
        }
        return this.length;
    }

    public pop() {
        let index, value,
            heap = this.buffer, swap,
            current, parent;
      
        value = heap[0];
        index = heap[1];
      
        this.length -= 2;
        heap[0] = heap[this.length];
        heap[1] = heap[this.length + 1];
      
        parent = 0;
        while (true) {
          current = this.getChild(parent);
      
          if (current >= this.length) {
            break;
          }
      
          if (current + 2 < this.length && heap[current + 2] > heap[current]) {
            current += 2;
          }
      
          if (heap[current] > heap[parent]) {
            swap = heap[parent];
            heap[parent] = heap[current];
            heap[current] = swap;
      
            swap = heap[parent + 1];
            heap[parent + 1] = heap[current + 1];
            heap[current + 1] = swap;
          } else {
            break;
          }
      
          parent = current;
        }
        return {index: index, value: value, length: this.length};
    }
}
