import React from 'react';
import ReactDOM from 'react-dom';
var ReactPIXI = require('react-pixi');
var PIXI = require('pixi.js');


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

class LevelCoordinates extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			coords : [],
			adjacents : [],
			angles : props.angles
		}		
	}
	componentDidMount(){
		var coordsArray = [];
		var adjacentsArray = [];
		var x = 0, y = 0, xmin = 0, ymin = 0, angle = 0, radians = null, xmax = 0, ymax = 0;
		
		for (var i = 0; i < this.state.angles.length; i++) {
	    	// Store current position.
			coordsArray[i] = [x, y];
			xmin = Math.min(x, xmin);
			xmax = Math.max(x, xmax);
			ymin = Math.min(y, ymin);
			ymax = Math.max(y, ymax);
			
			// Iterate around the grid.
			angle += this.state.angles[i];
			// Normalize the angle.
			while (angle < 0) { angle += 360; }
				angle %= 360;
			// Calculate the coordinates.
			radians = angle * C.radPerDeg;
			x += Math.cos(radians); y -= Math.sin(radians);
			adjacentsArray[i] = [angle, null] 
		}

		if (this.state.wraps) {
		    // -1 signifies a closing segment, used in #draw
		    coordsArray[i] = coordsArray[0].concat([-1]);
		    adjacentsArray[i] = adjacentsArray[0];
  		}
  		else {
	    	coordsArray[i] = [x, y];
	    	adjacentsArray[i] = [null, null];
	    	xmin = Math.min(x, xmin); xmax = Math.max(x, xmax);
			ymin = Math.min(y, ymin); ymax = Math.max(y, ymax);
		}
		
		for (i = 0; i < adjacentsArray.length; i++) {
	    	var previous = (i !== 0) ? i - 1 : adjacentsArray.length - 1;
	    	adjacentsArray[i][1] = (180 + adjacentsArray[previous][0]) % 360;
	  	}
		this.setState({adjacentsArray : adjacentsArray, coordsArray: coordsArray});
	}
	render(){
		return (
			<div className="arrays">
			<ul><li className="adjacentsArray">{this.state.adjacentsArray}</li>
			<li className="coordsArray">{this.state.coordsArray}</li>
			</ul>
			</div>);
	}

}

class LevelCanvas extends React.Component {
	constructor(props) {
		super(props);
		this.state = {	
			coords: [],
			wraps: props.info.wraps, 
			twist: props.info.twist,
			angles: props.info.angles,
		};
	}
	render() {
		
		return (
				<div>
				BIG JABRONI
				<ul>
				<li>{this.state.angles}</li>
				</ul>
				<LevelCoordinates angles={this.state.angles}/>
				</div>
				);
		
	}
}


var I = {}
I.angles = [165, -21, -21, -21, -27, -21, -21, -21, -27, -21, -21, -21, -27, -21, -21, -21];
I.wraps = true; 
I.twist = [0, 45];
const element = <LevelCanvas info={I} />;
ReactDOM.render(
  element,
  document.getElementById('root')
);
/*
var Stage = ReactPIXI.Stage;
var Text = ReactPIXI.Text;

const ExampleStage = React.createClass({
  displayName: 'ExampleStage',
  render: function() {
    var fontstyle = {font:'40px Times'};
    return <Stage width={this.props.width} height={this.props.height}>
      <Text text="Vector text" x={this.props.xposition} y={10} style={fontstyle} anchor={new PIXI.Point(0.5,0)} key="1" />
    </Stage>;
  }
});

ReactDOM.render(
  ExampleStage,
  document.getElementById('pixistage')
);
*/
	/*		
		//rendering helper
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
	
	}*/


		/*
		return React.createElement('div', {className:'main'},
				[
					React.createElement(
					'div',
					{className:'coords'},
					null,
					this.coords),
					React.createElement(
					'div',
					{className:'scoords'},
					null,
					this.scoords)
				]
		);*/
	
