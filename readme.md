**&lt;connection-line&gt;** is a simple way to draw connector line between any two DOM-elements.
For given targets _a_ and _b_, it draws smooth connection curve according to properties.
It does not make any sense as a model, it is just a renderer.

[![npm install connection-line](https://nodei.co/npm/connection-line.png?mini=true)](https://npmjs.org/package/connection-line/)

Use as a custom element:

`$ browserify -r connection-line -o bundle.js`

```html
<script src="./bundle.js"></script>
<link rel="import" href="./node_modules/connection-line"/>

<div id="a"></div>
<div id="b"></div>

<connection-line from="#a" to="#b"></connection-line>
<connection-line from="0,0" to="100,100"></connection-line>
```

or as a separate module:

```js
var Connector = require('connection-line');

var connector = new Connector({
	//selector, element or array with relative coords
	from: [0, 0],
	to: '.b',

	//smoothness of a line, 0 - straight line, 1 - smooth line
	smoothness: 0.5,

	//symbols on the line start/end/center
	lineEnd: '➜',
	lineStart: '•',
	lineMiddle: '✘',

	//force initial directions. By default the best one is chosen
	fromDirection: 'top',
	toDirection: 'bottom',

	//padding around the targets for initial direction
	padding: 20
});

document.body.appendChild(connector.element);

//call update() when content has changed
window.addEventListener('resize', function () {
	connector.update();
});
```

## Alternatives

* [perfect-arrows](https://github.com/steveruizok/perfect-arrows)
