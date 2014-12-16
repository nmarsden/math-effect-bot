/**
 * Created by ilfate on 12/10/14.
 */


function initFormCard()
{
    $(".non-game-card").on('click', function(){
        $(this).find('input.hidden').prop("checked", true);
        $(".non-game-card.focus").removeClass('focus');
        $(this).addClass('focus');
    });
}