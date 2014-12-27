function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function brain_forward(brain, array_with_num_inputs_numbers, num_actions) {
    window.performance.mark('mark_start_brain_forward_' + num_actions);

    var action = brain.forward(array_with_num_inputs_numbers);

    window.performance.mark('mark_stop_brain_forward_' + num_actions);
    window.performance.measure('measure_time_brain_forward_' + num_actions, 'mark_start_brain_forward_' + num_actions, 'mark_stop_brain_forward_' + num_actions);
    window.performance.clearMarks('mark_start_brain_forward_' + num_actions);
    window.performance.clearMarks('mark_stop_brain_forward_' + num_actions);

    return action;
}

function brain_backward(brain, reward, num_actions) {
    window.performance.mark('mark_start_brain_backward_' + num_actions);

    brain.backward(reward); // <-- learning magic happens here

    window.performance.mark('mark_stop_brain_backward_' + num_actions);
    window.performance.measure('measure_time_brain_backward_' + num_actions, 'mark_start_brain_backward_' + num_actions, 'mark_stop_brain_backward_' + num_actions);
    window.performance.clearMarks('mark_start_brain_backward_' + num_actions);
    window.performance.clearMarks('mark_stop_brain_backward_' + num_actions);
}

function saveAverageTime(turn, average_times, num_actions) {
    var forward_time_objects = window.performance.getEntriesByName('measure_time_brain_forward_' + num_actions);
    var backward_time_objects = window.performance.getEntriesByName('measure_time_brain_backward_' + num_actions);

    var forward_times = forward_time_objects.map(function(time_object) { return time_object.duration; });
    var backward_times = backward_time_objects.map(function(time_object) { return time_object.duration; });

    var forward_times_sum = forward_times.reduce(function(previousValue, currentValue) { return previousValue + currentValue; });
    var backward_times_sum = backward_times.reduce(function(previousValue, currentValue) { return previousValue + currentValue; });

    var forward_times_average = forward_times_sum / forward_times.length;
    var backward_times_average = backward_times_sum / backward_times.length;

    console.log("[num_actions: " + num_actions + "][turn: " + turn + "] Saving forward/backward average times: " + forward_times_average + "," + backward_times_average);

    average_times['forward_times_for_' + num_actions + '_actions'].push(forward_times_average);
    average_times['backward_times_for_' + num_actions + '_actions'].push(backward_times_average);
}

function train_brain() {

    var MAX_NUM_PLAYERS = 16;
    var NUM_TURNS = 10000;
    var REWARD_GOOD_ACTION = 1;
    var PUNISH_BAD_ACTION = -2;

    var num_inputs = 81;
    var num_players;
    var average_times = {
        forward_times_for_8_actions: [],
        backward_times_for_8_actions: [],
        forward_times_for_16_actions: [],
        backward_times_for_16_actions: [],
        forward_times_for_32_actions: [],
        backward_times_for_32_actions: [],
        forward_times_for_64_actions: [],
        backward_times_for_64_actions: []
    }

    for (num_players = 2; num_players <= MAX_NUM_PLAYERS; num_players = num_players*2) {
        // Initialize brain if necessary
        var num_actions = 4 * num_players;

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

        for (turn=1; turn<=NUM_TURNS; turn++) {

            // initialize inputs to zeros
            array_with_num_inputs_numbers = array_with_num_inputs_numbers.map(function () {
                return 0;
            });
            // set some inputs to 1
            var numberOfPlayers = rand(1, num_players);
            var numOfP;
            while ((numOfP = array_with_num_inputs_numbers.filter(function (x) {
                return x == 1;
            }).length) != numberOfPlayers) {
                array_with_num_inputs_numbers[rand(0, num_inputs - 1)] = 1;
            }

            // Get action from brain
            action = brain_forward(brain, array_with_num_inputs_numbers, num_actions)

            // Calc. reward based on action validness
            isValidAction = action < (4 * numberOfPlayers);
            reward = isValidAction ? REWARD_GOOD_ACTION : PUNISH_BAD_ACTION;

            // Apply reward to brain
            brain_backward(brain, reward, num_actions); // <-- learning magic happens here

            if (turn % 1000 == 0) {
                saveAverageTime(turn, average_times, num_actions);
                window.performance.clearMeasures();
            }
        }

    }

    console.log("-------------------------------------------------------------------------------------");
    console.log("Average Forward Time & Backward Times");
    console.log("-------------------------------------------------------------------------------------");

    var result = "";
    result += "forward_8,backward_8,forward_16,backward_16,forward_32,backward_32,forward_64,backward_64\n";
    for (var i=0; i<NUM_TURNS / 1000; i++) {
        result += average_times['forward_times_for_8_actions'][i] + "," + average_times['backward_times_for_8_actions'][i] + ","
        result += average_times['forward_times_for_16_actions'][i] + "," + average_times['backward_times_for_16_actions'][i] + ","
        result += average_times['forward_times_for_32_actions'][i] + "," + average_times['backward_times_for_32_actions'][i] + ","
        result += average_times['forward_times_for_64_actions'][i] + "," + average_times['backward_times_for_64_actions'][i] + '\n';
    }
    console.log(result);

    window.performance.clearMeasures();
}
