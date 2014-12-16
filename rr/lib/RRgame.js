function RRAnimator(map,timeEnd)
{
	this.map = map;
	this.timeEnd = timeEnd;
	this.square = 32;
	this.bot_square = 48;
	this.img_marg = 16;
	this.players = [];
	this.layers = [];
	this.events = [];
	this.canv_options = {'width':700,'height':700,'interval':10,'time_limit':30,'multi_canvas':1};
	this.options = {'cw':this.square,'ch':this.square};
	this.path = '';
	this.p = '';
	
	this.init = function(path)
	{
		this.path = path;
		this.p = new Pulsar('div_canvas',this.canv_options);
		this.layers['map'] = this.p.addLayer('map',4);
		//this.layers['map'].
		var img2 = this.layers['map'].addObject('2','image',1).img(path+'pics/texture/R27.jpg').setXY(0,0,this.square,this.square,0,0,128,128);
		var img0 = this.layers['map'].addObject('0','image',1).img(path+'pics/texture/B1.jpg').setXY(0,0,this.square,this.square,0,30,64,64);
		var img1 = this.layers['map'].addObject('1',img0,1);
		img0.setXY(0,0,this.square,this.square,20,30,94,94);
		var table = this.layers['map'].addObject('map','table');
		this.layers['map'].x = 0;this.layers['map'].y=0;
		//table.set('x',-100);
		//console.log(img1);
		table.setTable(map).setSize(this.options['cw'],this.options['ch']);
		table.setCells({2:img2,0:img0,1:img1});
		
		this.layers['bullets'] = this.p.addLayer('bullets',6);
		this.layers['bullets'].x = 0;
		this.layers['bullets'].y = 0;
		return this;
	}
	this.getX = function(x)
	{
		if(this.img_marg) var marg = this.img_marg; else var marg = 0;
			return (x-1) * this.options['cw'] + marg 
	}
	this.getY = function(y)
	{
		if(this.img_marg) var marg = this.img_marg; else var marg = 0;
		
			return (y-1) * this.options['ch'] + marg; 
	}
	this.getAbsX = function(x)
	{
			return (x-1) * this.options['cw'];
	}
	this.getAbsY = function(y)
	{
			return (y-1) * this.options['ch']; 
	}
	this.addPlayer = function(player,bot_func)
	{
		var priv_key = 0;
		for(time in player.log)
		{
			if(priv_key > 0)
				player.timer[priv_key] = time - priv_key;
			priv_key = time;
		}
		
		this.players[player.id] = player;
		this.layers[player.id] = this.p.addLayer(player.id,20+player.id);
		this.layers[player.id].x=0;this.layers[player.id].y=0;
		loadBot(player.bot.model,player,this);
		
		this.layers[player.id].x = this.getX(player.bot.x);
		this.layers[player.id].y = this.getY(player.bot.y);
		this.layers[player.id].angle = (player.bot.d * 90) - 90;

		//this.layers[player.id].addObject('bullet','image').img(this.path+'pics/bullet.png').setXY(0,0,4,4,0,0,4,4);
		if(player.bots)
		{
			for(key in player.bots)
			{
				var mini_bot = this.layers[player.id].addObject(player.bots[key].id,'image').img(player.bots[key].file).
		setXY(player.bots[key].x-(this.bot_square/2),player.bots[key].y-(this.bot_square/2),this.bot_square,this.bot_square,0,0,this.bot_square,this.bot_square);
				if(player.bots[key].animations)
				{
					mini_bot = player.bots[key].animations(mini_bot);
				}
			}
		}
	}
	
	this.addEvent = function(code,id_player,func)
	{
		this.events[code+'_'+id_player] = func;
	}
	this.draw = function()
	{
		this.p.parent = this;
		this.p.addFunction(function(p){
			p.parent.execute(p);
		});
		this.p.draw();
		
	}
	this.execute = function(p)
	{
		if(p.time >= this.timeEnd+1000) 
		{
			p.shutDown = true;
			return false;
		}
		for(id_player in this.players)
		{
			for(log_time in this.players[id_player].log)
			{
				if(log_time <= p.time)
				{
					this.do(this.players[id_player].log[log_time],id_player,p,log_time);
					delete this.players[id_player].log[log_time];
				}
				if(this.players[id_player].events)
				{
					for(var key in this.players[id_player].events)
					{
						if(this.players[id_player].events[key].time <= p.time)
						{
							this.runEvent(this.players[id_player].events[key],id_player,p,key);
							delete this.players[id_player].events[key];
						}
					}
				}
			}
		}
	}
	this.do = function(com,id_player,p,log_time)
	{
		var t = this.players[id_player].timer[log_time];
		var bot = this.players[id_player].bot;
		var layer = p.getLayer(id_player);
		var object = layer.getObject('bot');
		object.stopAnimation();
		switch(com)
		{
			case 'M1':
			{
				//object.moveTo(this.getX(bot.x=bot.nextX()),this.getY(bot.y=bot.nextY()),t);
				layer.moveTo(this.getX(bot.x=bot.nextX()),this.getY(bot.y=bot.nextY()),t);
				object.runAnimation('move',-1);
			}
			break;
			case 'R1':
			{
				bot.d = bot.right();
				//object.rotate(object.angle - 90  ,t);
				layer.rotate(layer.angle - 90  ,t);
				object.runAnimation('rotate',-1);
			}
			break;
			case 'R2':
			{
				bot.d = bot.left();
				//object.rotate(object.angle + 90  ,t);
				layer.rotate(layer.angle + 90  ,t);
				object.runAnimation('rotate',-1);
			}
			break;
			case 'F1':
			{
				if(this.events['F1_'+id_player])
				{
					this.events['F1_'+id_player](p,id_player);
				}
				else
				{
					object.runAnimation('fire',1);
				}
			}
			break;
			case 'D1':
			{
				if(this.events['D1_'+id_player])
				{
					this.events['D1_'+id_player](p,id_player);
				}
				else
				{
					object.set('sy',48).set('sx',240215).runAnimation('death',1);
					p.getLayer(id_player).setIndex(10+Math.random(1,9))
				}
			}
			break;
		}
	}
	this.runEvent = function(arr,id_player,p,key)
	{
		var l =  p.getLayer('bullets');
		bullets = game.layers['bullets'];
		switch(arr.code)
		{
			case 'F1':
			{
				//var bullet_1 = l.getObject('b_'+id_player+'_1');
				//var bullet = l.addObject('bullet_'+arr.time,bullet_1);
				var bullet = bullets.addObject('b_'+id_player+'_'+key,'drawing');
				//bullet.fillRect(50,50,4,4)
				bullet.fillRect(this.getAbsX(arr.attrs.start_x),this.getAbsY(arr.attrs.start_y),4,4)
				//bullet.setXY(this.getAbsX(arr.attrs.start_x),this.getAbsY(arr.attrs.start_y),4,4)//.set('sx',47).set('sy',16)
					.moveTo(this.getAbsX(arr.attrs.end_x),this.getAbsY(arr.attrs.end_y),arr.attrs.end_time - arr.time);
				
				//console.log(arr.attrs.start_x,this.getAbsX(arr.attrs.start_x),this.getAbsY(arr.attrs.start_y));
			}
			break;
			default:
			break;
		}
	}
}

function Player()
{
	this.id = 0;
	this.log = [];
	this.bot = new Bot();
	this.timer = [];
	this.events = [];
	this.bots = [];
	this.addBot = function(bot)
	{
		this.bots[bot.id] = bot;
	}
}
function Bot()
{
	this.id = 0;
	this.file = '';
	this.x = 0;
	this.y = 0;
	this.d = 0;
	this.nextX = function()
	{
		switch(this.d)
		{
			case 0: return this.x+1; break;
			case 2: return this.x-1; break;
			default : return this.x; break;
		}
	}
	this.nextY = function()
	{
		switch(this.d)
		{
			case 1: return this.y-1; break;
			case 3: return this.y+1; break;
			default : return this.y; break;
		}
	}
	this.right = function()
	{
		switch(this.d)
		{
			case 0: return 3; break;
			default : return this.d-1; break;
		}
	}
	this.left = function()
	{
		switch(this.d)
		{
			case 3: return 0; break;
			default : return this.d+1; break;
		}
	}
}



