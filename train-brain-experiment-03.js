function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function train_brain() {

    var NUM_PLAYER_UNITS = 2;
    var NUM_TURNS = 120000;
    var MAX_AVERAGE_REWARD = 0.9
    var AVERAGE_WINDOW_SIZE = 400;
    var REWARD_GOOD_ACTION = 1;
    var PUNISH_BAD_ACTION = -2;


    // Initialize brain if necessary
    var num_inputs = 81;   // 81 inputs in the range 0-1 to represent the position of player units on the board
    var num_actions = 4 * NUM_PLAYER_UNITS;  // 1 output in the range 0-7

//    var num_inputs = 81; // (9 x 9) inputs for board state, each in range 0-11
//    var num_actions = 80; // a number in the range 0-79 : that is 4 possible actions for one of 20 possible players

    var temporal_window = 1; // amount of temporal memory. 0 = agent lives in-the-moment :)
    var network_size = num_inputs * temporal_window + num_actions * temporal_window + num_inputs;

    // the value function network computes a value of taking any of the possible actions
    // given an input state. Here we specify one explicitly the hard way
    // but user could also equivalently instead use opt.hidden_layer_sizes = [20,20]
    // to just insert simple relu hidden layers.
    var layer_defs = [];
    layer_defs.push({type: 'input', out_sx: 1, out_sy: 1, out_depth: network_size});
    layer_defs.push({type: 'fc', num_neurons: 50, activation: 'relu'});
    layer_defs.push({type: 'fc', num_neurons: 50, activation: 'relu'});
    layer_defs.push({type: 'regression', num_neurons: num_actions});

    // options for the Temporal Difference learner that trains the above net
    // by backpropping the temporal difference learning rule.
    var tdtrainer_options = {learning_rate: 0.001, momentum: 0.0, batch_size: 64, l2_decay: 0.01};

    var opt = {};
    opt.temporal_window = temporal_window;
    opt.experience_size = 30000;
    opt.start_learn_threshold = 1000;
    opt.gamma = 0.7;
    opt.learning_steps_total = 200000;
    opt.learning_steps_burnin = 3000;
    opt.epsilon_min = 0.05;
    opt.epsilon_test_time = 0.05;
    opt.layer_defs = layer_defs;
    opt.tdtrainer_options = tdtrainer_options;

    var brain = new deepqlearn.Brain(num_inputs, num_actions, opt); // woohoo

    var array_with_num_inputs_numbers = new Array(num_inputs);
    var isValidAction;
    var action;
    var reward;
    var turn = 0;
    //var trackedRewards = [];
    var rewardsSum = 0;
    var rewardsOutput;
    var averageReward;
    var trackAverageRewards = [];
    var maxAverageRewardReached = false;


    window.performance.mark('mark_start_learning');


    console.log("Attempt # 33");
    console.log("-----------------------------------------------------------------------");
    console.log("*** Started Learning: upto max. average rewards reaches " + MAX_AVERAGE_REWARD + " ***");
    console.log("-----------------------------------------------------------------------");

    //debugger;
    window.performance.mark('mark_start_average_window');

    while (!maxAverageRewardReached) {

        //for (turn=0; turn<NUM_TURNS; turn++) {
        turn++;

        // initialize inputs to zeros
        array_with_num_inputs_numbers = array_with_num_inputs_numbers.map(function() { return 0; });
        // set some inputs to 1
        var numberOfPlayers = rand(1, NUM_PLAYER_UNITS);
        var numOfP;
        while ((numOfP = array_with_num_inputs_numbers.filter(function (x) {
            return x == 1;
        }).length) != numberOfPlayers) {
            array_with_num_inputs_numbers[rand(0, num_inputs - 1)] = 1;
        }

        // Get action from brain
        action = brain.forward(array_with_num_inputs_numbers);

        // check if action is valid for input
        isValidAction = action < (4 * numberOfPlayers);

        reward = isValidAction ? REWARD_GOOD_ACTION : PUNISH_BAD_ACTION;

        // track reward
        //trackedRewards.push(reward);
        rewardsSum += reward;

        brain.backward(reward); // <-- learning magic happens here

        if (turn % AVERAGE_WINDOW_SIZE == 0) {
            window.performance.mark('mark_stop_average_window');
            window.performance.measure('measure_average_window_time', 'mark_start_average_window', 'mark_stop_average_window');
            var window_time = window.performance.getEntriesByName('measure_average_window_time');

            window.performance.clearMarks('mark_start_average_window');
            window.performance.clearMarks('mark_stop_average_window');
            window.performance.clearMeasures('measure_average_window_time');

            window.performance.mark('mark_start_average_window');

            // Track average reward for AVERAGE_WINDOW_SIZE iterations
            averageReward = rewardsSum / AVERAGE_WINDOW_SIZE;
            //averageReward = trackedRewards.reduce(function(a, b) { return a + b }) / AVERAGE_WINDOW_SIZE;
            // averageReward = trackedRewards.slice(-AVERAGE_WINDOW_SIZE).reduce(function(a, b) { return a + b }) / AVERAGE_WINDOW_SIZE;


            trackAverageRewards.push(averageReward);

            // Reset trackedRewards
            //trackedRewards = [];
            rewardsSum = 0;

            // output progress
            console.log("# iterations done: " + turn + ", average Reward: " + averageReward + " [time taken: " + window_time[0].duration + "]");

            if (averageReward > MAX_AVERAGE_REWARD) {
                maxAverageRewardReached = true;
            }
        }
    }

    window.performance.mark('mark_stop_learning');
    window.performance.measure('measure_learning_time', 'mark_start_learning', 'mark_stop_learning');


    //console.timeEnd(TIMER_NAME);

    // output reward values
//    console.log("---------------------------------");
//    console.log("*** Rewards for " + NUM_TURNS + " iterations ***");
//    console.log("---------------------------------");
//    rewardsOutput = "turn, reward\n";
//    for (turn=0; turn<NUM_TURNS; turn++) {
//        rewardsOutput += (turn+1) + "," + trackedRewards[turn] + "\n";
//    }
//    console.log(rewardsOutput);

    // output average reward values
    console.log("-------------------------------------------------------------------------------------");
    console.log("*** Average reward every " + AVERAGE_WINDOW_SIZE + ": Average reward reached " + averageReward + " ***");
    console.log("-------------------------------------------------------------------------------------");
    rewardsOutput = "iterations, average_reward\n";
    for (turn = 0; turn < trackAverageRewards.length; turn++) {
        rewardsOutput += ((turn + 1) * AVERAGE_WINDOW_SIZE) + "," + trackAverageRewards[turn] + "\n";
    }
    console.log(rewardsOutput);

    var learningTime = window.performance.getEntriesByType('measure');
    console.log("-------------------------------------------------------------------------------------");
    console.log("Learning Time (msecs) :" + learningTime[0].duration);
    console.log("-------------------------------------------------------------------------------------");

}
