/**
 * Connection-line element controller
 *
 * @module connection-line
 */

var extend = require('xtend/mutable');
var offset = require('mucss/offset');
var camel = require('mustring/camel');


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
Connector.prototype.curvature = 1;


/**
 * Update position, according to the selectors, if any
 */
Connector.prototype.update = function () {
	var self = this;

	//no sense to update detached element
	if (!this.element.parentNode) return;

	//get target offsets
	var from = getCoords(this.from);
	var to = getCoords(this.to);

	//set size so to fit distance
	var size = [Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1])];

	this.svg.setAttribute('width', Math.max(size[0], this.lineWidth));
	this.svg.setAttribute('height', Math.max(size[1], this.lineWidth));

	//detect h/v directions
	var isTop = to[1] < from[1];
	var isRight = to[0] > from[0];

	//correct target offset
	this.element.style.left = Math.min(to[0], from[0]) + 'px';
	this.element.style.top = Math.min(to[1], from[1]) + 'px';

	//form path
	var c = [size[0]/2 * this.curvature, size[1]/2 * this.curvature];
	var path = 'M ' + (isRight ? 0 : size[0]) + ' ' + (isTop ? size[1] : 0) + ' ' +
	'C ' + (isRight ? c[0] : size[0] - c[0]) + ' ' + (isTop ? size[1] : 0) + ' ' +
	(isRight ? size[0] - c[0] : c[0]) + ' ' + (isTop ? 0 : size[1]) + ' ' +
	(isRight ? size[0] : 0) + ' ' + (isTop ? 0 : size[1]);

	//set path coords
	this.path.setAttribute('d', path);

	//correct position of marks
	var leSize = [this.lineEndEl.clientWidth, this.lineEndEl.clientHeight];
	var lsSize = [this.lineStartEl.clientWidth, this.lineStartEl.clientHeight];
	var lmSize = [this.lineMiddleEl.clientWidth, this.lineMiddleEl.clientHeight];
	this.lineEndEl.style.top = (isTop ? 0 : size[1]) - leSize[1]/2 + 'px';
	this.lineEndEl.style.left = (isRight ? size[0] : 0) - leSize[0]/2 + 'px';
	this.lineStartEl.style.top = (isTop ? size[1] : 0) - lsSize[1]/2 + 'px';
	this.lineStartEl.style.left = (isRight ? 0 : size[0]) - lsSize[0]/2 + 'px';
	this.lineMiddleEl.style.top = size[1]/2 - lmSize[1]/2 + 'px';
	this.lineMiddleEl.style.left = size[0]/2 - lmSize[0]/2 + 'px';

	//rotate the marks properly
	var len = this.path.getTotalLength();
	var start = this.path.getPointAtLength(0);
	var start1 = this.path.getPointAtLength(lsSize[0]/2);
	var end = this.path.getPointAtLength(len);
	var end1 = this.path.getPointAtLength(len-leSize[0]/2);
	var startAngle = Math.atan2(start1.y - start.y, start1.x - start.x);
	var endAngle = Math.atan2(-end1.y + end.y, -end1.x + end.x);
	this.lineEndEl.style.transform = 'rotate(' + endAngle.toFixed(2) + 'rad)';
	this.lineStartEl.style.transform = 'rotate(' + startAngle.toFixed(2) + 'rad)';


	//return absolute offset for a target
	function getCoords (target) {
		if (target instanceof Array) {
			return target;
		}

		if (typeof target === 'string') {
			//`100, 200` - coords relative to offsetParent
			if ((coords = target.split(/\s*,\s*/)).length === 2) {
				return [parseInt(coords[0]), parseInt(coords[1])];
			}

			//`.selector` - calc selected target coords relative to offset parent
			target = document.querySelector(target);
		}

		if (!target) {
			return [0, 0];
		}

		var targetOffset = offset(target);
		var parent = self.element.offsetParent || self.element.parentNode;
		var parentOffset = offset(parent);

		return [
			targetOffset.left + targetOffset.width/2 - parentOffset.left,
			targetOffset.top + targetOffset.height/2 - parentOffset.top
		];
	}
};


module.exports = Connector;