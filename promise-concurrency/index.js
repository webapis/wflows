
const EventEmitter = require('events');
const promiseEventTypes = {
    PROMISE_ATTACHED: 'PROMISE_ATTACHED',
    PROMISE_RESOLVED: 'PROMISE_RESOLVED',
    PROMISE_REJECTED: 'PROMISE_REJECTED',
    RUN_NEXT_PROMISE: 'RUN_NEXT_PROMISE',
    BATCH_NAME_REGISTERED: 'BATCH_NAME_REGISTERED',
    PROMISE_POOL_EMPTY: 'PROMISE_POOL_EMPTY'

}
class PromiseEmitter extends EventEmitter {
    constructor(taskName) {
        super();

        this.queue = [];
        this.promises = [];
        this.rejected = [];
        this.resolved = [];
        this.total = [];
        this.taskName = taskName
        this.sync = false;

        this.registeredBatchNames = {};

        this.on(promiseEventTypes.BATCH_NAME_REGISTERED, function ({ batchName, concurrencyLimit, retries }) {

            this.registeredBatchNames = { ... this.registeredBatchNames, [batchName]: { batchName, concurrencyLimit, retries } }

        });

        this.on(promiseEventTypes.PROMISE_ATTACHED, function ({ batchName, uuid, props, unshift, retry, retries, sync }) {

            if (unshift) {
                this.queue.unshift({ batchName, uuid, props, retries, retry ,unshift,sync})
             
            }
            else {
                this.queue.push({ batchName, uuid, props, retries, retry,unshift,sync })
               

            }
           this.runNextPromise()
       

         //   this.emit(promiseEventTypes.PROMISE_POOL_EMPTY, { batchName })

        });


        this.on(promiseEventTypes.PROMISE_RESOLVED, function ({ batchName, props, uuid }) {

            this.resolved.push({ batchName, uuid, props })
            
            this.runNextPromise()
          
        });

        this.on(promiseEventTypes.PROMISE_REJECTED, function ({ batchName, props, unshift = false, uuid, error }) {

            //retry is not available
            this.rejected.push({ batchName, uuid, props, error })
            this.runNextPromise()
           // this.emit(promiseEventTypes.RUN_NEXT_PROMISE, { batchName, props, uuid, unshift: false })
           // this.emit(promiseEventTypes.PROMISE_POOL_EMPTY, { batchName })
            //retry is abalable
          
        });

    }//constructor

    runNextPromise(){
        for (let i = 0; i < this.queue.length; i++) {
            const { batchName } = this.queue[i]
         
            const batchCounter = this.promises.length === 0 ? 0 : this.promises.filter(f => f.batchName === batchName).length;
            const registeredBachCounter = this.registeredBatchNames[batchName].concurrencyLimit
         
            const freeBatchSpaces = registeredBachCounter - batchCounter;

            if (freeBatchSpaces > 0 && this.sync === false) {
              
                const nextbatch = this.queue[i];
                const { sync } = nextbatch;
                this.sync = sync

                this.promises.push(nextbatch);

                const queueToRemoveIndex = this.queue.findIndex(
                    p => p.uuid === nextbatch.uuid
                );

                this.queue.splice(queueToRemoveIndex, 1);
                //stateTableLog({ self: this, promise: nextpromise })
         debugger;
                this.emit(promiseEventTypes.RUN_NEXT_PROMISE, nextbatch)
            } else {
             
                continue;
            }
        }
    }

}



function promiseConcurrency({ taskName }) {

    const promiseEmitter = new PromiseEmitter();
    global[`${taskName}_eventEmitter`] = promiseEmitter
    promiseEmitter.setMaxListeners(50);
    return promiseEmitter;

}

module.exports = { promiseConcurrency, promiseEventTypes }