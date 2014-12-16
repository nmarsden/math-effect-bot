function Layer(name,index,pulsar)
{
	this.index = index;
	this.name = name;
	this.objects = [];
	this.supporting_objects = [];
	this.parent = pulsar;
	this.ready = 1;
	this.x = pulsar.options['width']/2;
	this.y = pulsar.options['height']/2;
	this.updated = 1;
	this.ctx;
	this.tag;
	
	this.start_time = 0;
	this.vx = 0;
	this.vy = 0;
	this.iter = 0;
	this.a_iter = 0;
	this.angle = 0;
	this.vangle = 0;
	this.time = 0;
	this.was_r = [];
	
	this.getCtx = function()
	{
		if(this.ctx) return this.ctx;
		else return this.parent.ctx;
	}
	this.clear = function()
	{	
		var w = this.parent.options['width'];
		var h = this.parent.options['height'];
		this.getCtx().clearRect(-w,-h,w*2,h*2);
	}
	
	this.setIndex = function (index)
	{
		if(this.parent.layers[index] != undefined)
		{
			return false;
		}
		else
		{
			this.update();
			this.parent.layers[index] = this;
			delete this.parent.layers[this.index];
			this.index = index;
			if(this.parent.is_multi_canvas == 1)
			{
				this.tag.style.zIndex = index;
			}
		}
		return this;
	}
	
	this.addObject = function (name,type,is_supporting)
	{
		if(typeof(type) == 'string')
		{
			if(!is_supporting)
			{
				if(name)
				{
					this.objects[name] = new PlObject(name,type,this);
					return this.objects[name];
				}
				else 
				{
					this.objects[this.objects.length+1] = new PlObject(name,type,this);
					return this.objects[this.objects.length];
				}
			}
			else
			{
				this.update();
				this.supporting_objects[name] = new PlObject(name,type,this);
				return this.supporting_objects[name];
			}
		}
		else if(typeof(type) == 'object')
		{
			if(!is_supporting)
			{
				this.objects[name] = type.clone();
				//this.objects[name].ready = 1;
				//this.objects[name].essence.ready = 1;
				return this.objects[name];
			}
			else
			{
				this.supporting_objects[name] =  type.clone();
				//this.supporting_objects[name].ready = 1;
				//this.supporting_objects[name].essence.ready = 1;
				return this.supporting_objects[name];
			}
		}
	}
	
	this.getObject =function(name) 
	{
		if(this.objects[name]) return this.objects[name];
		else if(this.supporting_objects[name]) return this.supporting_objects[name];
	}
	this.moveTo = function(x,y,time)
	{
		if(!time) console.error('U mast set time for function moveTo');
		this.update();
		var interval = this.parent.options['interval'];
		this.start_time = this.parent.time;
		var dx = this.x - x;
		var dy = this.y - y;
		this.vx = -(dx/time) * interval;
		this.vy = -(dy/time) * interval;
		this.iter = Math.round(time / interval);
		//this.getCtx().translate(this.x, this.y);
		return this;
	}
	this.rotate = function(angle,time)
	{
		this.update();
		var dangle = this.angle - angle;
		var interval = this.parent.options['interval'];
		this.vangle = (dangle/time) * interval;
		this.a_iter = Math.round(time / interval);
		return this;
	}
	this.tryReady = function()
	{
		for( o in this.objects)
		{
			if(this.objects[o].ready != 1)
			{
				this.ready = 0;
				return false;
			}
		}
		for( o in this.supporting_objects)
		{
			if(this.supporting_objects[o].ready != 1)
			{
				this.ready = 0;
				return false;
			}
		}
		
		this.ready = 1;
		this.parent.tryReady();
		return this;
	}
	this.update = function()
	{
		this.updated = 1;
	}
	this.chechUpdate = function()
	{
		if(this.updated != 1)
		{
			if(this.iter > 0)
			{
				this.update();
				return true;
			}
			if(this.a_iter > 0)
			{
				this.update();
				return true;
			}
			for( o in this.objects)
			{
				if(this.objects[o].chechUpdate())
				return true;
			}
			for( o in this.supporting_objects)
			{
				if(this.supporting_objects[o].chechUpdate())
				return true;
			}
		}
	}
	this.draw = function ()
	{
		this.chechUpdate();
		if(this.updated == 1)
		{
			this.clear();
			if(this.iter > 0)
			{
				this.x += this.vx;
				this.y += this.vy;
				this.iter--;
				//console.info(this.x, this.y);
				
			}
			if(this.time != this.parent.time)
			{
				if(this.a_iter > 0)
				{
					this.angle -= this.vangle;
					this.a_iter--;
				}
			}
			this.getCtx().translate(this.x, this.y);
			if(this.angle)
			{
				//this.getCtx().save();
				//console.info(Math.round(this.x+this.w/2), Math.round(this.y+this.h/2));
				//this.getCtx().translate(this.x+this.parent.options['width']/2, this.y+this.parent.options['height']/2);
				this.getCtx().rotate(-Math.PI*(this.angle/180));
				//this.was_r['x'] = this.x; 
				//this.was_r['y'] = this.y; 
				//this.x = -(this.parent.options['width']/2);
				//this.y = -(this.parent.options['height']/2);
			}
			
			for( o in this.objects)
			{
				this.objects[o].draw();
			}
			if(this.angle)
			{
				//this.x = this.was_r['x'];
				//this.y = this.was_r['y'];
				//this.was_r = [];
				//this.object.layer.getCtx().rotate(Math.PI*(this.angle/180));
				this.getCtx().rotate(Math.PI*(this.angle/180));
				//this.getCtx().translate(0,0);
			}
			this.getCtx().translate(-this.x, -this.y);
		}
		this.updated = 0;
		
	}
}

