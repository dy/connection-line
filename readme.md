**&lt;connection-line&gt;** is a simple way to draw connector line between any two DOM-elements.
For given targets _a_ and _b_, it draws smooth connection curve according to properties.
It does not make any sense as a model, it is just a renderer.

[![npm install connection-line](https://nodei.co/npm/connection-line.png?mini=true)](https://npmjs.org/package/connection-line/)

Use as a custom element:

`browserify -r connection-line -o bundle.js`

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
	to: '.b'
});

document.body.appendChild(connector.element);

//call update() when content has changed
window.addEventListener('resize', function () {
	connector.update();
});
```