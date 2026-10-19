const DEFAULT_CONCURRENCY = 2;

type PoolTask<T> = {
  run: () => Promise<T>;
  priority: number;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
};

const queue: PoolTask<unknown>[] = [];
let activeCount = 0;

function taskPriority(isVideo: boolean): number {
  return isVideo ? 0 : 1;
}

function pump(): void {
  while (activeCount < DEFAULT_CONCURRENCY && queue.length > 0) {
    queue.sort((a, b) => b.priority - a.priority);
    const task = queue.shift();
    if (!task) {
      return;
    }
    activeCount += 1;
    void task
      .run()
      .then(task.resolve, task.reject)
      .finally(() => {
        activeCount -= 1;
        pump();
      });
  }
}

export function runWhatsappMediaFetchPool<T>(
  isVideo: boolean,
  run: () => Promise<T>,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    queue.push({
      run,
      priority: taskPriority(isVideo),
      resolve: resolve as (value: unknown) => void,
      reject,
    });
    pump();
  });
}

/** Test helper */
export function clearWhatsappMediaFetchPool(): void {
  queue.length = 0;
  activeCount = 0;
}
