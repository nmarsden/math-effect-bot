
function Pl_image(obj)
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
	this.object.layer.ready = 0;
	this.object.ready = 0;
	this.ready = 0;
	this.time;
	this.img = new Image();
	this.img.parent = this;
	this.img.onload =  function()
	{
		this.parent.ready = 1;
		this.parent.object.tryReady();
	}
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
	/*
	this.rotate = function(angle,time)
	{
		this.update();
		var dangle = this.angle - angle;
		var interval = this.object.layer.parent.options['interval'];
		this.vangle = (dangle/time) * interval;
		this.a_iter = Math.round(time / interval);
	}//*/
	this.update = function()
	{
		this.object.update();
	}
	this.chechUpdate = function()
	{
		if(this.animation_frame > 0) {
			this.update();
			return true;
		}
		if(this.animation_iters != 0){
			this.update();
			return true;
		}
		if(this.a_iter > 0)
		{
			this.update();
			return true;
		}
		return false;
	}
	this.draw = function()
	{
		/*
		if(this.time != this.object.layer.parent.time)
		{
			if(this.a_iter > 0)
			{
				this.angle -= this.vangle;
				this.a_iter--;
			}
			
		}
		
		if(this.angle)
		{
			this.object.layer.getCtx().save();
			//console.info(Math.round(this.x+this.w/2), Math.round(this.y+this.h/2));
			this.object.layer.getCtx().translate(this.x+this.w/2, this.y+this.h/2);
			this.object.layer.getCtx().rotate(-Math.PI*(this.angle/180));
			this.was_r['x'] = this.x; 
			this.was_r['y'] = this.y; 
			this.x = -(this.w/2);
			this.y = -(this.h/2);
		}//*/
		if(!this.w && !this.h)
		{
			this.object.layer.getCtx().drawImage(this.img, this.gx(), this.gy());
		}
		else if(!this.sw && !this.sh && !this.sx && !this.sy)
		{
			this.object.layer.getCtx().drawImage(this.img, this.gx(), this.gy(),this.w,this.h);
		}
		else
		{
			if(this.animation_frame > 0)
			{
				//console.error(this.animations[this.animation_name]['frames'],this.animation_frame);
				if(this.animation_frame != 1 && this.animation_frame <= this.animations[this.animation_name]['frames'])
				{
					this.sx = this.sw * (this.animation_frame - 1);
				}
				else if(this.animation_frame >= this.animations[this.animation_name]['frames'])
				{
					this.sy = this.was['sy'];
					this.sx = this.was['sx'];
					this.animation_frame = -1;
					this.was = [];
					if(this.animation_iters > 1  ) this.runAnimation(this.animation_name,this.animation_iters-1)
					else if(this.animation_iters < 0) this.runAnimation(this.animation_name,-1);
				}
				if(!this.animations[this.animation_name]['speed'][this.animation_frame-1]) 
				{//console.log(this.sy);
					this.animations[this.animation_name]['speed'][this.animation_frame-1] = 1;
				}
				if(this.animations[this.animation_name]['speed'][this.animation_frame-1] <= this.animation_frame_counter)
				{
					this.animation_frame++;
					this.animation_frame_counter=1;
				}
				else{
					this.animation_frame_counter++;
				}
				//console.info(this.sy,this.sx);
			}
			//console.info(this.sy);
			this.object.layer.getCtx().drawImage(this.img,this.sx,this.sy,this.sw,this.sh, this.gx(), this.gy(),this.w,this.h);
		}
		/*
		if(this.angle)
		{
			this.x = this.was_r['x'];
			this.y = this.was_r['y'];
			this.was_r = [];
			//this.object.layer.getCtx().rotate(Math.PI*(this.angle/180));
			this.object.layer.getCtx().restore();
		}//*/
		//this.time = this.object.layer.parent.time;
	}
}