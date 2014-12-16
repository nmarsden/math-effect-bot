/**
 * Created by ilfate on 3/16/14.
 */

/**
 * Created by Ilya RUbinchik on 3/12/14.
 */
function error(message) {
    info(message);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function t(key) {
    var translations = {
        'ru': {
            'lang': 'язык'
        },
        'en': {
            'lang': 'lang'
        }
    };
    lang = 'ru';

    if (!translations[lang][key]) {
        return key;
    }
    return translations[lang][key];
}


var message = function (text, selector, lengthPrinted) {

    delay = 50;
    delay += getRandomInt(-8, 7);
    if (typeof text == 'string') {
        $(selector).html(text.substr(0, lengthPrinted) + '|');
        if (text.substr(lengthPrinted - 1, 1) == ' ') {
            delay *= 2;
        } else if (text.substr(lengthPrinted - 1, 1) == '.') {
            delay *= 4;
        } else if (text.substr(lengthPrinted - 1, 1) == '?') {
            delay *= 6;
        } else if (text.substr(lengthPrinted - 1, 1) == '!') {
            delay *= 8;
        }

        lengthPrinted++;
        if (text.length < lengthPrinted) {
            $(selector).html(text);
            return false;
        }
        setTimeout(function () {
            message(text, selector, lengthPrinted)
        }, delay);
    }
}
//$('#SnapABug_P input').unbind().bind('click', function(){
//    message('Hi this text should be nice printed. Well lets hope so. Boom! This how I want text to flow in super-quest-game.', '#SnapABug_CL', 0);
//});
//
//
//divPrint = function(selector) {
//    message($(selector).html(), selector, 0);
//}


var Action = function (key, game) {
    this.game = game;
    this.key = key;
    this.active = false;
    this.config = {
        'open_solar_battery': ['ship', 1000],
        'close_solar_battery': ['ship', 1000],
        'diagnostic': ['ship', 5000, {'e':300}],
        'reprogram_star_tracker': ['ship', 10000, {'e':200}]
    };

    if (!this.config[key]) {
        error('Action "' + key + '" do not have configuration');
    }

    this.el = $('<button type="button" class="btn btn-default"></button>');
    this.el.attr('id', key);
    this.el.html(t(key))
    $('#' + this.config[key][0] + ' .actions').append(this.el);
    this.el.addClass('hide');

    this.init = function () {
        this.el.bind('click', jQuery.proxy(this, 'run'));
    }

    this.run = function () {
        if (!this.runCheck()) {
            return false;
        }
        this.beforeRun();
        setTimeout(jQuery.proxy(this, 'afterRun'), this.config[this.key][1]);
        info('Run action "' + this.key + '"');
    }

    this.beforeRun = function () {
        switch (this.key) {
            case 'open_solar_battery' :
                this.game.deactivateAction('open_solar_battery');
                break;
            case 'close_solar_battery' :
                this.game.deactivateAction('close_solar_battery');
                break;
            case 'diagnostic' :
                this.game.ship.activateSystem('TTX_diagnostic');
                break;
            default :
                error('no beforeRun for "' + this.key + '"');
                break;
        }
    }

    this.afterRun = function () {
        switch (this.key) {
            case 'open_solar_battery' :
                this.game.activateAction('close_solar_battery');
                this.game.ship.activateSystem('solar_batteries');
                break;
            case 'close_solar_battery' :
                this.game.activateAction('open_solar_battery');
                this.game.ship.deactivateSystem('solar_batteries');
                break;
            case 'diagnostic' :
                this.game.activateAction('diagnostic');

                if (this.game.ship.isActiveSystem('TTX_diagnostic')) {
                    info('diagnostic is done');
                    this.game.ship.deactivateSystem('TTX_diagnostic');
                    this.game.ship.diagnosticDone();
                }
                break;
            default :
                error('no afterRun for "' + this.key + '"');
                break;
        }
    }

    this.runCheck = function () {
        if (!this.active) {
            error('some one tries to run disabled action "' + this.key + '". We should report this. Yes we totally do! Report sent! Hackers well be found and punished! They definitely will be!');
            return false;
        }
        if (this.config[this.key][2]) {
            for(var currency in this.config[this.key][2]) {
                switch (currency) {
                    case 'e':
                        // here we are checking is there enough energy to run this action
                        var time = (this.config[this.key][1] / 1000); // time in seconds
                        if (
                            this.game.ship.energy.current + ((this.game.ship.energy.income - this.game.ship.energy.outcome) * time)
                            < (this.config[this.key][2][currency])
                            ) {
                            info('You dont have enough energy for this action');
                            return false;
                        }
                    break;
                    default :
                        error('Wrong currency ' + currency + ' in action runCheck');
                        break;
                }
            }
        }
        return true;
    }

    this.activate = function () {
        this.el.removeClass('hide');
        this.active = true;
    }
    this.deactivate = function () {
        this.el.addClass('hide');
        this.active = false;
    }
}

var Game = function () {
    this.actions = {};
    this.ship = new Ship(this);
    this.events = new GameEvents(this);
    this.mortals = [];
    this.resourses = {};
    this.step = 0;

    this.init = function () {
        var savedData = $('#savedGame').val();
        if (savedData) {
            this.load(savedData);
        } else {
            info('New game init');
            this.newGame();
        }
        setInterval(jQuery.proxy(this, 'tik'), 1000);
    }

    this.newGame = function () {
        // Set up new game screen
        this.ship.init();
        this.activateAction('open_solar_battery');
        this.activateAction('diagnostic');

        this.mortals.push(new Mortal('human', 'Capitan Jey Jones'));

        this.step = 1;
    }

    this.tik = function () {
        this.events.check();
        this.ship.tik();
    }

    this.getAction = function (key) {
        if (!this.actions[key]) {
            error('There is no action ' + key + ' in the game.');
            return false;
        }
        return this.actions[key];
    }

    this.activateAction = function (key) {
        info('Activate action "' + key + '"');
        if (!this.actions[key]) {
            this.actions[key] = new Action(key, this);
            this.actions[key].init();
        }
        this.actions[key].activate();
    }

    this.deactivateAction = function (key) {
        if (!this.actions[key]) {
            this.actions[key] = new Action(key, this);
        }
        this.actions[key].deactivate();
    }

    this.addResouses = function(type, value)
    {
        if (!this.resourses[type]) {
            this.resourses[type] = 0;
        }
        this.resourses[type] += value;
    }

    this.spendResouses = function(type, value)
    {
        if (!this.resourses[type] || this.resourses[type] < value) {
            return false;
        }
        this.resourses[type] -= value;
        return true;
    }

    /**
     *
     * @param data
     */
    this.load = function (data) {

    }
}

var GameEvents = function(game)
{
    this.game = game;

    this.check = function() {
        switch(this.game.step) {
            case 1 :

            break;
            case 99 :
            break;
            default :
            break;
        }
    }
}

var Mortal = function(race, name) {
    this.race = race;
    this.name = name;
    this.skills = {};
    this.status = '';
    this.health = 100;
    this.sanity = 100; // :)

    this.damage = function(val)
    {
        this.health -= val;
        if (this.health < 0) {
            this.status = 'dead';
            info(this.name + ' horribly dies');
        }
    }
}




$(document).ready(function () {
    var game = new Game();
    game.init();
});

