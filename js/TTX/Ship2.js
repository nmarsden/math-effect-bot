var Ship = function (game) {
    this.game = game;
    this.energy = new Energy(this);
    this.systems = {};

    this.init = function (data) {
        if (!data) {
            // it is a new game
            this.installSystem('solar_batteries');
            this.installSystem('life_support_system');
            this.installSystem('RTG'); //Radioisotope thermoelectric generator
            this.installSystem('TTX-800');
            this.installSystem('probe-port');
            this.installSystem('star_tracker', ['st_wrong_stars']); // Звёздный датчик

            this.energy.limit = 5000;
            this.energy.current = 250;
        }
    }

    this.tik = function () {
        this.energy.tik();

        if (!this.isActiveSystem('life_support_system')) {
            // damage humans!!
            for(var i in this.game.mortals) {
                this.game.mortals[i].damage(2);
                info('humans are dying')
            }
        }
    }

    this.getSystem = function (systemKey) {
        if (!this.systems[systemKey]) {
            error('There is no system ' + systemKey + ' on the ship.');
            return false;
        }
        return this.systems[systemKey];
    }
    this.hasSystem = function(key)
    {
        if (this.systems[key]) {
            return true;
        }
        return false;
    }
    this.isActiveSystem = function(key)
    {
        if (this.systems[key] && this.systems[key].active) {
            return true;
        }
        return false;
    }

    this.installSystem = function (key, problems) {
        this.systems[key] = new System(key, this);
        this.systems[key].install();
        if (problems) {
            for(var i in problems) {
                this.systems.addProblem(problems[i]);
            }
        }
    }

    this.activateSystem = function (key) {
        if (!this.systems[key]) {
            this.installSystem(key);
        }
        this.systems[key].activate();
    }
    this.deactivateSystem = function (key) {
        this.getSystem(key).deactivate();
    }

    this.systemsShutDown = function () {
        for (var key in this.systems) {
            this.deactivateSystem(key);
        }
    }

    this.diagnosticDone = function(key) // key is not mandatory
    {
        for (var sysKey in this.systems) {
            if (this.systems[sysKey].problems) {
                for (var problemKey in this.systems[sysKey].problems) {
                    if (key && key != problemKey) {
                        continue;
                    }
                    this.systems[sysKey].problems[problemKey].diagnosticResult();
                    return true;
                }
                break;
            }
        }
        info('no problem was diagnosed... Sad but true.');
    }

    this.solveProblem = function(key) // key is not mandatory
    {
        for (var sysKey in this.systems) {
            if (this.systems[sysKey].problems) {
                for (var problemKey in this.systems[sysKey].problems) {
                    if (key && key != problemKey) {
                        continue;
                    }
                    this.systems[sysKey].problems[problemKey].solve();
                    break;
                }
                break;
            }
        }
    }
}

var System = function (systemKey, ship) {
    this.ship = ship;
    this.key = systemKey;
    this.active = false;
    this.energyOutcome = 0;
    this.energyIncome = 0;
    this.problems = {};

    this.install = function () {
        switch (this.key) {
            case 'solar_batteries' :
                this.energyIncome = 20;
                break;
            case 'RTG' : //Radioisotope thermoelectric generator
                this.energyIncome = 10;
                break;
            case 'life_support_system' :
                this.energyOutcome = 10;
                break;
            case 'TTX-800':
                this.energyOutcome = 1;
                break;
            case 'TTX_diagnostic':
                this.energyOutcome = 50;
                break;
            case 'probe-port':
                this.energyOutcome = 50;
                break;
            default :
                error('System ' + this.key + ' is do not have install action');
                break;
        }
    }

    this.activate = function () {
        if (this.active) {
            info('Attempt to activate already active system');
            return false;
        }
        this.active = true;
        this.ship.energy.income += this.energyIncome;
        this.ship.energy.outcome += this.energyOutcome;
    }
    this.deactivate = function () {
        if (!this.active) {
            info('Attempt to deactivate already inactive system');
            return false;
        }
        this.active = false;
        this.ship.energy.income -= this.energyIncome;
        this.ship.energy.outcome -= this.energyOutcome;
    }
    this.addProblem = function(key)
    {
        if (this.problems[key]) {
            error('we cant have two same problems "' + key + '" in one system "' + this.key + '"');
        }
        this.problems[key] = new Problem(key, this);
    }
}

var Energy = function (ship) {
    this.ship = ship;
    this.limit = 0;
    this.current = 0;
    this.lastEnergy = 0;
    this.income = 0;
    this.outcome = 0;

    this.tik = function () {
        if (this.outcome == this.income && this.current == this.lastEnergy) {
            return;
        }

        this.current -= this.outcome;
        this.current += this.income;

        if (this.current < 0) {
            this.current = 0;
            this.ship.systemsShutDown();
            info('Ship is out of energy. All systems was shut down');
        }

        if (this.current > this.limit) {
            this.current = this.limit;
        }
        this.lastEnergy = this.current;
        $('#energyBar').width(Math.round(this.current * 100 / this.limit) + '%');
    }
}

var Problem = function (key, system) {
    this.key  = key;
    this.system = system;

    switch (this.key) {
        case 'st_wrong_stars':
            var needDiagnostic = true;
        break;
        default :
            var needDiagnostic = true;
        break;
    }
    this.needDiagnostic = needDiagnostic;

    this.diagnosticResult = function()
    {
        switch (this.key) {
            case 'st_wrong_stars':
                info('Looks like this system is running perfectly.');
                this.system.ship.game.activateAction('reprogram_star_tracker');
                break;
            default :
                break;
        }

    }

    this.solve = function()
    {

    }

}