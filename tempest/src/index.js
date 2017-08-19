import React from 'react';
import ReactDOM from 'react-dom';

var C = {}
C.radPerDeg = Math.PI / 180;

// Constants for Z-coordinates.
// When in normal play, the grid starts at 20 and goes down another 120.
C.startDepth = 20;
C.depth = 120;
C.endDepth = C.startDepth + C.depth;
C.fogDepth = C.startDepth * 2;
// Margin to account for when drawing the grid. Grid unit length.
C.gridMargin = 1.05;
// A constant used in converting grid twist into grid units, or some such. :S
C.gridTwistFactor = 1 / 32;
// The starting distance of the grid as we fly in.
C.flyInStart = 2 * C.depth;
// The Z-distance to advance the grid per frame.
C.flyInAdvance = 8;

class Level extends React.Component {
	constructor(info) {
		super();
		this.state = {
			coords: [],
			wraps: true, 
			twist: [0,45],
			angles: [165, -21, -21, -21, -27, -21, -21, -21, -27, -21, -21, -21, -27, -21, -21, -21 ]
		};
		
  		this.twist = [this.state.twist[0] * C.gridTwistFactor, this.state.twist[1] * C.gridTwistFactor];
  		 
		var levelInfo = {
		 	coords: [], adjacents: [], angle: 0,
		    x: 0, y: 0, radians: null,// State.
		    xmin: 0, xmax: 0, ymin: 0, ymax: 0
		}; 

		// Initialize array sizes.
		levelInfo.coords[this.state.angles.length-1]  = null;
		levelInfo.adjacents[this.state.angles.length] = null;
	  	

		for (var i = 0; i < this.state.angles.length; i++) {
	    // Store current position.
			levelInfo.coords[i] = [levelInfo.x, levelInfo.y];
			levelInfo.xmin = Math.min(levelInfo.x, levelInfo.xmin);
			levelInfo.xmax = Math.max(levelInfo.x, levelInfo.xmax);
			levelInfo.ymin = Math.min(levelInfo.y, levelInfo.ymin);
			levelInfo.ymax = Math.max(levelInfo.y, levelInfo.ymax);

			// Iterate around the grid.
			levelInfo.angle += this.state.angles[i];
			// Normalize the angle.
			while (levelInfo.angle < 0) { levelInfo.angle += 360; }
				levelInfo.angle %= 360;

			// Calculate the coordinates.
			levelInfo.radians = levelInfo.angle * C.radPerDeg;
			levelInfo.x += Math.cos(levelInfo.radians); levelInfo.y -= Math.sin(levelInfo.radians);
			levelInfo.adjacents[i] = [levelInfo.angle, null];
		}
		if (this.state.wraps) {
		    // -1 signifies a closing segment, used in #draw
		    levelInfo.coords[i] = levelInfo.coords[0].concat([-1]);
		    levelInfo.adjacents[i] = levelInfo.adjacents[0];
  		}
  		else {
	    	levelInfo.coords[i] = [levelInfo.x, levelInfo.y];
	    	levelInfo.adjacents[i] = [null, null];
	    	levelInfo.xmin = Math.min(levelInfo.x, levelInfo.xmin); levelInfo.xmax = Math.max(levelInfo.x, levelInfo.xmax);
			levelInfo.ymin = Math.min(levelInfo.y, levelInfo.ymin); levelInfo.ymax = Math.max(levelInfo.y, levelInfo.ymax);
		}
		for (i = 0; i < levelInfo.adjacents.length; i++) {
	    	var previous = (i !== 0) ? i - 1 : levelInfo.adjacents.length - 1;
	    	levelInfo.adjacents[i][1] = (180 + levelInfo.adjacents[previous][0]) % 360;
	  	}

		// Add margins to the boundaries.
		levelInfo.xmin -= C.gridMargin; levelInfo.xmax += C.gridMargin;
		levelInfo.ymin -= C.gridMargin; levelInfo.ymax += C.gridMargin;

		// Account for twist, by twisting the boundaries we just calculated as if they were at the back
		  // of the grid. Then maximimze between our original and these new boundaries.
		var factor = C.startDepth / C.endDepth;
		levelInfo.xmin = Math.min(levelInfo.xmin, (levelInfo.xmin - this.twist[0]) * factor + this.twist[0]);
		levelInfo.xmax = Math.max(levelInfo.xmax, (levelInfo.xmax - this.twist[0]) * factor + this.twist[0]);
		levelInfo.ymin = Math.min(levelInfo.ymin, (levelInfo.ymin - this.twist[1]) * factor + this.twist[1]);
		levelInfo.ymax = Math.max(levelInfo.ymax, (levelInfo.ymax - this.twist[1]) * factor + this.twist[1]);

		// Calculate the total size, including margins.
		this.size = [levelInfo.xmax - levelInfo.xmin, levelInfo.ymax - levelInfo.ymin];
		var translation = [-(levelInfo.xmin + levelInfo.xmax) / 2, -(levelInfo.ymin + levelInfo.ymax) / 2];
		for (i = 0; i < levelInfo.coords.length; i++) {
			levelInfo.coords[i][0] += translation[0];
			levelInfo.coords[i][1] += translation[1];
		}
		  // Store coordinates.
		this.coords = levelInfo.coords;
		this.adjacents = levelInfo.adjacents;
		this.numLanes = this.coords.length - 1;

		// Initialize.
		this.color = [255, 255, 255];
		this.scoords = [];
		this.scoords[this.coords.length - 1] = null; // Initialize array size.
		//this.setDistance(0);
	}

	render(){
		/*var style = 'rgb('+this.color[0]+','+this.color[1]+','+this.color[2]+')';
		c.fillStyle = style;
		c.strokeStyle = style;
		c.lineWidth = 0.01;

		c.globalAlpha = 0.03 * this.alphaFactor;
		c.beginPath();
		this.drawArea();
		c.fill();

		c.globalAlpha = this.alphaFactor;
		c.beginPath();
		this.drawLanes();
		c.stroke();
		// Assumption: the original +globalAlpha+ was already +alphaFactor+
		*/
		return (<div class="coords">{this.coords}</div>);
	}
}
ReactDOM.render(
  <Level />,
  document.getElementById('root')
);
