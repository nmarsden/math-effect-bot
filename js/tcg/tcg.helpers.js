/**
 * Created by Ilya Rubinchik (ilfate) on 12/09/14.
 */

TCG.Helpers = function (game) {
    this.game = game;
    this.messages = [];
    this.messageIsShown = false;
    this.popover;

    this.addMessage = function(message, type) {
        this.messages.push({'message' : message, 'type' : type});
        if (!this.messageIsShown) {
            this.showMessages();
        }
    }

    this.showMessages = function() {
        if (this.messages.length > 0) {
            var message = this.messages[0];
            this.createMessage(message.message, message.type)
            this.messages = this.messages.slice(1);
            this.messageIsShown = true;
        } else {
            this.messageIsShown = false;
        }
    }

    this.getPopover = function(text, type) {
        //if (!this.popover) {
        var el = $('.field');
        el.popover({'content' : text, 'placement' : 'left'})
        el.popover('show')
        this.popover = el.next();
        //}
        return this.popover;
    }

    this.createMessage = function(text, type) {
        var template = $('#template-message').html();
        Mustache.parse(template);   // optional, speeds up future uses
        var rendered = Mustache.render(template, {text : text, type : type});
        var obj = $(rendered);

        //var popover = this.getPopover(text, type);

        $('#message-container').append(obj);

        obj.animate({'top' : -200} , {duration:2000});
        obj.delay(2000).animate({'opacity' : 0} , {duration:1000, 'complete': function () {
            $(this).css('opacity', 1).remove();
            TCG.Game.helpers.showMessages();
        }});

    }

    this.createAuthor = function(author) {
        if ($('.author-' + author.id).length < 1) {
            var el = $('<p class="author-' + author.id + '">' + author.text + '</p>');
            $('.tcg-footer .authors').append(el);
        }
    }

}