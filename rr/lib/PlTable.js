
function Pl_table(obj)
{
	this.x = 0;
	this.y = 0;
	this.w = 0;
	this.h = 0;
	this.cmh = 0;
	this.cmw = 0;
	this.cw = 24;
	this.ch = 24;
	this.ctx = obj.layer.getCtx();
	this.object = obj;
	this.ready = 1;
	this.table = [];
	this.cells = [];
	this.attrs = [];
	
	this.gx = function()
	{
		return this.x + this.object.layer.x;
	}
	this.gy = function()
	{
		return this.y + this.object.layer.y;
	}
	this.setTable = function(arr)
	{
		this.table = arr;
		this.w = this.table.length * this.cw + this.table.length * this.cmw * 2;
		this.h = this.table[0].length * this.ch + this.table[0].length * this.cmh * 2;
	}
	this.setSize = function(cw,ch,cmw,cmh)
	{
		if(cw) this.cw = cw;
		if(ch) this.ch = ch;
		if(cmw) this.cmw = cmw;
		if(cmh) this.cmh = cmh;
	}
	this.setCells = function(arr)
	{
		for(var key in arr)
		{
			if(typeof(arr[key]) == 'string')  
			{
				this.attrs[key] = arr[key];
				this.cells[key] = function(table,x,y,key){
					var was = table.ctx.fillStyle;
					table.ctx.fillStyle = table.attrs[key];
					table.ctx.fillRect(x, y, table.cw, table.ch);
					table.ctx.fillStyle = was; 
				}
			}
			else if(typeof(arr[key]) == 'function')
			{
				this.cells[key] = arr[key];
			}
			else if(typeof(arr[key]) == 'object')
			{
				this.attrs[key] = arr[key];
				this.cells[key] = function(table,x,y,key){table.attrs[key].setXY(x,y);table.attrs[key].draw()};
			}
		}
	}
	this.drawType = function(type,x,y)
	{
		if(this.cells[type])
		{
		
				//console.info(this.cells[type]);
			this.cells[type](this,x,y,type);
		}
		else
		{
			this.ctx.fillRect(x, y, this.cw, this.ch);
		}
	}
	this.update = function()
	{
		this.object.update();
	}
	this.chechUpdate = function()
	{
		
	}
	this.draw = function()
	{
		var x = this.x + this.cmw;
		var y = this.y + this.cmh;
		for(var a_key in this.table)
		{
			for(var b_key in this.table[a_key])
			{
				this.drawType(this.table[a_key][b_key],x,y);
				x = x + this.cw + this.cmw * 2;
			}
			x = this.x + this.cmw;
			y = y + this.ch + this.cmh * 2;
		}
		/*
		if(!this.w && !this.h)
		{
			this.object.layer.getCtx()drawImage(this.img, this.x, this.y);
		}
		else if(!this.sw && !this.sh && !this.sx && !this.sy)
		{
			this.object.layer.getCtx().drawImage(this.img, this.x, this.y,this.w,this.h);
		}
		else
		{
			this.object.layer.getCtx().drawImage(this.img,this.sx,this.sy,this.sw,this.sh, this.x, this.y,this.w,this.h);
		}//*/
	}
}