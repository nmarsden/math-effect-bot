/*Object.prototype.clone = function() {
  var newObj = (this instanceof Array) ? [] : {};
  for (i in this) {
    if (i == 'clone') continue;
    if (this[i] && typeof this[i] == "object") {
      newObj[i] = this[i].clone();
    } else newObj[i] = this[i]
  } return newObj;
}//*/



function PlObject(name,type,layer)
{
	this.x = 0;
	this.y = 0;
	this.ready = 1;
	this.layer = layer;
	this.name = name;
	this.type = type; // image, block, circle, table
	if(typeof(type) == 'string')
	{
		eval('this.essence = new Pl_'+this.type+'(this);');
	}
	
	this.start_time = 0;
	this.vx = 0;
	this.vy = 0;
	this.iter = 0;
	this.a_iter = 0;
	this.angle = 0;
	this.vangle = 0;
	this.time = 0;
	this.was_r = [];
	this.set = function(attr,val)
	{
		this.update();
		this.essence[attr] = val;
		return this;
	}
	this.get = function(attr)
	{
		return this.essence[attr];
	}
	this.clone = function(obj)
	{
		var object = new PlObject(this.name,this.type,this.layer);
		for(var attr in this)
		{
			if(attr != 'essence' )
				object[attr] = this[attr];
		}
		if(this.type == 'image')
		{
			for(var attr in this.essence)
			{
				object.essence[attr] = this.essence[attr];
			}
			//object.essence.img = this.essence.img;
		}
		object.ready = 1;
		object.essence.ready = 1;
		return object;
	}//*/
	this.setXY = function(x,y,w,h,sx,sy,sw,sh)
	{
		this.update();
		//if(x && y)
		//{
			this.essence.x = x;
			this.essence.y = y;
		
		if(w && h)
		{
			this.essence.w = w;
			this.essence.h = h;
		}
		if( sw && sh)
		{
			this.essence.sx = sx;
			this.essence.sy = sy;
			this.essence.sw = sw;
			this.essence.sh = sh;
		}
		return this;
	}
	this.img = function(img)
	{
		this.update();
		if(this.type == 'image')
			this.essence.img.src = img;
		return this;
	}
	
	this.setTable = function(table)
	{
		this.update();
		if(this.type == 'table')
			this.essence.setTable(table);
		return this;
	}
	this.setSize = function(cw,ch,cmw,cmh)
	{
		this.update();
		if(this.type == 'table')
			this.essence.setSize(cw,ch,cmw,cmh);
		return this;
	}
	this.setCells =function(cells)
	{
		this.update();
		if(this.type == 'table')
			this.essence.setCells(cells);
		return this;
	}
	this.tryReady = function()
	{
		if(this.essence.ready == 1) {
			this.ready = 1;
			this.layer.tryReady();
		}
	}
	this.addAnimation = function(name,row,frames,speed)
	{
		this.essence.addAnimation(name,row,frames,speed);
		return this;
	}
	this.runAnimation = function(name,iter)
	{
		this.update();
		this.essence.runAnimation(name,iter);
		return this;
	}
	this.stopAnimation = function()
	{
		this.update();
		this.essence.stopAnimation();
		return this;
	}
	this.moveTo = function(x,y,time)
	{
		this.update();
		var interval = this.layer.parent.options['interval'];
		this.start_time = this.layer.parent.time;
		var dx = this.essence.x - x;
		var dy = this.essence.y - y;
		this.vx = -(dx/time) * interval;
		this.vy = -(dy/time) * interval;
		this.iter = Math.round(time / interval);
		return this;
	}
	
	this.rotate = function(angle,time)
	{
		this.update();
		var dangle = this.angle - angle;
		var interval = this.layer.parent.options['interval'];
		this.vangle = (dangle/time) * interval;
		this.a_iter = Math.round(time / interval);
		return this;
	}
	
	this.fillRect = function(x,y,w,h)
	{
		if(this.type == 'drawing')
		{
			this.essence.type = 'fillRect';
			this.essence.x = x;
			this.essence.y = y;
			this.essence.w = w;
			this.essence.h = h;
		}
		return this;
	}
	
	this.update = function()
	{
		this.layer.update();
	}
	this.chechUpdate = function()
	{
		if(this.iter > 0 || this.a_iter > 0) {
			this.update();
			return true;
		}
		if(this.essence.chechUpdate())
			return true;
		return false;
	}
	this.draw = function()
	{
		if(this.iter > 0)
		{
			this.essence.x += this.vx;
			this.essence.y += this.vy;
			this.iter--;
		}
		
		if(this.time != this.layer.parent.time)
		{
			if(this.a_iter > 0)
			{
				this.angle -= this.vangle;
				this.a_iter--;
			}
		}
		if(this.angle)
		{
			this.layer.getCtx().save();
			//console.info(this.essence.gx()+this.essence.w/2, this.essence.gy()+this.essence.h/2);
			this.layer.getCtx().translate(this.essence.gx()+this.essence.w/2, this.essence.gy()+this.essence.h/2);
			this.layer.getCtx().rotate(-Math.PI*(this.angle/180));
			this.was_r['x'] = this.essence.x; 
			this.was_r['y'] = this.essence.y; 
			this.essence.x = -(this.essence.w/2);
			this.essence.y = -(this.essence.h/2);
		}
		this.essence.draw();
		
		if(this.angle)
		{
			this.essence.x = this.was_r['x'];
			this.essence.y = this.was_r['y'];
			this.was_r = [];
			//this.object.layer.getCtx().rotate(Math.PI*(this.angle/180));
			this.layer.getCtx().restore();
		}//*/
		this.time = this.layer.parent.time;
	}
}
/*
;//*/