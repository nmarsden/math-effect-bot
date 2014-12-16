
function Pl_drawing(obj)
{
	this.x = 0;
	this.y = 0;
	this.w = 0;
	this.h = 0;
	this.sx = 0;
	this.sy = 0;
	this.sw = 0;
	this.sh = 0;
	this.was = [];
	this.was_r = [];
	this.angle = 0;
	this.vangle = 0;
	this.animation_iters = 0;
	this.animation_frame = 0;
	this.animation_frame_counter = 1;
	this.animation_name = '';
	this.animations = [];
	this.object = obj;
	//this.object.layer.ready = 0;
	this.object.ready = 1;
	this.ready = 1;
	this.time;
	this.type;

	this.gx = function()
	{
		return this.x ;//+ this.object.layer.x;
	}
	this.gy = function()
	{
		return this.y ;//+ this.object.layer.y;
	}
	this.addAnimation = function(name,row,frames,speed)
	{
	if(!speed) var speed = [];
		this.animations[name] = {'row':row,'frames':frames,'speed':speed};
	}
	this.runAnimation = function(name,iter)
	{
		if(this.animations[name])
		{
			this.animation_name = name;
			this.was['sy'] = this.sy;
			this.was['sx'] = this.sx;
			this.sy = (this.animations[name]['row'] -1) * this.sh;
			this.sx = 0;
			this.animation_frame = 1;
			this.animation_iters = iter;
		}
		return this;
	}
	this.stopAnimation = function()
	{
		this.animation_iters = 0;
	}

	this.update = function()
	{
		this.object.update();
	}
	this.chechUpdate = function()
	{
		if(this.was['x'] != this.x || this.was['y'] != this.y || this.was['w'] != this.w || this.was['h'] != this.h)
		{
			
			this.was['x'] = this.x;
			this.was['y'] = this.y;
			this.was['w'] = this.w;
			this.was['h'] = this.h;
			this.update();
			return true;
		}
		return false;
	}
	this.draw = function()
	{
		if(this.type == 'fillRect')
		{
			this.object.layer.getCtx().fillRect(this.x, this.y, this.w, this.h);
		}
		
	}
}