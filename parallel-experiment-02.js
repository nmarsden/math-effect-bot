

var experiment_01_data= {
    threadId: 0,
    result: 10
};

function startExperiment() {
    console.log("***********************************************");
    console.log("*** Parallel Experiment 02                  ***");
    console.log("***********************************************");

    startThreads(experiment_01_data.result);
}

function rand(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

function job(n) {
    return {
        threadId: n,
        result: global.env.sharedData + rand(1, 100)
    }
}

function bestResult(d) {
    return (d[0].result > d[1].result) ? d[0] : d[1];
}

function log(d) {
    console.log("threadId:" + d.threadId + ", result:" + d.result);
    experiment_01_data = d;
    if (d.result < 1000) {
        setTimeout(startThreadsFunction(d.result), 10);
    }
}

function startThreadsFunction(startValue) {
    return function () { startThreads(startValue); };
}

function startThreads(startValue) {
    var data = [0,1,2,3,4,5,6,7];

    var p = new Parallel(data, {
        maxWorkers: 8,
        env: {
            sharedData: startValue
        }
    });

    p.require(rand).map(job).reduce(bestResult).then(log);
}