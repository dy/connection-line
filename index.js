/**
 * Connection-line element controller
 *
 * @module connection-line
 */

var extend = require('xtend/mutable');
var offset = require('mucss/offset');
var camel = require('mustring/camel');
var Rect = require('mucss/rect');


/**
 * Create connection-line element controller
 *
 * @constructor
 *
 * @param {Object} properties Options to init
 */
function Connector (properties) {
	if (!(this instanceof Connector)) return new Connector(properties);

	//read attributes of an element once
	if (properties.element) {
		for (var i = 0, l = properties.element.attributes.length; i < l; i++) {
			var attribute = properties.element.attributes[i];
			var name = camel(attribute.name);
			if (properties[name] === undefined) {
				properties[name] = attribute.value;
			}
		}
	}

	//take over options
	extend(this, properties);

	this.ns = 'http://www.w3.org/2000/svg';

	//ensure element
	if (!this.element) {
		//FIXME: this element may fail in IE etc
		this.element = document.createElement('connection-line');
	}

	//create path
	this.svg = document.createElementNS(this.ns, 'svg');
	this.path = document.createElementNS(this.ns, 'path');
	this.path.style.stroke = this.lineColor;
	this.path.style.fill = 'transparent';
	this.path.style.strokeWidth = this.lineWidth;

	//create marks
	this.lineEndEl = document.createElement('span');
	this.lineStartEl = document.createElement('span');
	this.lineMiddleEl = document.createElement('span');
	this.lineEndEl.className = 'connection-line-end';
	this.lineStartEl.className = 'connection-line-start';
	this.lineMiddleEl.className = 'connection-line-mark';
	this.lineEndEl.innerHTML = this.lineEnd;
	this.lineStartEl.innerHTML = this.lineStart;
	this.lineMiddleEl.innerHTML = this.lineMiddle;

	this.svg.appendChild(this.path);
	this.element.appendChild(this.svg);
	this.element.appendChild(this.lineEndEl);
	this.element.appendChild(this.lineStartEl);
	this.element.appendChild(this.lineMiddleEl);

	//set proper connector attributes
	this.update();
}


/**
 * Source/target element or coordinates
 */
Connector.prototype.from = [0, 0];
Connector.prototype.to = [100, 100];


/**
 * Display labels on top of the connector, e. g. →, ✘ or ✔
 */
Connector.prototype.lineEnd = '➤';
Connector.prototype.lineStart = '';
Connector.prototype.lineMiddle = '';


/**
 * Line style options
 */
Connector.prototype.lineWidth = 1;
Connector.prototype.lineColor = 'black';


/**
 * Curvature displays style of rendering
 * 1 - smooth curve
 * 0 - straight line
 */
Connector.prototype.smoothness = 1;


/**
 * Padding - the area around the target
 * to let connections with the opposite directions take place
 */
Connector.prototype.padding = 20;


/**
 * Initial directions, by default undefined
 */
Connector.prototype.fromDirection;
Connector.prototype.toDirection;


/**
 * Update position, according to the selectors, if any
 */
Connector.prototype.update = function () {
	var self = this;

	//no sense to update detached element
	if (!this.element.parentNode) return;

	//get target offsets
	var from = getOffset(this.from);
	var to = getOffset(this.to);


	//absolute size rect, covering both from and to
	//FIXME: add margins
	var size = Rect(
		Math.min(to.left, from.left) - this.padding,
		Math.min(to.top, from.top) - this.padding,
		Math.max(to.right, from.right) + this.padding,
		Math.max(to.bottom, from.bottom) + this.padding
	);

	//FIXME: set z-index lower than the both targets

	//ensure element size
	this.svg.setAttribute('width', Math.max(size.width, this.lineWidth));
	this.svg.setAttribute('height', Math.max(size.height, this.lineWidth));

	//calculate needed parent offsets
	var parentOffset = Rect();
	if (this.element.offsetParent && (this.element.offsetParent !== document.body) && this.element.offsetParent !== document.documentElement) {
		parentOffset = offset(this.element.offsetParent);
	}

	//place self so to fit space between source and target
	this.element.style.top = size.top - parentOffset.top + 'px';
	this.element.style.left = size.left - parentOffset.left + 'px';

	//centers of masses - relative coords
	var fromCenter = [
		from.left + from.width/2 - size.left,
		from.top + from.height/2 - size.top
	];
	var toCenter = [
		to.left + to.width/2 - size.left,
		to.top + to.height/2 - size.top
	];

	//detect dominant direction vector based on centers of masses
	var mainV = [
		toCenter[0] - fromCenter[0],
		toCenter[1] - fromCenter[1]
	];

	var angle = Math.atan2(-mainV[1], mainV[0]);
	var Pi = Math.PI;
	if (angle < 0) {
		angle += Pi*2;
	}

	//if initial directions are not specified - detect based on angle
	var fromDirection = this.fromDirection || (
		angle < Pi/4 ? 'right' :
		angle < 3*Pi/4 ? 'top' :
		angle < 5*Pi/4 ? 'left' :
		angle < 7*Pi/4 ? 'bottom' : 'right');
	var toDirection = this.toDirection || (
		angle < Pi/4 ? 'left' :
		angle < 3*Pi/4 ? 'bottom' :
		angle < 5*Pi/4 ? 'right' :
		angle < 7*Pi/4 ? 'top' : 'left');

	//calculate start/end points from base directions
	//express in relative coords
	var start0 = getDirectionCoords(fromDirection, from, size);
	var end0 = getDirectionCoords(toDirection, to, size);
	var center = [
		(end0[0] + start0[0]) / 2,
		(end0[1] + start0[1]) / 2
	];

	//direction coefs
	var dirCoef = {
		top: -1,
		bottom: 1,
		left: -1,
		right: 1
	};

	//form path from 3-parts (most difficult case)
	//at first align initial directions around the targets
	//then - draw through the central point
	var start1 = [
		toUnit(start0[0] - fromCenter[0]) * this.padding + start0[0],
		toUnit(start0[1] - fromCenter[1]) * this.padding + start0[1]
	];
	var end1 = [
		toUnit(end0[0] - toCenter[0]) * this.padding + end0[0],
		toUnit(end0[1] - toCenter[1]) * this.padding + end0[1]
	];

	//if in/out directions are over the corner - ensure that corner
	var start2;

	//form path
	var path = 'M ' + start0[0] + ' ' + start0[1] + ' ' +
	'C ' + start1[0] + ' ' + start1[1] + ' ' +
	end1[0] + ' ' + end1[1] + ' ' +
	end0[0] + ' ' + end0[1];

	//set path coords
	this.path.setAttribute('d', path);

	//correct position of marks

	var leSize = [this.lineEndEl.clientWidth, this.lineEndEl.clientHeight];
	var lsSize = [this.lineStartEl.clientWidth, this.lineStartEl.clientHeight];
	var lmSize = [this.lineMiddleEl.clientWidth, this.lineMiddleEl.clientHeight];
	this.lineEndEl.style.left = end0[0] - leSize[0]/2 + 'px';
	this.lineEndEl.style.top = end0[1] - leSize[1]/2 + 'px';
	this.lineStartEl.style.left = start0[0] - lsSize[0]/2 + 'px';
	this.lineStartEl.style.top = start0[1] - lsSize[1]/2 + 'px';
	this.lineMiddleEl.style.left = center[0] - lmSize[0]/2 + 'px';
	this.lineMiddleEl.style.top = center[1] - lmSize[1]/2 + 'px';

	//rotate the marks properly
	var len = this.path.getTotalLength();
	var start = this.path.getPointAtLength(0);
	var startNext = this.path.getPointAtLength(lsSize[0]/2);
	var end = this.path.getPointAtLength(len);
	var endNext = this.path.getPointAtLength(len-leSize[0]/2);
	var startAngle = Math.atan2(startNext.y - start.y, startNext.x - start.x);
	var endAngle = Math.atan2(-endNext.y + end.y, -endNext.x + end.x);
	this.lineEndEl.style.transform = 'rotate(' + endAngle.toFixed(2) + 'rad)';
	this.lineStartEl.style.transform = 'rotate(' + startAngle.toFixed(2) + 'rad)';


	//map diff to a 0..1 coef
	function toUnit (value) {
		return value > 0 ? 1 : value < 0 ? -1 : 0;
	}

	//return coords from the direction
	function getDirectionCoords (direction, rect, size) {
		var coords = [0,0];

		switch (direction) {
			case 'top':
				coords[0] = rect.left + rect.width/2 - size.left;
				coords[1] = rect.top - size.top;
				break;
			case 'bottom':
				coords[0] = rect.left + rect.width/2 - size.left;
				coords[1] = rect.bottom - size.top;
				break;
			case 'left':
				coords[0] = rect.left - size.left;
				coords[1] = rect.top + rect.height/2 - size.top;
				break;
			case 'right':
				coords[0] = rect.right - size.left;
				coords[1] = rect.top + rect.height/2 - size.top;
				break;
		}

		return coords;
	}

	//return absolute offset for a target
	function getOffset (target) {
		if (target instanceof Array) {
			return Rect(target[0], target[1], target[2], target[3]);
		}

		if (typeof target === 'string') {
			//`100, 200` - coords relative to offsetParent
			if ((coords = target.split(/\s*,\s*/)).length === 2) {
				return Rect(parseInt(coords[0]), parseInt(coords[1]));
			}

			//`.selector` - calc selected target coords relative to offset parent
			target = document.querySelector(target);
		}

		if (!target) {
			return Rect();
		}

		return offset(target);
	}
};


module.exports = Connector;