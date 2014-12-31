function startExperiment() {
    console.log("***********************************************");
    console.log("*** Parallel Experiment 01                  ***");
    console.log("***********************************************");

    console.log("num_threads, time_taken");

    for (var i=1; i<=30; i++) {
        setTimeout(timeThreadsFunction(i), i * 10000 );
    }
}

function timeThreadsFunction(numThreads) {
    return function() { timeThreads(numThreads); }
}

function timeThreads(numThreads) {
    var data;
    var i;
    var startTime;
    var p;

    function outputTimeTaken() {
        var finishTime = performance.now();
        console.log(numThreads + ", " + (finishTime - startTime));
    }

    function loop(n) {
        with({}); // attempt to disable javascript optimizations for this function

        for (var i = 0; i < 10000000; i++) {
            for (var j = 0; j < 10; j++) {
                n++;
            }
        }
        return n;
    };

    data = [];
    for (i = 0; i < numThreads; i++) {
        data.push(i);
    }
    p = new Parallel(data, { maxWorkers: 8 });

    startTime = performance.now();

    // Start threads
    p.map(loop).then(outputTimeTaken);
}