(function() {
    var DEBUG = false;
    var REMOTE = !DEBUG;
    var ready = false;

    var colors = [0,0,0,0,0];
    var newColors;
    var bgColor;
    var planeColor;
    var cubeColors
    var cubes, plane, renderer;
    var cubeConstants = {
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
    // Calculate the next hexadecimal number between a start value and an end value
    var tweenHex = function(start, end) {
        var pad = function(str, padStr, length) {
            while (str.length < length) {
                str = padStr + str;
            }
            return str;
        }
        var startHex = pad(start.toString(16), '0', 6);
        var endHex = pad(end.toString(16), '0', 6);
        var start = {
            r: parseInt(startHex.substr(0, 2), 16),
            g: parseInt(startHex.substr(2, 2), 16),
            b: parseInt(startHex.substr(4, 2), 16)
        };
        var end = {
            r: parseInt(endHex.substr(0, 2), 16),
            g: parseInt(endHex.substr(2, 2), 16),
            b: parseInt(endHex.substr(4, 2), 16)
        };
        var nudgeNumber = function(start, end) {
            if (start < end) {
                return start + 1;
            } else if (start > end) {
                return start - 1;
            } else {
                return end;
            }
        };
        var result = {
            r: pad(nudgeNumber(start.r, end.r).toString(16), '0', 2),
            g: pad(nudgeNumber(start.g, end.g).toString(16), '0', 2),
            b: pad(nudgeNumber(start.b, end.b).toString(16), '0', 2)
        };
        return parseInt(result.r + result.g + result.b, 16);
    };

    var setColors = function(input) {
        newColors = input;
        if (!ready) {
            ready = true;
            APPInit();
        }
    };

    var APPInit = function() {

        var width = document.body.clientWidth;
        var height = document.body.clientHeight;

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(
            width,
            height
        );
        renderer.setClearColorHex(bgColor, 1.0);
        renderer.clear();

        var camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
        camera.position.y = 150;
        camera.position.z = 300;

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

        // Make a scene!
        var scene = new THREE.Scene();
        scene.add(camera);
        _.each(cubes, function(cube) {
            scene.add(cube.mesh);
        });
        scene.add(light);
        scene.add(plane);
        camera.lookAt(scene.position);

        var actions = {
            getColors: getColors
        };

        function animate(t) {
            var ct;
            _.each(cubes, function(cube) {
                ct = t + cube.index * 200;
                cube.mesh.position.x = Math.cos(ct/cubeConstants.factor.x) * cubeConstants.multiplier.x;
                cube.mesh.position.y = Math.sin(ct/cubeConstants.factor.y) * cubeConstants.multiplier.y + 60;
                cube.mesh.position.z = Math.sin(ct/cubeConstants.factor.z) * cubeConstants.multiplier.z;
                cube.mesh.rotation.x = ct/500;
                cube.mesh.rotation.y = ct/800;
                cube.mesh.scale.x = 0.2 + Math.sin(ct / 1000) * 0.1;
                cube.mesh.scale.y = 0.2 + Math.sin(ct / 1000) * 0.1;
                cube.mesh.scale.z = 0.2 + Math.sin(ct / 1000) * 0.1;
            });
            if (!_.isEqual(colors, newColors)) {
                bgColor = colors[0] = tweenHex(colors[0], newColors[0]);
                planeColor = colors[1] = tweenHex(colors[1], newColors[1]);
                cubeColors = _.map(newColors.slice(2), function(color, index) {
                    return colors[index + 2] = tweenHex(colors[index + 2], color);
                });
                plane.material.color.setHex(planeColor);
                renderer.setClearColorHex(bgColor, 1.0);        
                _.each(cubes, function(cube, index) {
                    cube.mesh.material.color.setHex(cubeColors[index % cubeColors.length]);
                });
            }
            renderer.render(scene, camera);
            window.requestAnimationFrame(animate, renderer.domElement);
        };

        document.body.appendChild(renderer.domElement);
        animate(new Date().getTime());
    };

    var getColors = function() {
        var JSONPScript = document.createElement('script');
        JSONPScript.src = 'http://www.colourlovers.com/api/palettes/random?jsonCallback=catchPalette';
        document.body.appendChild(JSONPScript);
    };

    var repaintButton = document.getElementById('repaint');
    var repaintHandler = function(evt) {
        evt.preventDefault();
        getColors();
        repaintButton.onclick = null;
        this.innerHTML = 'Mixing paint...';
    };
    // JSONP callback for getting a palette from colourlovers API
    var catchPalette = window.catchPalette = function(arr) {
        setColors(arr[0].colors.map(function(color) {
            return parseInt(color, 16);
        }));
        repaintButton.innerHTML = 'Repaint!';
        repaintButton.onclick = repaintHandler;
    };

    if (REMOTE) {
        getColors();
    } else {
        setColors({
            colors: [6905424, 5732959, 12502056, 9793976, 12486641]
        });
    }

}());