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

	this.update();

	var self = this;

	if (document.readyState !== 'complete') {
		document.addEventListener('readystatechange', function () {
			self.update();
		});
	}
};


ConnectorProto.attachedCallback = function () {
	this.update();
};


/** Update wrapper, for convenience */
ConnectorProto.update = function () {
	this.connector.update();
};


document.registerElement('connection-line', {
	prototype: ConnectorProto
});