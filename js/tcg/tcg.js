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
function is_object(obj) {
    return typeof obj === 'object';
}

function TCG () {

}
TCG = new TCG();

$(document).ready(function() {
    TCG.Game = new TCG.Game();


});


TCG.Game = function () {

    this.phase_battle = 4;
    this.phase_deploy = 3;

    this.width = 8;
    this.height = 8;
    this.handCardInFocus;
    this.fieldCardInFocus;
    this.phase = 0;
    this.currentPlayerId;
    this.playerTurnId;
    this.currentCardId;
    this.gameId;
    this.units     = new TCG.Units(this);
    this.objects   = new TCG.Objects(this);
    this.hand      = new TCG.Hand(this);
    this.order     = new TCG.Order(this);
    this.spell     = new TCG.Spell(this);
    this.helpers   = new TCG.Helpers(this);
    this.actionUrl = '';

    this.init = function(data) {
        this.phase = data.phase;
        this.playerTurnId = data.playerTurnId;
        this.currentPlayerId = data.currentPlayerId;
        this.currentCardId = data.card;
        this.gameId = data.gameId;
        this.actionUrl = data.actionUrl;

        this.bindObjects();
        this.units.init();

        //this.socket.initConnection(data.subscriptionKey);
    }

    this.renderFieldUnits = function(units) {
        for(var i in units) {
            this.units.createUnit(units[i]);
            this.order.createCard(units[i]);
        }
    }
    this.renderFieldObjects = function(objects) {
        for(var i in objects) {
            this.objects.createObject(objects[i]);
        }
    }
    this.renderHandCards = function(cards) {
        for(var i in cards) {
            this.hand.createCard(cards[i]);

        }
    }

    this.bindObjects = function()
    {
        $('.field .cell').on('click', function(){ TCG.Game.event('cellClick', $(this)) });
        $('.hand .skipTurn').on('click', function(){ TCG.Game.event('skip', $(this)) });
    }

    this.event = function(name, obj) {
        switch(name) {
            case 'cardClick':
                if(obj.hasClass('hand-card')) {
                    this.cardClick(obj);
                    switch(this.phase) {
                        case this.phase_deploy: // Deploy phase
                            // light them up!
                            if (this.handCardInFocus) {
                                this.lightUpDeployArea();
                            } else {
                                this.unFocusDeployArea();
                            }
                            break;
                        case this.phase_battle: // battle
                            this.toggleCastButton(obj);
                            // we need to hide current focused cells for unit
                            break;
                    }
                }
                break;
            case 'cellClick':
                if (this.isDeploy()) {
                    this.deploy(obj);
                } else if (this.isBattle()) {
                    if (!this.handCardInFocus) {
                        this.moveUnit(obj);
                    } else {
                        this.spell(obj, 'cell');
                    }
                }
                break;
            case 'unitClick':
                if (this.isBattle()) {
                    this.spell(obj, 'unit');
                }
                break;
            case 'skip' :
                this.skip(obj);
                break
        }
    }

    this.action = function(data) {

        var url = this.actionUrl + '?';
        var first = true;
        for(var key in data.data) {
            var value = data.data[key];

            if (is_object(value)) {
                for (var key2 in value) {
                    url += '&' + key + '[' + key2 + ']=' + value[key2]
                }
            } else {
                if (first) {
                    first = false;
                } else {
                    url += '&';
                }
                url += key + '=' + value;
            }
        }

        url += '&playerId=' + this.currentPlayerId;
        Ajax.json(url, {
            //params : '__csrf=' + Ajax.getCSRF(),
//                    data: 'turnsSurvived=' + this.statsTicksSurvived +
//                        '&_token=' + $('#laravel-token').val()
            callBack : function(data){TCG.Game.processLog(data)}
        });

    }

    this.deploy = function(cell) {
        if (this.handCardInFocus && this.isDeploy() && this.isMyTurn()) {
            var x = cell.data('x');
            var y = cell.data('y');
            var cardId = this.handCardInFocus.data('id');

            //this.action("/tcg/action?action=deploy&cardId=" + cardId + "&x=" + x + "&y=" + y);
            this.action({'type' : 'deploy', 'data' : {'action' : 'deploy', 'cardId' : cardId, 'x' : x, 'y' : y}});
            this.unFocusDeployArea();
        } else {
            if (this.handCardInFocus && !this.isMyTurn()) {
                this.helpers.addMessage('This is not your turn to play card.')
            }
        }
    }

    this.moveUnit = function(cell) {
        if (cell.hasClass('object')) {
            var x = cell.data('x');
            var y = cell.data('y');
            cell = $('.cell.x_' + x + '.y_' + y);
        }
        if (!this.handCardInFocus && this.fieldCardInFocus && this.isBattle() && this.isMyTurn() && cell.hasClass('focus')) {
            this.units.removeFocus();
            var x = cell.data('x');
            var y = cell.data('y');
            var cardId = this.fieldCardInFocus.data('id');

            this.action({'type' : 'move', 'data' : {'action' : 'move', 'cardId' : cardId, 'x' : x, 'y' : y}});
            //this.action("/tcg/action?action=move&cardId=" + cardId + "&x=" + x + "&y=" + y);
        } else {
            if (this.handCardInFocus && this.isBattle() && this.isMyTurn()) {
                alert('You are trying to move unit, but you have card in hand active');
            }
        }
    }

    this.spell = function(obj, type) {
        if (this.handCardInFocus && this.isBattle() && this.isMyTurn()) {
            var spellType = this.handCardInFocus.data('spelltype');
            if (type != spellType) {
                info ('you are trying to cast spell? target is wrong')
                return ;
            }
            this.units.removeFocus();
            var cardId = this.handCardInFocus.data('id');
            if (spellType == 'unit') {
                var targetId = obj.data('id');
                this.action({'type' : 'cast', 'data' : {'action' : 'cast', 'cardId' : cardId, 'data' : {'targetId' : targetId}}});
                //this.action("/tcg/action?action=cast&cardId=" + cardId + "&data[targetId]=" + targetId);
            } else if (spellType == 'cell') {
                var x = obj.data('x');
                var y = obj.data('y');
                this.action({'type' : 'cast', 'data' : {'action' : 'cast', 'cardId' : cardId, 'data' : {'x' : x, 'y' : y}}});
                //this.action("/tcg/action?action=cast&cardId=" + cardId + "&data[x]=" + x + "&adata[y]=" + y);
            } else if(spellType == 'cast') {
                this.action({'type' : 'cast', 'data' : {'action' : 'cast', 'cardId' : cardId, 'data' : {}}});
                //this.action(window.location = "/tcg/action?action=cast&cardId=" + cardId + "&data[]=");
            }
        }
    }

    this.skip = function(buttonObj) {
        if (this.isMyTurn()) {
            var unit = buttonObj.parent('.unit');
            this.units.removeFocus();
            this.action({'type' : 'skip', 'data' : {'action' : 'skip', 'cardId' : unit.data('id')}});
        }
    }
    this.ping = function() {
        if (!this.isMyTurn()) {
            this.action({'type' : 'ping', 'data' : {}});
        }
    }

    this.processLog = function(data)
    {
        if (!data.log) {
            info('Empty data');
            if (data.error) {
                info(data.message);
                TCG.Game.helpers.createMessage(data.message);
                this.tryToShowNextUnitMove();
            }
            return;
        }
        info(data);
        var log = data.log;
        var newTurn = this.processGameUpdate(data.game);
        for(var i in log) {
            var event = log[i];
            switch(event.type) {
                case 'deploy':
                    this.units.deploy(event.playerId, event.card);
                    this.hand.removeCard(event.card.id);
                    this.order.createCard(event.card);
                    break;
                case 'startBattle':
                    this.startBattle();
                    break;
                case 'cardDraw':
                    if (event.playerId == this.currentPlayerId) {
                        this.hand.createCard(event.card)
                    } else {

                    }
                    break;
                case 'move':
                    this.units.move(event.cardId, event.x, event.y);
                    break;
                case 'attack':
                    this.units.attack(event.cardId, event.targetId);
                    break;
                case 'unitGetDamage':
                    this.units.damage(event.cardId, event.health, event.damage);
                    break;
                case 'unitChangeArmor':
                    this.units.armor(event.cardId, event.armor, event.dArmor);
                    break;
                case 'death':
                    this.units.death(event.cardId);
                    this.order.removeCard(event.cardId);
                    break;
                case 'change':
                    this.units.change(event.cardId, event.dataType, event.data);
                    break;
                case 'cast':
                    this.hand.removeCard(event.cardId);
                    break;
                case 'skip':
                    this.units.bounce(event.cardId);
                    break;
                case 'battleEnd':
                    this.showResultModal();
                    break;
                case 'fieldObject':
                    this.objects.event(event.mode, event.object);
                    break;
            }
        }
        this.postProcessGameUpdate(newTurn);
    }

    this.processGameUpdate = function(game) {
        if (this.playerTurnId != game.playerTurnId) {
            this.playerTurnId = game.playerTurnId;
            $('.playerTurnId').html(this.playerTurnId);
        }

        var newTurn = false;
        if (this.currentCardId != game.card) {
            this.currentCardId = game.card;
            newTurn = true;
        }
        return newTurn;
    }
    this.postProcessGameUpdate = function(newTurn) {
        this.units.runAnimations();

        this.tryToShowNextUnitMove();
    }

    this.startBattle = function() {
        this.phase = this.phase_battle;
        this.tryToShowNextUnitMove();
    }

    this.processGame = function() {
        this.tryToShowNextUnitMove();
        this.tryToSetUpConnection();
    }

    this.tryToShowNextUnitMove = function() {
        if (this.isBattle()) {
            if (this.isMyTurn()) {
                this.units.markMoveForCardId(this.currentCardId);
            } else {
                this.units.showEnemyUnit(this.currentCardId);
            }
            this.order.setCurrentCard(this.currentCardId);
        }

    }
    this.tryToSetUpConnection = function() {
        if (!this.isMyTurn()) {
            info('Ajax updates are disabled')
//            setTimeout(function() {
//                TCG.Game.ping()
//            }, 2000);
        }
    }

    this.lightUpDeployArea = function() {
        $('.field .cell.y_' + (this.height-2) + ', .field .cell.y_' + (this.height-1)).addClass('focus')
    }

    this.unFocusDeployArea = function() {
        $('.field .cell.focus').removeClass('focus');
    }

    this.toggleCastButton = function(obj) {
        if (this.handCardInFocus && obj.data('spelltype') == 'cast') {
            //info(obj.find('.cast'));
        } else {
            obj.find('.cast').hide();
        }
    }

    this.cardClick = function(obj) {
        if(obj.hasClass('focus')) {
            obj.removeClass('focus');
            this.handCardInFocus = false;
        } else {
            if (this.handCardInFocus) {
                this.handCardInFocus.removeClass('focus');
            }
            obj.addClass('focus');
            this.handCardInFocus = obj;
        }
    }

    this.showResultModal = function() {
        $("#myModal").modal({                    // wire up the actual modal functionality and show the dialog
            "backdrop"  : "static",
            "keyboard"  : true,
            "show"      : true                     // ensure the modal is shown immediately
        });
    }

    this.isMyTurn = function() {
        return this.currentPlayerId == this.playerTurnId;
    }

    this.isBattle = function() {
        return this.phase == this.phase_battle;
    }
    this.isDeploy = function() {
        return this.phase == this.phase_deploy;
    }

}