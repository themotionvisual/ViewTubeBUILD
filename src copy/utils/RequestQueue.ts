export interface QueueOptions {
    concurrency?: number;
    delayMs?: number;
    maxRetries?: number;
}

type Task<T> = () => Promise<T>;

export class RequestQueue {
    private concurrency: number;
    private delayMs: number;
    private maxRetries: number;

    private activeCount = 0;
    private queue: Array<{
        task: Task<any>;
        resolve: (val: any) => void;
        reject: (err: any) => void;
        retries: number;
    }> = [];

    constructor(options: QueueOptions = {}) {
        this.concurrency = options.concurrency || 2;
        this.delayMs = options.delayMs || 300;
        this.maxRetries = options.maxRetries || 3;
    }

    public add<T>(task: Task<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.queue.push({ task, resolve, reject, retries: 0 });
            this.processNext();
        });
    }

    private async processNext() {
        if (this.activeCount >= this.concurrency || this.queue.length === 0) {
            return;
        }

        const item = this.queue.shift();
        if (!item) return;

        this.activeCount++;

        try {
            const result = await item.task();
            item.resolve(result);
        } catch (error: any) {
            if (item.retries < this.maxRetries && this.isRetryable(error)) {
                console.warn(`[RequestQueue] Task failed, retrying (${item.retries + 1}/${this.maxRetries})...`, error);
                item.retries++;
                // Put it back at the front of the queue
                this.queue.unshift(item);
            } else {
                item.reject(error);
            }
        } finally {
            this.activeCount--;
            // Enforce pacing delay before launching the next task
            if (this.delayMs > 0) {
                setTimeout(() => this.processNext(), this.delayMs);
            } else {
                this.processNext();
            }
        }
    }

    private isRetryable(error: any): boolean {
        if (error?.status === 429 || error?.status >= 500) return true;
        const msg = error?.message?.toLowerCase() || '';
        if (msg.includes('rate limit')) return true;
        if (msg.includes('quota') || msg.includes('paid plan')) return false; // Hard fail
        return false;
    }
}

// Export standard pre-configured queues
export const ytApiQueue = new RequestQueue({ concurrency: 3, delayMs: 400 });
export const geminiQueue = new RequestQueue({ concurrency: 1, delayMs: 2000, maxRetries: 4 });