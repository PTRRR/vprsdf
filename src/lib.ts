export function sdf(inFilled: boolean[], width: number): number[] {
  const height = Math.floor(inFilled.length / width);
  const halfVector: [number, number][] = new Array(inFilled.length).fill([
    2 * width + 1,
    2 * height + 1,
  ]);

  sdfPartial(inFilled, width, halfVector, euclidean, false);
  sdfPartial(inFilled, width, halfVector, euclidean, true);

  const out: number[] = new Array(inFilled.length);
  for (let i = 0; i < halfVector.length; i++) {
    const [dx, dy] = halfVector[i];
    out[i] = euclidean(dx, dy) / 2;
    if (inFilled[i]) {
      out[i] = -out[i];
    }
  }
  return out;
}

function euclidean(dx: number, dy: number): number {
  return Math.sqrt(dx * dx + dy * dy);
}

type Metric = (dx: number, dy: number) => number;

function sdfPartial(
  inFilled: boolean[],
  width: number,
  inHalfVector: [number, number][],
  metric: Metric,
  negate: boolean
) {
  if (width === 0) throw new Error("Width cannot be zero.");
  const height = Math.floor(inFilled.length / width);
  if (height === 0) throw new Error("Height cannot be zero.");

  const validPixel = (x: number, y: number): boolean =>
    x >= 0 && x < width && y >= 0 && y < height;
  const coord = (x: number, y: number): number => x + width * y;
  const filled = (x: number, y: number): boolean =>
    validPixel(x, y) ? inFilled[coord(x, y)] !== negate : negate;

  const doNeighbors = (
    x: number,
    y: number,
    f: (x: number, y: number) => void
  ): void => {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (validPixel(x + dx, y + dy)) {
          f(x + dx, y + dy);
        }
      }
    }
  };

  const halfVector = inHalfVector;
  const closed: boolean[] = new Array(inFilled.length).fill(false);

  interface QueueElement {
    x: number;
    y: number;
    dx: number;
    dy: number;
    dist: number;
  }

  class QueueCompare {
    compare(a: QueueElement, b: QueueElement): boolean {
      return a.dist > b.dist;
    }
  }

  const pq: PriorityQueue<QueueElement> = new PriorityQueue<QueueElement>(
    new QueueCompare().compare
  );

  const addToQueue = (x: number, y: number, dx: number, dy: number): void => {
    pq.push({ x, y, dx, dy, dist: metric(dx, dy) });
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (filled(x, y)) {
        doNeighbors(x, y, (x2, y2) => {
          if (!filled(x2, y2)) {
            addToQueue(x2, y2, x2 - x, y2 - y);
          }
        });
      }
    }
  }

  while (!pq.isEmpty()) {
    const current = pq.pop()!;
    if (closed[coord(current.x, current.y)]) continue;

    closed[coord(current.x, current.y)] = true;
    halfVector[coord(current.x, current.y)] = [current.dx, current.dy];

    doNeighbors(current.x, current.y, (x2, y2) => {
      if (!filled(x2, y2) && !closed[coord(x2, y2)]) {
        let dx = 2 * (x2 - current.x);
        let dy = 2 * (y2 - current.y);
        const [ddx, ddy] = halfVector[coord(current.x, current.y)];
        dx += ddx;
        dy += ddy;
        addToQueue(x2, y2, dx, dy);
      }
    });
  }
}

// PriorityQueue implementation
class PriorityQueue<T> {
  private heap: T[] = [];
  private compare: (a: T, b: T) => boolean;

  constructor(compare: (a: T, b: T) => boolean) {
    this.compare = compare;
  }

  push(item: T): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    const top = this.heap[0];
    const bottom = this.heap.pop();
    if (this.heap.length > 0 && bottom !== undefined) {
      this.heap[0] = bottom;
      this.sinkDown(0);
    }
    return top;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private bubbleUp(index: number): void {
    const element = this.heap[index];
    while (index > 0) {
      const parentIndex = Math.floor((index + 1) / 2) - 1;
      const parent = this.heap[parentIndex];
      if (this.compare(element, parent)) break;
      this.heap[index] = parent;
      index = parentIndex;
    }
    this.heap[index] = element;
  }

  private sinkDown(index: number): void {
    const length = this.heap.length;
    const element = this.heap[index];
    while (true) {
      let swap: number | null = null;
      const leftIndex = 2 * (index + 1) - 1;
      const rightIndex = 2 * (index + 1);
      if (leftIndex < length) {
        const left = this.heap[leftIndex];
        if (!this.compare(left, element)) {
          swap = leftIndex;
        }
      }
      if (rightIndex < length) {
        const right = this.heap[rightIndex];
        if (
          !this.compare(right, swap === null ? element : this.heap[leftIndex])
        ) {
          swap = rightIndex;
        }
      }
      if (swap === null) break;
      this.heap[index] = this.heap[swap];
      index = swap;
    }
    this.heap[index] = element;
  }
}
