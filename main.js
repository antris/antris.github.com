var setColors;

(function() {
	var DEBUG = false;
	var REMOTE = !DEBUG;
	var ready = false;
	var pageTitle = document.getElementsByTagName('h1')[0].innerText;
	var links = [];
	var linksElement = document.getElementById('links');
	var key, LiElem, AnchorElem;
	for (key in linksElement.children) {
		if (linksElement.children[key].constructor === HTMLLIElement) {
			elem = linksElement.children[key];
			AnchorElem = elem.getElementsByTagName('a')[0];
			links.push({
				text: AnchorElem.innerText,
				url: AnchorElem.href
			});
		}
	}
	console.log(pageTitle);
	console.log(links);


	var colors = [];
	var bgColor;
	var planeColor;
	var cubeColors
	var cubes, plane, renderer;

	setColors = function(input) {
		colors = input.map(function(color) {
			return parseInt(color, 16);
		});

		bgColor = colors[0];
		planeColor = colors[1];
		cubeColors = colors.slice(2);

		if (!ready) {
			ready = true;
			APPInit();
		} else {
			plane.material.color.setHex(planeColor);
			renderer.setClearColorHex(bgColor, 1.0);
		}
		_.each(cubes, function(cube, index) {
			cube.mesh.material.color.setHex(cubeColors[index % cubeColors.length]);
		});
	};


	var APPInit = function() {
		renderer = new THREE.WebGLRenderer({ antialias: true });

		// Canvas dimensions
		var width = document.body.clientWidth;
		var height = document.body.clientHeight;

		renderer.setSize(
			width,
			height
		);
		renderer.setClearColorHex(bgColor, 1.0);
	    renderer.clear();
	    var camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
	    camera.position.y = 150;
		camera.position.z = 300;

		var scene = new THREE.Scene();

		// Create cubes
		cubes = _.range(20);
		cubes = _.map(cubes, function(index) {
			var mesh = new THREE.Mesh(
		        new THREE.CubeGeometry(50, 50, 50),
		        new THREE.MeshLambertMaterial()
	        );
			mesh.scale.x = 0.1;
			mesh.scale.y = 0.1;
			mesh.scale.z = 0.1;
	    	mesh.castShadow = true;
	    	mesh.receiveShadow = true;
			return {
				index: index,
				mesh: mesh
			}
		});

        var light = new THREE.SpotLight();
	    light.position.set(170, 330, -160);
	    renderer.shadowMapEnabled = true;
	    light.castShadow = true;
	    var planeGeo = new THREE.PlaneGeometry(2000, 1000, 10, 10);
		var planeMat = new THREE.MeshLambertMaterial({color: planeColor });
		plane = new THREE.Mesh(planeGeo, planeMat);
		plane.rotation.x = 4.5;
		plane.position.y = -68;
		plane.receiveShadow = true;

		// Add everything to scene
        scene.add(camera);
        _.each(cubes, function(cube) {
        	scene.add(cube.mesh);
        });
	    scene.add(light);
		scene.add(plane);
		document.body.appendChild(renderer.domElement);
	    camera.lookAt(scene.position);

	    var vars = {
	    	factor: {
	    		x: 940,
	    		y: 1020,
	    		z: 317
	    	},
	    	multiplier: {
	    		x: 120,
	    		y: 50,
	    		z: 90
	    	}
	    };

		var gui = new dat.GUI();
		var actions = {
			getColors: getColors
		};
		gui.add(actions, 'getColors');
	    if (DEBUG) {
			gui.add(plane.rotation, 'x').min(0.1).max(10).step(0.025);
		    gui.add(plane.position, 'y', -200, 200, 10);
		    gui.add(vars.factor, 'x').min(0).max(1500).step(10);
			gui.add(vars.factor, 'y').min(0).max(1500).step(10);
			gui.add(vars.factor, 'z').min(0).max(1500).step(10);
		    gui.add(vars.multiplier, 'x').min(0).max(150).step(1);
			gui.add(vars.multiplier, 'y').min(0).max(150).step(1);
			gui.add(vars.multiplier, 'z').min(0).max(150).step(1);
	    }

		function animate(t) {
			var ct;
			_.each(cubes, function(cube) {
				ct = t + cube.index * 200;
				cube.mesh.position.x = Math.cos(ct/vars.factor.x) * vars.multiplier.x;
	  			cube.mesh.position.y = Math.sin(ct/vars.factor.y) * vars.multiplier.y + 60;
				cube.mesh.position.z = Math.sin(ct/vars.factor.z) * vars.multiplier.z;
	  			cube.mesh.rotation.x = ct/500;
	  			cube.mesh.rotation.y = ct/800;
	  			cube.mesh.scale.x = 0.2 + Math.sin(ct / 1000) * 0.1;
	  			cube.mesh.scale.y = 0.2 + Math.sin(ct / 1000) * 0.1;
	  			cube.mesh.scale.z = 0.2 + Math.sin(ct / 1000) * 0.1;
			});
	        renderer.render(scene, camera);
	        window.requestAnimationFrame(animate, renderer.domElement);
	    };
	    animate(new Date().getTime());
	};

	var getColors = function() {
		var JSONPScript = document.createElement('script');
		JSONPScript.src = 'http://www.colourlovers.com/api/palettes/random?jsonCallback=catchPalette';
		document.body.appendChild(JSONPScript);
	};

	if (REMOTE) {
		getColors();
	} else {
		setColors({
			colors: [
				'695E50',
				'577A5F',
				'BEC428',
				'9571B8',
				'BE87F1'
			]
		});
	}
}());

// JSONP callback for getting a palette from colourlovers API
var catchPalette = function(arr) {
	console.log('got colors ' + arr[0].colors.join(' '));
	setColors(arr[0].colors);
};