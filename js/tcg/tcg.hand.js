/**
 * Created by Ilya Rubinchik (ilfate) on 12/09/14.
 */



TCG.Hand = function (game) {
    this.game = game;

    this.init = function() {

    }



    this.drawCard = function(playerId, card) {
        info(card);
        // remove card from hand
        $('.hand. card.id_' + card.id).remove();

        this.createUnit(card);
    }

    this.createCard = function(card) {
        var template = $('#template-card').html();
        Mustache.parse(template);   // optional, speeds up future uses
        var cardType = 'hand-card my-card';
        if (!this.game.isDeploy()) {
            cardType += ' spell-only';
        }
        var rendered = Mustache.render(template, {card : card, isDeploy : this.game.isDeploy(), cardType : cardType});
        var obj = $(rendered);
        this.game.units.checkArmor(obj);
        $('.hand .before-injector').before(obj);
        obj.on('click', function(){ TCG.Game.event('cardClick', $(this)) });

        if (card.imageAuthor) {
            this.game.helpers.createAuthor(card.imageAuthor);
        }
    }

    this.removeCard = function(cardId) {
        var card = $('.hand-card.id_' + cardId);
        card.animate({
            'margin-top' : '-200px',
            'opacity' : 0
        }, {duration:400,
            'complete': function () {
                $(this).remove();
            }
        });

        this.game.handCardInFocus = null;
    }
}