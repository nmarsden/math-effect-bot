/**
 * Created by locadmin on 3/20/14.
 */


var Map = function(game)
{
    this.game = game;
}


var Galaxy = function(code, map)
{
    this.code = code;
    this.map = map;
}


var Star = function(code, galaxy)
{
    this.code = code;
    this.galaxy = galaxy;
}

var Palnet = function(code, star)
{
    this.code = code;
    this.star = star;
}

var Asteroids = function(code, star)
{
    this.code = code;
    this.star = star;
}
