/* *
	*
	* made by ilfate.=/[-7
	* started at 27.05.11
	*
	*/
	
	
function Pulsar(canvas,options)
{
	this.options = options;
	if(!this.options['interval']) this.options['interval'] = 10;
	if(!this.options['time_limit']) this.options['time_limit'] = 30;
	this.events = [];
	this.layers = [];
	this.func = [];
	this.time_func = [];
	this.ready = 0;
	this.start_on_ready = 0;
	this.id_interval = 0;
	this.time = 0;
	this.runing = 0;
	this.shutDown = false;
	//this.updated = 1;
	if(options['multi_canvas'])
	{
		this.is_multi_canvas = 1;
		this.div = document.getElementById(canvas);
		for( var attr in this.options)
		{
			if(attr != 'interval')
				this.div[attr] = this.options[attr];
		}
	}
	else
	{
		this.is_multi_canvas = 0;
		var tag = document.getElementById(canvas);
		for( var attr in this.options)
		{
			if(attr != 'interval')
				tag[attr] = this.options[attr];
		}
		this.ctx = tag.getContext('2d');
	}
	this.setOptions = function(options)
	{
		this.options = options;
	}
	
	this.addLayer = function(name,index)
	{
		if(this.layers[index] != undefined) 
		{
			console.error('Error layer creating');
			return false;
		}
		else
		{
			this.layers[index] = new Layer(name,index,this);
		}
		
		if(this.is_multi_canvas == 1)
		{
			var canvas_elem = document.createElement('canvas');
			canvas_elem.id = name;
			canvas_elem.className = "Pulsar_Canvas";
			canvas_elem.style.zIndex = index;
			this.div.appendChild(canvas_elem);
			for( var attr in this.options)
			{
				if(attr != 'interval')
					canvas_elem[attr] = this.options[attr];
			}
			this.layers[index].ctx = canvas_elem.getContext('2d');
			this.layers[index].tag = canvas_elem;
		}
		return this.layers[index];
	}
	this.getLayer = function(name){
		for( var key in this.layers )
		{
			if(this.layers[key].name == name)
			{
					return this.layers[key];
			}
		}
		return false;
	}
	this.tryReady = function()
	{//console.info(1);
		for( var key in this.layers )
		{
			if(this.layers[key].ready != 1)
			{
				//console.log(this.layers[key]);
				this.ready = 0;
				return false;
			}
		}
		this.ready = 1;
		if(this.start_on_ready == 1)
		{
			this.draw();
		}
		return this;
	}
	
	this.draw = function() {
		//console.info(this.ready);
		if(this.ready == 1)
		{
			//if(this.updated == 1)
			//{
				for( var key in this.layers )
				{
					//console.info(this.layers[key].name +' key='+ key);
					this.layers[key].draw();
				}
				//this.updated = 0;
			//}
			
			if(this.runing == 0) this.run(this);
		}else
		{
			this.start_on_ready = 1;
		}
	};
	this.run = function(pulsar)
	{
		this.runing = 1;
		this.id_interval = setInterval(function(){pulsar.update();},this.options['interval'])
	}
	this.addFunction = function(f)
	{
		this.func[this.func.length+1] = f;
		return this;
	}
	this.addTimeFunction = function(f,time)
	{
		this.time_func[time] = f;
		return this;
	}
	this.clearAll = function()
	{
		if(!this.is_multi_canvas)
		{
			this.ctx.clearRect(0,0,this.options['width'],this.options['height']);
		}
	}
	this.update = function()
	{
		this.time += this.options['interval'];
		if(this.time > this.options['time_limit']*1000 || this.shutDown) clearInterval(this.id_interval);
		for(var key in this.func)
		{
			this.func[key](this);
		}
		for(var key in this.time_func)
		{
			if(key <= this.time)
			{
				this.time_func[key](this);
				delete this.time_func[key];
			}
		}
		this.clearAll();
		this.draw();
	}
	
	
}






/*

function extend(Child, Parent) {
	var F = function() { }
	F.prototype = Parent.prototype
	Child.prototype = new F()
	Child.prototype.constructor = Child
	Child.superclass = Parent.prototype
}
//*/
