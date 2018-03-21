import { Observable, Subject } from "rxjs";

export interface ITaskOptions {
    concurrency?: number;
    interval?: number;
}


export interface IEventData {
    taskName: string;
    data?: any;
    error?: any;
}

export interface IEmpty {
    taskName: string;
    status: boolean;
}

interface IHandlerMap { [taskName: string]: (task) => Promise<any>; }
interface ITaskOptionsMap { [taskName: string]: ITaskOptions; }
interface ICountersMap { [taskName: string]: number; }
interface IRunningMap { [taskName: string]: boolean; }
interface IStartedMap { [taskName: string]: number; }
interface ITaskEntryMap {
    data: any;
    resolve?: (...args: any[]) => any| void;
    reject?: (err: any) => any| void;
}
interface ITaskMap { [taskName: string]: ITaskEntryMap[]; }


const delayed = new Subject<string>();
const empty = new Subject<IEmpty>();
const failed = new Subject<IEventData>();
const success = new Subject<IEventData>();
const finished = new Subject<IEventData>();
const started = new Subject<IEventData>();
const running = new Subject<string>();
const maxReached = new Subject<string>();

/**
 * Usage
 * taskQManager.defineTask('syncOperation', (task) => {
 *       return new Promise((res, rej) => {
 *           setTimeout(() => {                    
 *               res(task.c.toUpperCase());
 *           }, 300);
 *       });
 *   });
 *
 *   taskQManager.onEmpty.subscribe((empty: IEmpty) => {
 *       if (empty.status) {
 *           console.log(`${empty.taskName} is empty now`);
 *       } else {
 *           console.log(`${empty.taskName} NOT empty`);
 *       }
 *   });
 *   taskQManager.onRunning.subscribe(task => {
 *       console.log(`Running ${task} `);
 *   });
 *
 *    taskQManager.addToTask('syncOperation', {c: 'i'}).then(val => console.log(val));
 *   taskQManager.addToTask('syncOperation', {c: 'i'}).then(val => console.log(val));
 *   taskQManager.addToTask('syncOperation', {c: 'n'}).then(val => console.log(val));
 *   console.log(`Pending data`, taskQManager.getPendingTaskData('syncOperation'));
 *   setTimeout(() => {
 *       console.log(`Pending data`, taskQManager.getPendingTaskData('syncOperation'));
 *       taskQManager.addToTask('syncOperation', {c: 'd'}).then(val => console.log(val));
 *       taskQManager.addToTask('syncOperation', {c: 'i'}).then(val => console.log(val));
 *       console.log(`Pending data`, taskQManager.getPendingTaskData('syncOperation'));
 *   }, 1000);
 *   
 *
 *   setTimeout(() => {
 *       console.log(`Pending data`, taskQManager.getPendingTaskData('syncOperation'));
 *       taskQManager.addToTask('syncOperation', {c: 'a'}).then(val => console.log(val));
 *       console.log(`Pending data`, taskQManager.getPendingTaskData('syncOperation'));
 *   }, 3000);
 *   
 *   setTimeout(() => console.log('Ended after 30 seconds'), 4000);
 */
class TaskQ {

    private handlers: IHandlerMap = {};
    private taskOptions: ITaskOptionsMap = {};
    private counters: ICountersMap = {};
    private running: IRunningMap = {};
    private starts: IStartedMap = {};
    private tasks: ITaskMap = {};
    private pendingTasksData: ITaskMap = {};

    public defineTask(taskName: string, handler: (task: any) => Promise<any>, options: ITaskOptions = { concurrency: Infinity, interval: 0}): void {
        this.handlers[taskName] = handler;
        this.taskOptions[taskName] = options;
        this.counters[taskName] = 0;
        this.running[taskName] = false;
    }

    public addToTask(taskName: string, taskData: any): Promise<any> {
        if (this.pendingTasksData[taskName] === undefined) {
            this.pendingTasksData[taskName] = [];
        }
        this.pendingTasksData[taskName].push({data: taskData});
        
        return Promise.resolve()
        .then(() => {
            if (!this.handlers[taskName]) {
                throw new Error(`Attempted to add to an undefined task -> ${taskName}`);
            }

            let resolve;
            let reject;
            const promise = new Promise((res, rej) => {
                resolve = res;
                reject = rej;
            });
            if (this.tasks[taskName] === undefined) {
                this.tasks[taskName] = [];
            }
            
            empty.next({ taskName, status: false });
            this.tasks[taskName].push({
                data: taskData,
                reject,
                resolve
            });
            
            this.tryRun(taskName);
            return promise;
        });
    }

    public getPendingTaskData(taskName: string): any[] {
        return this.pendingTasksData[taskName].map(it => it.data);
    }

    public get onDelayed(): Observable<string> {
        return delayed.asObservable();
    }

    public get onEmpty(): Observable<IEmpty> {
        return empty.asObservable();
    }

    public get onFailed(): Observable<IEventData> {
        return failed.asObservable();
    }

    public get onSuccess(): Observable<IEventData> {
        return success.asObservable();
    }

    public get onFinished(): Observable<IEventData> {
        return finished.asObservable();
    }

    public get onStarted(): Observable<IEventData> {
        return started.asObservable();
    }
    public get onRunning(): Observable<string> {
        return running.asObservable();
    }

    public get onMaxReached(): Observable<string> {
        return maxReached.asObservable();
    }

    public cancelPending(taskName: string): any[] {
        const pendingOnes = (this.pendingTasksData[taskName] || []).map(it => it.data);
        this.pendingTasksData[taskName] = [];
        this.tasks[taskName] = [];
        this.running[taskName] = false;
        return pendingOnes;
    }

    private tryRun(taskName: string): void {
        const maxTasks = this.taskOptions[taskName].concurrency;
        const waitTime = this.remainingInterval(taskName);
        if (this.tasks[taskName].length > 0) {
			if (waitTime <= 0) {
				if (this.counters[taskName] < maxTasks) {
					if (this.running[taskName] === false) {
						this.markQueueRunning(taskName);
					}					
					this.runTask(taskName);
				} else {
                    maxReached.next(taskName);
				}
			} else {
                delayed.next(taskName);
				
				setTimeout(() => {
					this.tryRun(taskName);
				}, waitTime);
			}
		} else {
			if (this.running[taskName] === true) {
				this.markEmpty(taskName);
			}
		}
    }

    private runTask(taskName: string): void {
        const task = this.tasks[taskName].shift();
        const waitTime = this.remainingInterval(taskName);
        if (task) {        
            this.markStarted(taskName, task);
            
            this.handlers[taskName](task.data)
            .then(result => {
                this.markSuccess(taskName, task);
                this.pendingTasksData[taskName] = this.pendingTasksData[taskName].filter(it => it.data !== task.data);
                task.resolve(result);
                return true;
            })
            .catch(e => {
                this.markFailed(taskName, task, e);
                this.pendingTasksData[taskName] = this.pendingTasksData[taskName].filter(it => it.data !== task.data);
                task.reject(e);
            })
            .then(() => this.runTask(taskName));   
        } else {
            setTimeout(() => {
                this.tryRun(taskName);
            }, waitTime);
        }    
    }

    private remainingInterval(taskName: string): number {
		const taskInterval = this.taskOptions[taskName].interval * 1000;
		const lastTask = this.starts[taskName] || 0;		
		return (lastTask + taskInterval) - Date.now();
    }
    
    private markQueueRunning(taskName: string): void {
        running.next(taskName);
		this.running[taskName] = true;
    }
    
    private markEmpty(taskName: string): void {
        empty.next({taskName, status: true});
		this.running[taskName] = false;
    }
    
    private markStarted(taskName: string, task: any): void {
		this.counters[taskName] += 1;
		this.starts[taskName] = Date.now();        
        started.next({ data: task.data, taskName});
	}
	
	private markFinished(taskName: string, task: any): void {
		this.counters[taskName] -= 1;
        finished.next({data: task.data, taskName});
	}
	
	private markSuccess(taskName: string, task: any): void {
		this.markFinished(taskName, task);
        success.next({data: task.data, taskName});
	}
	
	private markFailed(taskName: string, task: any, error: any): void {
		this.markFinished(taskName, task);
        failed.next({data: task.data, error, taskName});
	}

}

export const taskQManager = new TaskQ();