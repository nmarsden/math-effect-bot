/**
 * Created by Ilya Rubinchik (ilfate) on 12/09/14.
 */

function rand(min, max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}
function info(data)
{
    console.info(data);
}
function debug(data) {
    //info(data);
    // desabled
}
function isInt(n){
    return typeof n== "number" && isFinite(n) && n%1===0;
}

function TD () {

}
TD = new TD();

$(document).ready(function() {

    $('#modalHowUnitMoveButton').bind('click', function(){
        //var src = 'http://www.youtube.com/v/OlJ9VdY9dig&amp;autoplay=1';
        $("#modalHowUnitMove").modal({                    // wire up the actual modal functionality and show the dialog
                    "backdrop"  : "static",
                    "keyboard"  : true,
                    "show"      : true                     // ensure the modal is shown immediately
        });
        var theModal = '#modalHowUnitMove',
        videoSRC = $('#modalHowUnitMove iframe').attr( "data-video" ), 
        videoSRCauto = videoSRC+"?autoplay=1" ;
        $(theModal+' iframe').attr('src', videoSRCauto);
        $(theModal+' .youtube-stop').click(function () {
            $(theModal+' iframe').attr('src', videoSRC);
        });
        // if (!$('#modalHowUnitMove iframe').attr('src')) {
        //     $('#modalHowUnitMove iframe').attr('src', src);
        // }
    });

    // $('#modalHowUnitMove .youtube-stop').click(function () {
    //     $('#modalHowUnitMove iframe').removeAttr('src');
    // });

    var situation = false;
//       {'units' : [
//
//           {'x': 2, 'y': 3, 'd': 0, 'a':true, 'p': 3, 'o':'bot'},
//           {'x': 1, 'y': 6, 'd': 0, 'a':true, 'p': 5, 'o':'bot'},
//           {'x': 5, 'y': 1, 'd': 0, 'a':true, 'p': 2, 'o':'bot'},
//           {'x': 8, 'y': 6, 'd': 3, 'a':true, 'p': 1, 'o':'bot'},
//           {'x': 6, 'y': 5, 'd': 3, 'a':true, 'p': 17, 'o':'bot', 'b' : true},
//           {'x': 6, 'y': 2, 'd': 3, 'a':true, 'p': 25, 'o':'bot', 'b' : true},
//           {'x': 2, 'y': 2, 'd': 2, 'a':true, 'p': 4, 'o':'player'},
//           {'x': 3, 'y': 3, 'd': 3, 'a':true, 'p': 35, 'o':'player'},
//           {'x': 7, 'y': 1, 'd': 2, 'a':true, 'p': 8, 'o':'player'},
//           {'x': 6, 'y': 4, 'd': 1, 'a':true, 'p': 18, 'o':'player'},
//           {'x': 4, 'y': 4, 'd': 2, 'a':false, 'p': 1, 'o':'player'},
//           {'x': 4, 'y': 0, 'd': 2, 'a':false, 'p': 24, 'o':'player'},
//           {'x': 0, 'y': 4, 'd': 2, 'a':false, 'p': 28, 'o':'player'},
//           {'x': 3, 'y': 8, 'd': 2, 'a':false, 'p': 2, 'o':'player'},
//           {'x': 7, 'y': 8, 'd': 2, 'a':false, 'p': 6, 'o':'player'},
//           {'x': 4, 'y': 5, 'd': 1, 'a':true, 'p': 12, 'o':'player'},
//           {'x': 4, 'y': 7, 'd': 2, 'a':true, 'p': 79, 'o':'player'}
//      ],
//       'bonuses': [
//           {'x': 1, 'y': 2, 'p': 5, 't':'plus'},
//           {'x': 7, 'y': 2, 'p': 8, 't':'plus'},
//           {'x': 6, 'y': 1, 'p': 3, 't':'minus'},
//           {'x': 2, 'y': 6, 'p': 4, 't':'minus'},
//       ]};
    var game = new TD.Game(situation);
    game.init();

    // -----------------
    // --- Auto play ---
    // -----------------

    // -- State --
    var turn = 0;
    var totalIterations = 1;
    var iterationStats = [];
    var previousSelectedDirection = -1;
    var checkForSpawnedEnemy = true;
    var trackedEnemies = [];

    var brain;

    // -- Constants --
    var directions = ["up","right","down","left"];
    var oppositeDirections = ["down","left","up","right"];
    var oppositeDirectionIndexes = [2, 3, 0, 1];
    var edgePosToMovesUntilEnemyKill = [3,4,5,6,7];
    var enemySpawnPosToKillMove = [
        [null, 3,    3,    0,    3,    2,    3,    3,    null],  // x = 0
        [0,    null, null, null, null, null, null, null, 2],     // x = 1
        [0,    null, null, null, null, null, null, null, 2],     // x = 2
        [3,    null, null, null, null, null, null, null, 3],     // x = 3
        [0,    null, null, null, null, null, null, null, 2],     // x = 4
        [1,    null, null, null, null, null, null, null, 1],     // x = 5
        [0,    null, null, null, null, null, null, null, 2],     // x = 6
        [0,    null, null, null, null, null, null, null, 2],     // x = 7
        [null, 1,    1,    0,    1,    2,    1,    1,    null]   // x = 8
    ];

    var autoPlay = function () {
        if (game.running) {
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


            // *** Technique #5: Reinforced Learning ***
            // *** Best Result within 50 iterations:
            // TODO Initialize brain if necessary
            if (!brain) {
                var num_inputs = 81; // (9 x 9) inputs for board state, each in range 0-11
                var num_actions = 80; // a number in the range 0-79 : that is 4 possible actions for one of 20 possible players
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

                brain = new deepqlearn.Brain(num_inputs, num_actions, opt); // woohoo
            }

            // TODO Determine game state

            // TODO If there is a previously saved game state
            // TODO 1) Determine award for new game state compared to previously saved game state
            // TODO 2) Apply reward to brain
            // brain.backward(reward); // <-- learning magic happens here

            // TODO Save game state

            // TODO Calculate input for brain - 81 board states


            // TODO Loop until valid action is chosen by brain
            // TODO 1) Get proposed actions from brain using board states
            // TODO 2) If invalid action, punish and goto step 1)
            //var action = brain.forward(array_with_num_inputs_numbers);


            // TODO Apply valid action to game

            turn++;

            setTimeout(autoPlay, 1000);
        } else {
            // -- Game over --
            console.log("iteration# " + totalIterations + " [turns: " + turn + "][kills: " + game.statsKilledUnits + "][points: " + game.statsPoints + "]");
            console.log("-----------------------------------------------------------------------------------------------------------------");

            // Save iteration stats
            iterationStats.push({ turns: turn, kills: game.statsKilledUnits, points: game.statsPoints});

            if (totalIterations == 50) {
                // Output 50 iteration status
                console.log("-------------------------------");
                console.log("*** Stats for 50 iterations ***");
                console.log("-------------------------------");
                var statsOutput = "turns, kills, points\n";
                for (var statNum=0; statNum<iterationStats.length; statNum++) {
                    statsOutput += iterationStats[statNum].turns + "," + iterationStats[statNum].kills + "," + iterationStats[statNum].points + "\n";
                }
                console.log(statsOutput);

                // Reset iterations
                totalIterations=0;
                iterationStats = [];
            }

            totalIterations++;

            // -- Reset State --
            turn = 0;
            previousSelectedDirection = -1;
            checkForSpawnedEnemy = true;
            trackedEnemies = [];

            // Restart game
            game.init();

            setTimeout(autoPlay, 1000);
        }
    }

    setTimeout(autoPlay, 1000);

});

TD.Game = function (situation) {
    this.facet      = new TD.Facet(this);

    this.init = function() {
        this.mapConfig  = {};
        this.currentMap = {};
        this.newMap     = {};
        this.running    = true;
        this.units      = {};
        this.lastUnitId = 1;

        this.statsKilledPower   = 0;
        this.statsKilledUnits   = 0;
        this.statsLostUnits     = 0;
        this.statsLostPower     = 0;
        this.statsTicksSurvived = 0;
        this.statsPoints        = 0;

        this.pointsPerKill   = 5;

        this.spawnBotsEveryTick = 1;
        this.turnsBotWasSpawnd  = 0;

        this.chanceToSpawnBonus = 15;

        this.mapConfig = new TD.Map.Config();
        this.mapConfig.setSize(9);
        this.mapConfig.setSpawn();

        this.currentMap = new TD.Map(this.facet, this.mapConfig);

        TD.Facet = this.facet;

        if (!situation) {

            this.spawnPlayerUnit();
            this.spawnBotUnit();
        } else {
            // situation emulation
            for(var key in situation.units) {
                var unitData = situation.units[key];
                var unit = new TD.Unit(this);
                unit.setPosition(unitData.x, unitData.y);
                unit.setOwner(unitData.o);
                unit.power = unitData.p;
                unit.isBoss = !!unitData.b
                unit.active = unitData.a;
                unit.direction = unitData.d;
                unit.init();
            }
            if (situation.bonuses) {
                for(var key in situation.bonuses) {
                    var bonusData = situation.bonuses[key];
                    var bonus = new TD.Bonus(this);
                    bonus.x = bonusData.x;
                    bonus.y = bonusData.y;
                    bonus.power = bonusData.p;
                    bonus.type = bonusData.t;
                    this.currentMap.putBonusToMap(bonus, bonus.x, bonus.y);
                }
            }
        }
        this.currentMap.drawMap();
        this.currentMap.draw(this.units);
    }

    this.getNewUnitId = function () {
        return this.lastUnitId++;
    }

    this.setUnit = function(unit) {
        debug('new unit:' + unit.getId() + '. Owner='+unit.owner);
        this.units[unit.getId()] = unit;
        this.currentMap.setUnit(unit);
    }

    this.removeUnit = function (unit) {
        debug ('remove unit id = ' + unit.getId());
        this.newMap.animateDeath(unit);
        delete this.units[unit.getId()];
    }

    this.getCenter = function() {
        return this.currentMap.getCenter();
    }

    this.checkUnitDirection = function(unit) {
        this.currentMap.checkUnitDirection(unit);
    }

    this.spawnPlayerUnit = function () {
        if (!this.running) {
            debug ('can`t spawn unit. Game is stopped');
            return;
        }
        var center = this.currentMap.getCenter();
        var unitIdInCenter = this.currentMap.get(center.x, center.y);
        if (!unitIdInCenter || this.units[unitIdInCenter] == undefined) {
            // spawn only if center is empty.
            debug ('SPAWN ' + unitIdInCenter);
            debug (this.units);
            var unit = new TD.Unit(this);
            unit.setPosition(center.x, center.y);
            unit.setOwner('player');
            unit.init();
        }
    }

    this.spawnBotUnit = function () {
        if (!this.running) {
            debug ('can`t spawn unit. Game is stopped');
            return;
        }
        if (this.turnsBotWasSpawnd == 0) {
            this.turnsBotWasSpawnd = this.spawnBotsEveryTick;
        } else {
            this.turnsBotWasSpawnd--;
            return;
        }
        var emptyCell = false;
        for (var i = 0; i < 5; i++) {
            //we will do 3 attempts to find empty cell.
            var cell = this.currentMap.getRandomBotSpawnCell();
            if (!this.currentMap.get(cell.x, cell.y)) {
                debug('random coordinats x = ' + cell.x + ' y = ' + cell.y);
                emptyCell = true;
                break;
            }
        }
        if (!emptyCell) {
            // we failed to find empty cell
            return;
        }
        var unit = new TD.Unit(this);
        unit.setPosition(cell.x, cell.y);
        unit.setOwner('bot');
        unit.activate();
        unit.init();
        this.tryToSpawnBoss(unit);
        this.currentMap.botUnitDirectionSetup(unit);
    }

    this.tryToSpawnBoss = function(unit) {
        var valueIncreasingWithTime = Math.round(this.statsTicksSurvived / 10);
        var valueIncreasingWithTimeSlow = Math.round(this.statsTicksSurvived / 15);
        var timeTillSpawnBoss = 10;
        var chanceToSpawnBoss = 1 + valueIncreasingWithTime;
        if (this.statsTicksSurvived < timeTillSpawnBoss) {
            // it is to early for boss
            return;
        }
        if (rand(0, 100) > chanceToSpawnBoss) {
            // not this time
            return;
        }
        var minBossPower = 2 + valueIncreasingWithTimeSlow;
        var maxBossPower = 7 + valueIncreasingWithTimeSlow;
        unit.power = rand(minBossPower,maxBossPower);
        unit.isBoss = true;
    }

    this.spawnBonus = function() {
        if (rand (1, 100) <= this.chanceToSpawnBonus) {
            var bonus = new TD.Bonus(this);
            this.currentMap.putBonusToMap(bonus);
        }
    }

    this.tick = function() {
        if (!this.running) {
            debug('Game will not tick anymore!');
            return;
        }

        this.newMap = new TD.Map(this.facet, this.mapConfig);
        // boost units
        // move units
        for (var unitId in this.units) {
            this.units[unitId].tick();
        }
        // all unit moved.
        this.duels();
        this.battles();
        this.handleBonuses();

        this.newMap.getBonuses(this.currentMap);
        this.currentMap = this.newMap;
        this.newMap = {};

        // Spawn for player
        this.spawnPlayerUnit();
        // Spawn Bonus
        this.spawnBonus();

        // Spawn for bot
        this.spawnBotUnit();
        this.currentMap.draw(this.units);
        this.checkLoseConditions();
        this.statsTicksSurvived++;
    }

    this.duels = function () {
        for (var unitId in this.units) {
            var unit1 = this.units[unitId];
            if (unit1.active) {
                var unitIdWasInCell = this.currentMap.get(unit1.x, unit1.y);
                if (unitIdWasInCell && this.units[unitIdWasInCell] !== undefined) {
                    var unit2 = this.units[unitIdWasInCell];
                    if (unit2.x == unit1.oldX && unit2.y == unit1.oldY) {
                        // DUEL BEGINS!
                        debug('Duel p1:' + unit1.power + ' p2:' + unit2.power);
                        if (unit1.power > unit2.power) {
                            var winner = unit1;
                            var loser  = unit2;
                        } else {
                            var winner = unit2;
                            var loser  = unit1;
                        }
                        if (unit1.owner == unit2.owner) {
                            // well actualy it is not a duel, but a union
                            winner.power = unit1.power + unit2.power;
                        } else {
                            // yea here they will actually battle!
                            winner.power = winner.power - loser.power;
                            this.statsBattle(winner, loser);
                        }
                        debug('remove unit duel');
                        this.removeUnit(loser);
                        if (winner.power == 0) {
                            debug('remove unit duel and winner');
                            this.removeUnit(winner);
                        }
                    }
                }
            }
        }
    }

    this.battles = function() {
        for (var unitId in this.units) {
            var unit1 = this.units[unitId];
            var existingUnitId = this.newMap.get(unit1.x, unit1.y);
            if (existingUnitId && this.units[existingUnitId] !== undefined) {
                // here will be battle

                var unit2 = this.units[existingUnitId];
                debug('Battle p1:' + unit1.power + ' p2:' + unit2.power);
                if (unit1.power > unit2.power) {
                    var winner = unit1;
                    var loser  = unit2;
                    this.newMap.setUnit(unit1, true);
                } else {
                    var winner = unit2;
                    var loser  = unit1;
                }
                if (unit1.owner == unit2.owner) {
                    // well actualy it is not a duel, but a union
                    winner.power = winner.power + loser.power;
                } else {
                    // yea here they will actually battle!
                    winner.power = winner.power - loser.power;
                    this.statsBattle(winner, loser);
                }
                debug('winner power:' + winner.power);
                this.removeUnit(loser);
                if (winner.power == 0) {
                    debug('remove unit battle and winner');
                    this.removeUnit(winner);
                }
            } else {
                debug ('set unit to map without battle p = ' + unit1.power);
                // there is no one to battle
                this.newMap.setUnit(unit1, true);
            }
        }
    }

    this.statsBattle = function(winner, loser) {
        if (winner.owner == 'player') {
            this.statsKilledUnits ++;
            this.statsPoints += this.pointsPerKill;
            if (winner.power == 0) {
                this.statsLostUnits ++;
            }
        } else {
            this.statsLostUnits ++;
            if (winner.power == 0) {
                this.statsKilledUnits ++;
                this.statsPoints += this.pointsPerKill;
            }
        }
        this.statsKilledPower += loser.power;
        this.statsLostPower   += loser.power;
        this.statsPoints      += loser.power
    }

    this.handleBonuses = function () {
        for(var key in this.currentMap.bonusesList) {
            var bonus = this.currentMap.bonusesList[key];
            var unitId = this.newMap.get(bonus.x, bonus.y);
            if (unitId && this.units[unitId] != undefined) {
                bonus.execute(this.units[unitId]);
            }
        }
    }

    this.userActionMoveUnit = function(unitId, direction) {
        debug('unit move');
        if (!this.checkUserUnit(unitId)) {
            return;
        }
        var unit = this.units[unitId];
        if (unit.direction == direction && unit.active == true) {
            this.facet.stopGame();
            debug('unit is already moving to this direction');
            return;
        }
        if (!isInt(direction) || direction < 0 || direction > 3) {
            this.facet.stopGame();
            debug('wrong direction provided by user (' + direction + ')');
            return;
        }
        // ok we save from any bullshit

        unit.direction = direction;
        unit.activate();
        this.tick();
    }

    this.userActionStopUnit = function (unitId) {
        this.checkUserUnit(unitId);
        var unit = this.units[unitId];
        unit.deactivate();
        this.tick();
    }

    this.checkUserUnit = function(unitId) {
        if (!unitId || this.units[unitId] == undefined) {
            this.facet.stopGame();
            debug('unit not found. unitId = ' + unitId);
            return false;
        }
        var unit = this.units[unitId];
        if (unit.owner != 'player') {
            this.facet.stopGame();
            debug('unit don`t belong to user. unitId = ' + unitId);
            return false;
        }
        return true;
    }

    this.checkLoseConditions = function () {
        var center = this.currentMap.getCenter();
        unitId = this.currentMap.get(center.x, center.y);
        if (unitId && this.units[unitId] !== undefined) {
            if (this.units[unitId].owner != 'player') {
                this.stop();


                //$('#turnsSurvived').html(this.statsTicksSurvived);
                //$('#unitsKilled').html(this.statsKilledUnits);
                //$('#pointsEarned').html(this.statsPoints);
                //
                //$("#myModal").modal({                    // wire up the actual modal functionality and show the dialog
                //    "backdrop"  : "static",
                //    "keyboard"  : true,
                //    "show"      : true                     // ensure the modal is shown immediately
                //});
                //
                //var checkKey = $('#checkKey').val();

                //Ajax.json('/MathEffect/save', {
                //    //params : '__csrf=' + Ajax.getCSRF(),
                //    data: 'turnsSurvived=' + this.statsTicksSurvived +
                //        '&unitsKilled=' + this.statsKilledUnits +
                //        '&pointsEarned=' + this.statsPoints +
                //        '&checkKey=' + checkKey +
                //        '&_token=' + $('#laravel-token').val()
                //    //callBack : function(){Ajax.linkLoadingEnd(link)}
                //});
            }
        }
    }

    this.stop = function () {
        this.running = false;
    }
}
