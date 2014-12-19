TD.AI = function (game) {
    this.game = game;

    // -- State --
    this.turn = 0;
    this.totalIterations = 1;
    this.iterationStats = [];
    this.previousSelectedDirection = -1;
    this.checkForSpawnedEnemy = true;
    this.trackedEnemies = [];

    this.brain = null;

    // -- Constants --
    this.directions = ["up", "right", "down", "left"];
    this.oppositeDirections = ["down", "left", "up", "right"];
    this.oppositeDirectionIndexes = [2, 3, 0, 1];
    this.edgePosToMovesUntilEnemyKill = [3, 4, 5, 6, 7];
    this.enemySpawnPosToKillMove = [
        [null, 3, 3, 0, 3, 2, 3, 3, null],  // x = 0
        [0, null, null, null, null, null, null, null, 2],     // x = 1
        [0, null, null, null, null, null, null, null, 2],     // x = 2
        [3, null, null, null, null, null, null, null, 3],     // x = 3
        [0, null, null, null, null, null, null, null, 2],     // x = 4
        [1, null, null, null, null, null, null, null, 1],     // x = 5
        [0, null, null, null, null, null, null, null, 2],     // x = 6
        [0, null, null, null, null, null, null, null, 2],     // x = 7
        [null, 1, 1, 0, 1, 2, 1, 1, null]   // x = 8
    ];

    this.isAutoPlay = false;
    this.isTraining = false;

    this.startAutoPlay = function () {
        this.isAutoPlay = true;
        this.isTraining = false;
        this.autoPlay();
    };

    this.stopAutoPlay = function () {
        this.isAutoPlay = false;
    };

    this.autoPlay = function () {
        if (!this.isAutoPlay) {
            return;
        }

        if (this.game.running) {
            // -- Make a move --

            // *** Technique #1: Click first player button found ***
            // *** Best Result within 50 iterations: [turns: 11][kills: 2][points: 26]
            //$(".tdButton:visible").first().click();

            // *** Technique #2: Click random player's random button ***
            // *** Best Result within 50 iterations: [turns: 18][kills: 5][points: 51]
            //var playerButtons = $(".tdButton:visible");
            //var numberOfButtons = playerButtons.size();
            //var selectedButtonIndex = rand(0, numberOfButtons-1);
            //playerButtons[selectedButtonIndex].click();

            // *** Technique #3: Click player's random button and next move return the player to the center ***
            // *** Best Result within 50 iterations: [turns: 23][kills: 7][points: 81]
            //var playerButtons = $(".unit-1 .tdButton:visible");
            //if (playerButtons.size() == 0) {
            //    console.log("*** unit-1 not found!!!! ****");
            //    playerButtons = $(".tdButton:visible");
            //}
            //
            //var numberOfButtons = playerButtons.size();
            //var selectedButtonIndex;
            //if (previousSelectedDirection == -1) {
            //    selectedButtonIndex = rand(0, numberOfButtons - 1);
            //
            //    for (var i=0; i<directions.length; i++) {
            //        if ($(playerButtons.get(selectedButtonIndex)).hasClass("fa-arrow-circle-" + directions[i])) {
            //            previousSelectedDirection = i;
            //        }
            //    }
            //} else {
            //    var oppositeButtonSelector = ".fa-arrow-circle-" + oppositeDirections[previousSelectedDirection];
            //    playerButtons = playerButtons.filter(oppositeButtonSelector);
            //    selectedButtonIndex = 0;
            //    previousSelectedDirection = -1;
            //}
            //playerButtons[selectedButtonIndex].click();


            // *** Technique #4: Player moves to kill the enemy if possible, otherwise random move. Next move returns the player to the center ***
            // Every second turn determine both the direction and the turnNumber in the future the player will need to move in order to kill the newly spawned enemy
            // *** Best Result within 50 iterations: [turns: 26][kills: 9][points: 111]

            //if (checkForSpawnedEnemy) {
            //    checkForSpawnedEnemy = false;
            //
            //    // Find newly spawned enemy
            //    //var spawnedEnemy = $(".botUnit .unitPower:contains('1')").parent();
            //
            //    var spawnedPower = 1;
            //    var isBoss = false;
            //
            //    var spawnedEnemies = $(".botUnit .unitPower:contains('1')").parent().filter(function (){
            //        return $(this).css("left") == '0px' || $(this).css("left") == '512px' ||
            //               $(this).css("top") == '0px' || $(this).css("top") == '512px';
            //    });
            //
            //    // Find boss if spawned enemy with unitPower of 1 is not found
            //    if (spawnedEnemies.length == 0) {
            //        // Find boss
            //        spawnedEnemies = $(".boss").filter(function (){
            //            return $(this).css("left") == '0px' || $(this).css("left") == '512px' ||
            //                $(this).css("top") == '0px' || $(this).css("top") == '512px';
            //        });
            //        spawnedPower = parseInt(spawnedEnemies.children(".unitPower").text(), 10);
            //        isBoss = true;
            //    }
            //
            //    var spawnedEnemy = spawnedEnemies[0];
            //
            //    var enemyX = Math.floor(spawnedEnemy.offsetLeft / 64);
            //    var enemyY = Math.floor(spawnedEnemy.offsetTop / 64);
            //
            //    // Determine enemy edge position:  0,1,2,3, or 4 ? (where 0 = 'center' and 4 = 'corner')
            //    var enemyEdgePosition = 0;
            //
            //    if (enemyX == 0 || enemyX == 8) {
            //        enemyEdgePosition = (enemyY <= 4) ? (4 - enemyY) : (enemyY - 4);
            //    } else if (enemyY == 0 || enemyY == 8) {
            //        enemyEdgePosition = (enemyX <= 4) ? (4 - enemyX) : (enemyX - 4);
            //    } else {
            //        console.log("[turn:" + turn + "] *** Invalid Spawn Position: (" + enemyX + ", " + enemyY + ") ***");
            //    }
            //
            //    //console.log("Spawned Enemy Pos: (" + enemyX + ", " + enemyY + "), Enemy Edge Pos: " + enemyEdgePosition);
            //
            //    var movesUntilEnemyKill = edgePosToMovesUntilEnemyKill[enemyEdgePosition];  // 3,4,5,6, or 7 ?
            //    var killTurn = turn + movesUntilEnemyKill;
            //
            //    // Determine kill move: 0,1,2, or 3 ?
            //    var killMove = enemySpawnPosToKillMove[enemyX][enemyY];
            //
            //    //console.log("[turn:" + turn + "] Spawned Enemy Pos: (" + enemyX + ", " + enemyY + "), Kill Move: " + killMove);
            //
            //    // Determine unitId: eg.enemy with class 'unit-12' has a unitId of 12
            //    var unitId = $(spawnedEnemy).attr('class').match(/\bunit-(\d+)\b/)[1];
            //
            //    // Add new tracked enemy entry
            //    trackedEnemies.push({ unitId: unitId, spawnedPower: spawnedPower, spawnedTurn: turn, spawnedPosition: [enemyX, enemyY], isCorner: (enemyEdgePosition == 4), isBoss: isBoss, killTurn: killTurn, killMove: killMove });
            //} else {
            //    checkForSpawnedEnemy = true;
            //
            //    // Set killMove for bot spawned in the corner. Note: should have moved one square by now
            //    var trackedEnemyWithoutKillMove = trackedEnemies.filter(function(t) { return t.killMove == null; });
            //
            //    if (trackedEnemyWithoutKillMove.length == 1) {
            //        var enemySelector = ".unit-" + trackedEnemyWithoutKillMove[0].unitId;
            //        var enemy = $(enemySelector)[0];
            //        var x = Math.floor(enemy.offsetLeft / 64);
            //        var y = Math.floor(enemy.offsetTop / 64);
            //        var spawnedX = trackedEnemyWithoutKillMove[0].spawnedPosition[0];
            //        var spawnedY = trackedEnemyWithoutKillMove[0].spawnedPosition[1];
            //
            //        var cornerKillMove;
            //        if (spawnedX == 0 && spawnedY == 0) {
            //            cornerKillMove = (x == 1) ? 3 : 0;
            //        } else if (spawnedX == 0 && spawnedY == 8) {
            //            cornerKillMove = (x == 1) ? 3 : 2;
            //        } else if (spawnedX == 8 && spawnedY == 0) {
            //            cornerKillMove = (x == 7) ? 1 : 0;
            //        } else {
            //            cornerKillMove = (x == 7) ? 1 : 2;
            //        }
            //        trackedEnemyWithoutKillMove[0].killMove = cornerKillMove;
            //    }
            //}
            //
            //// Decide move
            //var playerButtons = $(".unit-1 .tdButton:visible");
            //if (playerButtons.size() == 0) {
            //    //console.log("[turn:" + turn + "] *** unit-1 not found!!!! ****");
            //    playerButtons = $(".tdButton:visible");
            //}
            //
            //var numberOfButtons = playerButtons.size();
            //var selectedButtonIndex;
            //if (previousSelectedDirection == -1) {
            //
            //    // Check if killTurn exists for current turn
            //    var enemiesToKill = trackedEnemies.filter(function(t) { return t.killTurn == turn; });
            //    var enemiesToKillInOneTurn = trackedEnemies.filter(function(t) { return t.killTurn == turn + 1; });
            //    var enemiesToKillInThreeTurns = trackedEnemies.filter(function(t) { return t.killTurn == (turn + 3); });
            //    if (enemiesToKill.length > 0 || enemiesToKillInOneTurn.length > 0) {
            //        // Select Kill Move button
            //        var killMove = (enemiesToKill.length > 0) ? enemiesToKill[0].killMove : enemiesToKillInOneTurn[0].killMove;
            //
            //        if (enemiesToKill.length > 0) {
            //            console.log("[turn:" + turn + "] *** Kill enemy entering base - killMove : " + killMove + " ***");
            //        } else {
            //            console.log("[turn:" + turn + "] *** Kill enemy next to base - killMove : " + killMove + " ***");
            //        }
            //
            //        var buttonSelector = ".fa-arrow-circle-" + directions[killMove];
            //        playerButtons = playerButtons.filter(buttonSelector);
            //        selectedButtonIndex = 0;
            //        previousSelectedDirection = killMove;
            //
            //    } else if (enemiesToKillInThreeTurns.length > 0) {
            //        // Prepare for future kill move in three turns by NOT moving in the direction opposite to the kill move
            //        var killMove = enemiesToKillInThreeTurns[0].killMove;
            //
            //        var oppositeKillMove = oppositeDirectionIndexes[killMove];
            //
            //        // Select Random Button excluding opposite kill move
            //        do {
            //            selectedButtonIndex = rand(0, numberOfButtons - 1);
            //
            //            for (var i = 0; i < directions.length; i++) {
            //                if ($(playerButtons.get(selectedButtonIndex)).hasClass("fa-arrow-circle-" + directions[i])) {
            //                    previousSelectedDirection = i;
            //                }
            //            }
            //        } while (previousSelectedDirection == oppositeKillMove);
            //
            //        console.log("[turn:" + turn + "] *** Kill Move in three turns: " + killMove + ", opposite kill move: " + oppositeKillMove + ", selected direction: " + previousSelectedDirection + " ***");
            //
            //    } else {
            //        // Select Random Button
            //        selectedButtonIndex = rand(0, numberOfButtons - 1);
            //
            //        for (var i = 0; i < directions.length; i++) {
            //            if ($(playerButtons.get(selectedButtonIndex)).hasClass("fa-arrow-circle-" + directions[i])) {
            //                previousSelectedDirection = i;
            //            }
            //        }
            //        console.log("[turn:" + turn + "] Selected random direction: " + previousSelectedDirection);
            //    }
            //} else {
            //    //console.log("[turn:" + turn + "] Returning to center with direction: " + oppositeDirectionIndexes[previousSelectedDirection]);
            //
            //    var oppositeButtonSelector = ".fa-arrow-circle-" + oppositeDirections[previousSelectedDirection];
            //    playerButtons = playerButtons.filter(oppositeButtonSelector);
            //    selectedButtonIndex = 0;
            //    previousSelectedDirection = -1;
            //}
            //
            //if (selectedButtonIndex > playerButtons.length - 1) {
            //    // This error can happen if two kill moves happen close together in the opposite direction
            //    console.log("[turn:" + turn + "] *** [Error: Selected Index is out of range!] playerButtons.length: " + playerButtons.length + ", selectedButtonIndex: " + selectedButtonIndex);
            //
            //    // Select Random Button to recover
            //    var playerButtons = $(".unit-1 .tdButton:visible");
            //    if (playerButtons.size() == 0) {
            //        //console.log("[turn:" + turn + "] *** unit-1 not found!!!! ****");
            //        playerButtons = $(".tdButton:visible");
            //    }
            //    numberOfButtons = playerButtons.size();
            //
            //    selectedButtonIndex = rand(0, numberOfButtons - 1);
            //
            //    for (var i = 0; i < directions.length; i++) {
            //        if ($(playerButtons.get(selectedButtonIndex)).hasClass("fa-arrow-circle-" + directions[i])) {
            //            previousSelectedDirection = i;
            //        }
            //    }
            //    console.log("[turn:" + turn + "] Recovery! Selected random direction: " + previousSelectedDirection);
            //}
            //
            ////console.log("[turn:" + turn + "] trackedEnemies.length: " + trackedEnemies.length, trackedEnemies);
            //
            //playerButtons[selectedButtonIndex].click();
            //
            //// Remove tracked enemies if their killTurn has passed
            //trackedEnemies = trackedEnemies.filter(function(t) { return t.killTurn != turn; });
            //
            //turn++;


            // *** Technique #5: Make a move without using the UI ***
            var playerUnits = [];
            for (var unitId in game.units) {
                var unit = game.units[unitId];
                if (unit.owner == 'player') {
                    playerUnits.push(unit);
                }
            }
            console.log("Number of player Units: " + playerUnits.length);

            // select random player
            var selectedPlayerUnit = playerUnits[rand(0, playerUnits.length - 1)];
            // change direction or select direction for selected player
            var newDirection = selectedPlayerUnit.active ? ((selectedPlayerUnit.direction + 1) % 4) : rand(0, 3);

            console.log("Changing direction of player with unitId '" + selectedPlayerUnit.unitId + "' from " + (selectedPlayerUnit.active ? selectedPlayerUnit.direction : 'inactive') + " to " + newDirection);

            // Move player
            this.game.userActionMoveUnit(selectedPlayerUnit.unitId, newDirection);


            // *** Technique #6: Reinforced Learning ***
            // *** Best Result within 50 iterations:
            //// Initialize brain if necessary
            //if (!brain) {
            //    var num_inputs = 81; // (9 x 9) inputs for board state, each in range 0-11
            //    var num_actions = 80; // a number in the range 0-79 : that is 4 possible actions for one of 20 possible players
            //    var temporal_window = 1; // amount of temporal memory. 0 = agent lives in-the-moment :)
            //    var network_size = num_inputs * temporal_window + num_actions * temporal_window + num_inputs;
            //
            //    // the value function network computes a value of taking any of the possible actions
            //    // given an input state. Here we specify one explicitly the hard way
            //    // but user could also equivalently instead use opt.hidden_layer_sizes = [20,20]
            //    // to just insert simple relu hidden layers.
            //    var layer_defs = [];
            //    layer_defs.push({type: 'input', out_sx: 1, out_sy: 1, out_depth: network_size});
            //    layer_defs.push({type: 'fc', num_neurons: 50, activation: 'relu'});
            //    layer_defs.push({type: 'fc', num_neurons: 50, activation: 'relu'});
            //    layer_defs.push({type: 'regression', num_neurons: num_actions});
            //
            //    // options for the Temporal Difference learner that trains the above net
            //    // by backpropping the temporal difference learning rule.
            //    var tdtrainer_options = {learning_rate: 0.001, momentum: 0.0, batch_size: 64, l2_decay: 0.01};
            //
            //    var opt = {};
            //    opt.temporal_window = temporal_window;
            //    opt.experience_size = 30000;
            //    opt.start_learn_threshold = 1000;
            //    opt.gamma = 0.7;
            //    opt.learning_steps_total = 200000;
            //    opt.learning_steps_burnin = 3000;
            //    opt.epsilon_min = 0.05;
            //    opt.epsilon_test_time = 0.05;
            //    opt.layer_defs = layer_defs;
            //    opt.tdtrainer_options = tdtrainer_options;
            //
            //    brain = new deepqlearn.Brain(num_inputs, num_actions, opt); // woohoo
            //}
            //
            //// TODO Determine game state
            //
            //// TODO If there is a previously saved game state
            //// TODO 1) Determine award for new game state compared to previously saved game state
            //// TODO 2) Apply reward to brain
            //// brain.backward(reward); // <-- learning magic happens here
            //
            //// TODO Save game state
            //
            //// TODO Calculate input for brain - 81 board states
            //
            //
            //// TODO Loop until valid action is chosen by brain
            //// TODO 1) Get proposed actions from brain using board states
            //// TODO 2) If invalid action, punish and goto step 1)
            ////var action = brain.forward(array_with_num_inputs_numbers);
            //
            //
            //// TODO Apply valid action to game
            //
            //turn++;


            setTimeout(this.autoPlay.bind(this), 1000);

        } else {
            // -- Game over --
            console.log("iteration# " + this.totalIterations + " [turns: " + this.turn + "][kills: " + this.game.statsKilledUnits + "][points: " + this.game.statsPoints + "]");
            console.log("-----------------------------------------------------------------------------------------------------------------");

            // Save iteration stats
            this.iterationStats.push({turns: this.turn, kills: this.game.statsKilledUnits, points: this.game.statsPoints});

            if (this.totalIterations == 50) {
                // Output 50 iteration status
                console.log("-------------------------------");
                console.log("*** Stats for 50 iterations ***");
                console.log("-------------------------------");
                var statsOutput = "turns, kills, points\n";
                for (var statNum = 0; statNum < this.iterationStats.length; statNum++) {
                    statsOutput += this.iterationStats[statNum].turns + "," + this.iterationStats[statNum].kills + "," + this.iterationStats[statNum].points + "\n";
                }
                console.log(statsOutput);

                // Reset iterations
                this.totalIterations = 0;
                this.iterationStats = [];
            }

            this.totalIterations++;

            // -- Reset State --
            this.turn = 0;
            this.previousSelectedDirection = -1;
            this.checkForSpawnedEnemy = true;
            this.trackedEnemies = [];

            // Restart game
            this.game.init();

            setTimeout(this.autoPlay.bind(this), 1000);
        }
    };

    this.startTraining = function () {
        this.isAutoPlay = false;
        this.isTraining = true;
        this.train();
    };

    this.stopTraining = function () {
        this.isTraining = false;
    };

    this.train = function () {
        if (!this.isTraining) {
            return;
        }

        if (this.game.running) {

            //console.log("training!!!!");

            // *** Make a random move without using the UI ***
            var playerUnits = [];
            for (var unitId in game.units) {
                var unit = game.units[unitId];
                if (unit.owner == 'player') {
                    playerUnits.push(unit);
                }
            }
            //console.log("Number of player Units: " + playerUnits.length);

            // select random player
            var selectedPlayerUnit = playerUnits[rand(0, playerUnits.length - 1)];
            // change direction or select direction for selected player
            var newDirection = selectedPlayerUnit.active ? ((selectedPlayerUnit.direction + 1) % 4) : rand(0, 3);

            //console.log("Changing direction of player with unitId '" + selectedPlayerUnit.unitId + "' from " + (selectedPlayerUnit.active ? selectedPlayerUnit.direction : 'inactive') + " to " + newDirection);

            // Move player
            this.game.userActionMoveUnit(selectedPlayerUnit.unitId, newDirection);

        } else {
            // -- Game over --
            console.log("training iteration# " + this.totalIterations + " [turns: " + this.turn + "][kills: " + this.game.statsKilledUnits + "][points: " + this.game.statsPoints + "]");
            //console.log("-----------------------------------------------------------------------------------------------------------------");

            // Save iteration stats
            this.iterationStats.push({turns: this.turn, kills: this.game.statsKilledUnits, points: this.game.statsPoints});

            if (this.totalIterations == 50) {
                // Output 50 iteration status
                console.log("----------------------------------------");
                console.log("*** Training Stats for 50 iterations ***");
                console.log("----------------------------------------");
                var statsOutput = "turns, kills, points\n";
                for (var statNum = 0; statNum < this.iterationStats.length; statNum++) {
                    statsOutput += this.iterationStats[statNum].turns + "," + this.iterationStats[statNum].kills + "," + this.iterationStats[statNum].points + "\n";
                }
                console.log(statsOutput);

                // Reset iterations
                this.totalIterations = 0;
                this.iterationStats = [];
            }

            this.totalIterations++;

            // -- Reset State --
            this.turn = 0;

            // Restart game
            this.game.init();
        }

    };
};