/**
 * Connector element
 *
 * @module connection-line
 */

var extend = require('xtend/mutable');
var offset = require('mucss/offset');


/**
 * @constructor
 *
 * @param {Object} properties Init options
 */
function Connector (properties) {
	if (!(this instanceof Connector)) return new Connector(properties);

	//read attributes of an element once
	if (properties.element) {
		for (var i = 0, l = properties.element.attributes.length; i < l; i++) {
			var attribute = properties.element.attributes[i];
			if (properties[attribute.name] === undefined) {
				properties[attribute.name] = attribute.value;
			}
		}
	}

	//take over options
	extend(this, properties);

	this.ns = 'http://www.w3.org/2000/svg';

	//ensure element
	if (!this.element) {
		this.element = document.createElement('connection-line');
	}

	//ensure element style
	this.element.style.position = 'absolute';
	this.element.style.minWidth = '20px';
	this.element.style.minHeight = '20px';

	//create path
	this.svg = document.createElementNS(this.ns, 'svg');
	this.path = document.createElementNS(this.ns, 'path');
	this.path.style.stroke = this.lineColor;
	this.path.style.fill = 'transparent';
	this.path.style.strokeWidth = this.lineWidth;

	this.svg.appendChild(this.path);
	this.element.appendChild(this.svg);

	//set proper connector attributes
	this.update();
}


/**
 * Preferred direction of connection.
 * horizontal, vertical or diagonal.
 * If undefined - it is picker automatically.
 */
Connector.prototype.orientation = 'horizontal';


/**
 * Source/target element or coordinates
 */
Connector.prototype.from = [0, 0];
Connector.prototype.to = [100, 100];


/**
 * Line style options
 */
Connector.prototype.lineEnd = '➤';
Connector.prototype.lineStart = '';
Connector.prototype.lineDash = '';
Connector.prototype.lineWidth = 1;
Connector.prototype.lineColor = 'black';


/**
 * Curvature displays style of rendering
 * 1 - smooth curve
 * 0 - straight line
 */
Connector.prototype.curvature = 0.5;


/**
 * Number of sections to split the curve.
 * 0 - straight line.
 * 1 - one-angle smooth transition.
 * 2 - elbow-connector
 * 3 - ...
 */
Connector.prototype.divisions = 1;


/**
 * Number of parallel lines
 */
Connector.prototype.channels = 1;


/**
 * Display swapped channels, e. g. {0: 1, 1: 0}
 */
Connector.prototype.swap = {};


/**
 * Display title of a connector
 */
Connector.prototype.title = '';


/**
 * Display status - a label on top of the connector
 */
Connector.prototype.modifier = '✔';


/**
 * Update position of connection
 */
Connector.prototype.update = function () {
	var self = this;

	//get target offsets
	var from = getCoords(this.from);
	var to = getCoords(this.to);

	//set size so to fit distance
	var size = [Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1])];

	this.element.style.width = size[0] + 'px';
	this.element.style.height = size[1] + 'px';
	this.svg.setAttribute('width', size[0]);
	this.svg.setAttribute('height', size[1]);

	//detect h/v directions
	var isTop = to[1] < from[1];
	var isRight = to[0] > from[0];

	//correct target offset
	this.element.style.left = Math.min(to[0], from[0]) + 'px';
	this.element.style.top = Math.min(to[1], from[1]) + 'px';

	//form path
	var c = [size[0]/2, size[1]/2];
	var path = 'M ' + (isRight ? 0 : size[0]) + ' ' + (isTop ? size[1] : 0) + ' ' +
	'C ' + c[0] + ' ' + (isTop ? size[1] : 0) + ' ' +
	c[0] + ' ' + (isTop ? 0 : size[1]) + ' ' +
	(isRight ? size[0] : 0) + ' ' + (isTop ? 0 : size[1]);


	//set path coords
	this.path.setAttribute('d', path);


	//return absolute offset for a target
	function getCoords (target) {
		var coords;
		if (typeof target === 'string') {
			//`100, 200` - coords relative to offsetParent
			if ((coords = target.split(/\s*,\s*/)).length === 2) {
				coords[0] = parseInt(coords[0]);
				coords[1] = parseInt(coords[1]);
			}
			//`.selector` - calc selected target coords relative to offset parent
			else {
				var target = document.querySelector(target);
				if (!target) {
					coords = [0, 0];
				}
				else {
					var targetOffset = offset(target);
					var parent = self.element.offsetParent || self.element.parentNode;
					var parentOffset = offset(parent);

					coords = [
						targetOffset.left + targetOffset.width/2 - parentOffset.left,
						targetOffset.top + targetOffset.height/2 - parentOffset.top
					];
				}
			}
		}
		else if (target instanceof Array) {
			coords = target;
		}
		return coords;
	}
};


/**
 * Render frame, e.g. animation, physics of movement etc
 */
Connector.prototype.render = function () {

};



module.exports = Connector;