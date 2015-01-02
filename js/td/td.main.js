function rand(min, max) {
    return Random.integer(min, max)(main.randomEngine);

    //return Math.floor(Math.random()*(max-min+1)+min);
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

    // Create global 'main' variable
    main = new TD.Main();
    main.init();


});

TD.Main = function () {
    this.randomSeed = 1;
    this.game = new TD.Game(false);

    this.init = function () {
        this.randomEngine = Random.engines.mt19937().seed(this.game.randomSeed);
        this.game.init();
    };

    this.startAutoPlay = function () {
        this.game.ai.startAutoPlay();
    };

    this.stopAutoPlay = function () {
        this.game.ai.stopAutoPlay();
    };

    this.startTraining = function () {
        this.game.ai.startTraining();
    };

    this.stopTraining = function () {
        this.game.ai.stopTraining();
    };

    this.saveBrain = function() {
        this.game.ai.saveBrain();
    };

    this.startTrainingGenetically = function() {
        // init 8 games
        // start training 8 games


    };

    this.stopTrainingGenetically = function () {

    };

};
