/**
 * <connection-line> custom element
 *
 * @module connector/element
 */


var Connector = require('connection-line');


var ConnectorProto = Object.create(HTMLElement.prototype);


ConnectorProto.createdCallback = function () {
	this.connector = Connector({
		element: this
	});

	this.connector.update();
};


ConnectorProto.attachedCallback = function () {
	this.connector.update();
};


/** Update wrapper, for convenience */
ConnectorProto.update = function () {
	this.connector.update();
};


document.registerElement('connection-line', {
	prototype: ConnectorProto
});