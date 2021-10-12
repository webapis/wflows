
const { stateTableLog } = require('./state-table-log')
const EventEmitter = require('events');
const promiseEventTypes = {
    PROMISE_ATTACHED: 'PROMISE_ATTACHED',
    PROMISE_RESOLVED: 'PROMISE_RESOLVED',
    PROMISE_REJECTED: 'PROMISE_REJECTED',
    RUN_NEXT_PROMISE: 'RUN_NEXT_PROMISE',
    BATCH_NAME_REGISTERED: 'BATCH_NAME_REGISTERED',
    QUEUE_EMPTY: 'QUEUE_EMPTY'

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

        this.on(promiseEventTypes.PROMISE_ATTACHED, function (props) {
            const { unshift } = props
            this.total.push(props);
            if (unshift) {
                this.queue.unshift(props)

            }
            else {
                this.queue.push(props)


            }
            this.runNextPromise()


           

        });


        this.on(promiseEventTypes.PROMISE_RESOLVED, function (props) {
            const { uuid } = props

            this.resolved.push(props)

            const promiseToRemoveIndex = this.promises.findIndex(
                p => p.uuid === uuid
            );

            this.promises.splice(promiseToRemoveIndex, 1);
            stateTableLog({ self: this, props })
            this.runNextPromise()

        });

        this.on(promiseEventTypes.PROMISE_REJECTED, function (props) {
            const { uuid, batchName, retries } = props
            debugger;

            const promiseToRemoveIndex = this.promises.findIndex(
                p => p.uuid === uuid
            );
            this.promises.splice(promiseToRemoveIndex, 1);
            debugger;
        
            const allowedRetries = this.registeredBatchNames[batchName].retries
            debugger;
            if (retries > 0 && retries === allowedRetries) {
                debugger;
                this.rejected.push(props)
            } else {
                debugger;
                let increment = retries === 0 ? 1 : 1+retries
                debugger
                this.queue.push({ ...props, retry: true, retries: increment })
            }

            stateTableLog({ self: this, props })
            this.runNextPromise()
          

        });

    }//constructor

    runNextPromise() {
        if (this.queue.length === 0 && this.promises.length === 0) {
            this.emit(promiseEventTypes.QUEUE_EMPTY, {})
        }
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
             
                stateTableLog({ self: this, props: nextbatch })
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