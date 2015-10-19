/**
 * Connector web-element
 *
 * @module connector/element
 */

var Connector = require('connection-line');


var ConnectorProto = Object.create(HTMLElement.prototype);


/**
 * Create connector controller
 */
ConnectorProto.createdCallback = function () {
	this.connector = Connector({
		element: this
	});

	this.connector.update();
};


/**
 * Update on being attached
 */
ConnectorProto.attachedCallback = function () {
	var self = this;
	setTimeout(function () {
	self.connector.update();

	})
};


/**
 * Provide update method
 */
ConnectorProto.update = function () {
	this.connector.update();
};


document.registerElement('connection-line', {
	prototype: ConnectorProto
});