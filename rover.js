function Rover() {

	var location = [0, 0];
	var direction = null; // W, N, E, S
	var routation = null; // ex: ['L','R','M']
	var situation = 'waiting'; // waiting, ready, running, done
	var doneCallback = null;

	this.setLocation = function(x,y) {
		location = [x, y];
		return this;
	};

	this.setDirection = function(_direction) {
		direction = _direction;
		return this;
	};

	this.setRoutation = function(_routation) {
		routation = _routation;
		return this;
	};

	this.setSituation = function(_situation) {
		situation = _situation;
		return this;
	};

	this.getLocation = function() {
		return location;
	};

	this.getRoutation = function() {
		return routation;
	};

	this.getDirection = function() {
		return direction;
	};

	this.getSituation = function() {
		return situation;
	};

	this.start = function(_doneCallback) {
		this.setSituation('running');

		if(_doneCallback) {
			doneCallback = _doneCallback;
		}

		var command = this.getRoutation().shift();

		if(!command) {
			doneCallback(this);
			this.setSituation('done');

		} else if(command == 'L') {
			this.turnLeft();
		} else if(command == 'R') {
			this.turnRight();
		} else if(command == 'M') {
			this.forward();
		} else {
			// error output
		}

		return this;
	};

	this.turnLeft = function(){
		var directionList = ['W','N','E','S'];
		var newDirection = directionList.indexOf(this.getDirection()) - 1;
		newDirection < 0 && (newDirection = 3);
		this.setDirection(directionList[newDirection]);

		this.start();
	};
	
	this.turnRight = function(){
		var directionList = ['W','N','E','S'];
		var newDirection = directionList.indexOf(this.getDirection()) + 1;
		newDirection > 3 && (newDirection = 0);
		this.setDirection(directionList[newDirection]);

		this.start();
	};
	
	this.forward = function(){

		var direction = this.getDirection(); 
		var location = this.getLocation();
		var routeList = {
			'W': [-1, 0],
			'E': [1, 0],
			'S': [0, -1],
			'N': [0, 1],
		};

		this.setLocation(location[0] + routeList[direction][0],
			location[1] + routeList[direction][1]);

		// progress time 
		setTimeout(this.start.bind(this), 200);		
	};

}

function RoverManager() {

	this.roverQueue = [];
	this.plateauCoord = null;
	this.currentRover = null;
	this.runningRover = false;

	var fnOutput = null;
	
	this.input = function(message){
		try {
			this.parseMessage(message);
		} catch (e) {
			this.output(e);
		}

		return this;
	};

	this.output = function(param) {
		if(typeof param == "function")
			fnOutput = param;
		else
			fnOutput(param);

		return this;
	};

	this.parseMessage = function(message) {

		if (!validateMessage(message)) {
			throw "message text unsupported";
		}

		if(this.plateauCoord == null) {
			var parameters = message.split(' ');
			this.plateauCoord = [
				parameters[0],
				parameters[1]
			];
			return;
		}

		this.buildRover(message);
	};


	this.buildRover = function(message){

		if (!this.currentRover) {
			var parameters = message.split(' ');

			this.currentRover = new Rover()
				.setLocation(Number(parameters[0]), Number(parameters[1]))
				.setDirection(parameters[2]);
			return;
		}

		this.roverStarter(this.currentRover
			.setRoutation(message.split(''))
			.setSituation('ready'));
	}

	this.roverStarter = function(rover) {

		if(rover.getSituation() == 'ready') {
			if(!this.runningRover) {
				rover.start(this.roverStarter.bind(this));
				this.runningRover = true;
			}
			this.roverQueue.push(rover);
			this.currentRover = null;
			return true;
		}

		this.runningRover = false;
		this.output(this.getRoverOutput(rover));

		this.roverQueue.find(function(rover){
			return rover.getSituation() == 'ready' && this.roverStarter(rover);
		}.bind(this));
	}

	this.getRoverOutput = function(rover) {
		return rover.getLocation()[0] + ' ' + rover.getLocation()[1] + ' ' + rover.getDirection(); 
	};

	var validateMessage = function(message) {
		// validation processes
		return true;
	}
}









