
loadBot = function(id,player,game)
	{
		var layer = game.layers[player.id];
		var bullets = game.layers['bullets'];
		var bot = layer.addObject('bot','image')
		.setXY(-(game.bot_square/2),-(game.bot_square/2),game.bot_square,game.bot_square,0,0,game.bot_square,game.bot_square);
    info(game.path+'pics/tank4.png');
		switch(id)
		{
			case 1:
			{
				bot.addAnimation('normal',1,6,[6,6,6,6,6,6])//[5,3,5,3,2]
					 .addAnimation('fire',2,6,[5,5,5,5,5,5])
					 .addAnimation('move',1,6,[6,6,6,6,6,6])
					 .addAnimation('rotate',1,6,[6,6,6,6,6,6])
					 .addAnimation('death',3,6,[10,10,10,10,10,10])
					 .runAnimation('normal',-1)
					 .img(game.path+'pics/tank4.png');
				D_func = function(p,id_player){
					var layer = p.getLayer(id_player);
					var object = layer.getObject('bot');
					object.set('sy',92).set('sx',240).runAnimation('death',1);
				}
				F_func = function(p,id_player){
					var layer = p.getLayer(id_player);
					var object = layer.getObject('bot');
					object.runAnimation('fire',1);
				}
				game.addEvent('D1',player.id,D_func);
				game.addEvent('F1',player.id,F_func);
				
				//bullets.addObject('b_'+player.id+'_1','drawing').fillRect(0,0,4,4);
			}
			break;
			case 2:
			{
				bot.addAnimation('normal',1,6,[6,6,6,6,6,6])//[5,3,5,3,2]
					 .addAnimation('move',1,6,[6,6,6,6,6,6])
					 .addAnimation('rotate',1,6,[6,6,6,6,6,6])
					 .addAnimation('death',2,6,[10,10,10,10,10,10])
					 .runAnimation('normal',-1)
					 .img(game.path+'pics/tank3.png');
				D_func = function(p,id_player){
					var layer = p.getLayer(id_player);
					var object = layer.getObject('bot');
					var object2 = layer.getObject('gun');
					object.set('sy',48).set('sx',240).runAnimation('death',1);
					object2.set('sy',76).set('sx',240).runAnimation('death',1);
				}
				F_func = function(p,id_player){
					var layer = p.getLayer(id_player);
					var object = layer.getObject('gun');
					object.runAnimation('fire',1);
				}
				var mini_bot = game.layers[player.id].addObject('gun','image').img(game.path+'pics/gun3.png').
					setXY(0-(game.bot_square/2),0-(game.bot_square/2),game.bot_square,game.bot_square,0,0,game.bot_square,game.bot_square);
				mini_bot.addAnimation('fire',2,6,[6,6,6,6,6,6])
								.addAnimation('death',3,6,[5,5,5,5,5,5])
								.runAnimation('normal',-1);
				game.addEvent('D1',player.id,D_func);
				game.addEvent('F1',player.id,F_func);
				
				//bullets.addObject('b_'+player.id+'_1','drawing').fillRect(0,0,4,4);
				//bullets.addObject('b_'+player.id+'_1','image').img(game.path+'pics/bullet2.png').setXY(0,0,4,6,0,0,4,6);
			}
			break;
			case 3:
			{
				bot.addAnimation('normal',1,6,[6,6,6,6,6,6])//[5,3,5,3,2]
					 .addAnimation('move',1,6,[6,6,6,6,6,6])
					 .addAnimation('rotate',1,6,[6,6,6,6,6,6])
					 .addAnimation('death',2,6,[10,10,10,10,10,10])
					 .runAnimation('normal',-1)
					 .img(game.path+'pics/tank1.png');
				D_func = function(p,id_player){
					var layer = p.getLayer(id_player);
					var object = layer.getObject('bot');
					var object2 = layer.getObject('gun');
					object.set('sy',48).set('sx',240).runAnimation('death',1);
					object2.set('sy',76).set('sx',240).runAnimation('death',1);
				}
				F_func = function(p,id_player){
					var layer = p.getLayer(id_player);
					var object = layer.getObject('gun');
					object.runAnimation('fire',1);
				}
				var mini_bot = game.layers[player.id].addObject('gun','image').img(game.path+'pics/gun1.png').
					setXY(0-(game.bot_square/2),0-(game.bot_square/2),game.bot_square,game.bot_square,0,0,game.bot_square,game.bot_square);
				mini_bot.addAnimation('fire',2,6,[6,6,6,6,6,6])
								.addAnimation('death',3,6,[5,5,5,5,5,5])
								.runAnimation('normal',-1);
				game.addEvent('D1',player.id,D_func);
				game.addEvent('F1',player.id,F_func);
				
				//bullets.addObject('b_'+player.id+'_1','drawing').fillRect(0,0,4,4);
			}
			break;
		}
	}
