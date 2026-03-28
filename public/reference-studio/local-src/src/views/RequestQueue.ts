// src/views/RequestQueue.ts
// Minimal request queue to satisfy YouTube API rate-limiting requirements during build.

type QueuedTask<T> = () => Promise<T>;

class RequestQueue {
    private queue: QueuedTask<any>[] = [];
    private running = false;
    private concurrency = 1; // Default to serial execution for API safety

    public async add<T>(task: QueuedTask<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await task();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
            this.process();
        });
    }

    private async process() {
        if (this.running || this.queue.length === 0) return;
        this.running = true;

        while (this.queue.length > 0) {
            const task = this.queue.shift();
            if (task) {
                await task();
                // Optional delay to respect rate limits if needed
                // await new Promise(r => setTimeout(r, 100));
            }
        }

        this.running = false;
    }
}

export const ytApiQueue = new RequestQueue();
