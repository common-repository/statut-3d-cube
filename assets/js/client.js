function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _objectSpread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {
        };
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _defineProperty(target, key, source[key]);
        });
    }
    return target;
}
function S3DCClient() {
    this.ROTATE_SPEED_DEFAULT = 0.01;
    this.ROTATE_SPEED_HOVER = 0.001;
    this.rotateSpeed = this.ROTATE_SPEED_DEFAULT;
    this.prevEvent = null;
    // Raycaster class is used for pointer picking
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(10, 10);
    this.isDragging = false;
    this.isCubeHovered = false;
    this.preventClick = false;
    this.intersects = [];
    this.links = [];
    this.options = {
    };
    this.isTouchScreen = 'ontouchstart' in document.documentElement ? true : false;
    // Select and handle <div> with the cube dataset
    this.handleDatasets = function() {
        var node = document.querySelector('.s3dc-dataset');
        if (node) {
            this.options = _objectSpread({
            }, node.dataset);
            this.options.antialiasing = this.toBoolean(this.options.antialiasing);
            this.options.clickable = this.toBoolean(this.options.clickable);
            this.createScene(node);
            this.createCube();
            this.createLighting();
            this.createShadow();
            this.addEventListeners();
            // Manualy set renderer size and aspect ratio  
            this.handleResize();
            // Start render loop
            this.render();
            if (this.options.clickable) {
                this.handleLinks();
            }
        }
    };
    this.handlePointerDown = function(e) {
        this.isDragging = true;
        this.preventClick = false;
        this.prevEvent = e;
    };
    this.handlePointerUp = function() {
        this.isDragging = false;
    };
    this.handleContextMenu = function(e) {
        e.preventDefault();
        e.stopPropagation();
    };
    this.handlePointerMove = function(e) {
        var rect = this.canvas.getBoundingClientRect();
        var ref = e.touches ? e.touches[0] : e, clientX = ref.clientX, clientY = ref.clientY;
        this.preventClick = true;
        if (this.isDragging && this.prevEvent) {
            // Calculate horizontal distance
            var prevX = e.touches ? this.prevEvent.touches[0].clientX : this.prevEvent.clientX;
            var distanceX = clientX - prevX;
            this.prevEvent = e;
            this.cube.rotation.y += distanceX / 100;
        }
        // Calculate pointer position for raycasting
        this.pointer.x = (clientX - rect.left) / this.canvas.clientWidth * 2 - 1;
        this.pointer.y = -(clientY - rect.top) / this.canvas.clientHeight * 2 + 1;
    };
    this.handleClick = function() {
        var intersection = this.intersects[0];
        if (!intersection) return;
        var url = this.links[intersection.face.materialIndex];
        var target = this.options.target;
        if (!this.preventClick && target && url && url.length > 0) {
            window.open(url, target);
        }
    };
    this.handleResize = function() {
        this.camera.aspect = this.wrapper.clientWidth / this.wrapper.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.wrapper.clientWidth, this.wrapper.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
    };
    this.createScene = function(node) {
        this.wrapper = node;
        this.wrapper.className = 's3dc-cube-wrapper';
        this.canvas = document.createElement("canvas");
        this.wrapper.appendChild(this.canvas);
        var renderOptions = {
            antialias: this.options.antialiasing,
            canvas: this.canvas,
            alpha: true
        };
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer(renderOptions);
        this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
        this.camera.position.z = 11;
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    };
    this.addEventListeners = function() {
        var pressDown, pressUp, move;
        if (this.isTouchScreen) {
            pressDown = 'touchstart';
            pressUp = 'touchend';
            move = 'touchmove';
        } else {
            pressDown = 'mousedown';
            pressUp = 'mouseup';
            move = 'mousemove';
        }
        this.canvas.addEventListener('oncontextmenu', this.handleContextMenu.bind(this));
        this.wrapper.addEventListener('click', this.handleClick.bind(this));
        this.wrapper.addEventListener(pressDown, this.handlePointerDown.bind(this));
        document.addEventListener(pressUp, this.handlePointerUp.bind(this));
        document.addEventListener(move, this.handlePointerMove.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
    };
    this.createShadow = function() {
        var image = new window.Image();
        var map = new THREE.Texture();
        map.image = image;
        image.src = window.s3dcShadow;
        image.onload = function() {
            return map.needsUpdate = true;
        };
        var geometry = new THREE.PlaneGeometry(6, 6);
        var material = new THREE.MeshBasicMaterial({
            map: map
        });
        var shadow = new THREE.Mesh(geometry, material);
        shadow.position.set(0, -0.1, -3.3);
        this.scene.add(shadow);
    };
    this.createLighting = function() {
        var ambientLight = new THREE.AmbientLight(16777215, 0.6);
        var targetLight = new THREE.PointLight(16777215, 0.5, 0);
        targetLight.position.set(0, 0, 40);
        this.scene.add(ambientLight, targetLight);
    };
    this.createCube = function() {
        var textures = [
            // Right
            this.options.side2,
            // Left
            this.options.side4,
            // Top (currently use front side image)
            this.options.side1,
            //this.options.side5,
            // Bottom (currently use front side image)
            this.options.side1,
            //this.options.side6,
            // Front
            this.options.side1,
            // Back
            this.options.side3, 
        ];
        var geometry = new THREE.BoxGeometry(3, 3, 3);
        var materials = textures.map((function(src) {
            var texture = new THREE.TextureLoader().load(src, (function(texture1) {
                this.cover(texture1);
            }).bind(this));
            return new THREE.MeshLambertMaterial({
                map: texture,
                // Set emission properties for hover effects
                emissive: 16777215,
                emissiveIntensity: 0
            });
        }).bind(this));
        this.cube = new THREE.Mesh(geometry, materials);
        this.scene.add(this.cube);
    };
    // Render loop
    this.render = function() {
        // Auto rotate cube if the user doesn't interact with it
        if (!this.isDragging) {
            this.cube.rotation.y -= this.rotateSpeed;
            this.cube.rotation.x -= this.cube.rotation.x / 50;
        }
        // Use raycaster only if the cube is clickable
        if (this.options.clickable) {
            // Update the picking ray with the camera and pointer position
            this.raycaster.setFromCamera(this.pointer, this.camera);
            // Calculate if the cube intersecting the picking ray
            this.intersects = this.raycaster.intersectObject(this.cube);
            !this.isTouchScreen && this.handleIntersects();
        }
        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame((function() {
            return this.render();
        }).bind(this));
    };
    this.handleIntersects = function() {
        var intersection = this.intersects[0];
        if (intersection) {
            if (!this.isCubeHovered) {
                this.handleCubeHover();
            }
            // Get the index of the material, which determines the cube side which was pointed by the user
            var _face = intersection.face, materialIndex = _face.materialIndex;
            // Iterate over the cube materials and show the hover and reset animations
            this.cube.material.forEach((function(material, index) {
                if (index === materialIndex && !material.isHovered) {
                    this.handleMaterialHover(material);
                } else if (index !== materialIndex && material.isHovered) {
                    this.resetMaterialHover(material);
                }
            }).bind(this));
        } else if (this.isCubeHovered) {
            this.resetCubeHover();
        }
    };
    this.handleCubeHover = function() {
        this.isCubeHovered = true;
        TweenMax.to(this, 0.5, {
            rotateSpeed: this.ROTATE_SPEED_HOVER,
            overwrite: true
        });
    };
    this.resetCubeHover = function() {
        this.isCubeHovered = false;
        TweenMax.to(this, 0.9, {
            rotateSpeed: this.ROTATE_SPEED_DEFAULT,
            overwrite: true
        });
        this.cube.material.forEach((function(material) {
            return this.resetMaterialHover(material);
        }).bind(this));
    };
    this.handleMaterialHover = function(material) {
        material.isHovered = true;
        TweenMax.to(material.map.offset, 0.2, {
            y: -0.05,
            overwrite: true
        });
        TweenMax.to(material, 0.2, {
            emissiveIntensity: 0.1,
            overwrite: true
        });
    };
    this.resetMaterialHover = function(material) {
        material.isHovered = false;
        TweenMax.to(material.map.offset, 0.2, {
            y: 0,
            overwrite: true
        });
        TweenMax.to(material, 0.5, {
            emissiveIntensity: 0,
            overwrite: true
        });
    };
    // Correct aspect ratio, tiling and centering of the texture
    this.cover = function(texture, param) {
        var aspect = param === void 0 ? 1 : param;
        var imageAspect = texture.image.width / texture.image.height;
        if (aspect < imageAspect) {
            texture.repeat.set(aspect / imageAspect, 1);
        } else {
            texture.repeat.set(1, imageAspect / aspect);
        }
        texture.wrapT = THREE.MirroredRepeatWrapping;
        texture.center.set(0.5, 0.5);
    };
    this.handleLinks = function() {
        this.links = [
            // Right
            this.options.link2,
            // Left
            this.options.link4,
            // Top
            this.options.link5,
            // Bottom
            this.options.link6,
            // Front
            this.options.link1,
            // Back
            this.options.link3, 
        ];
    };
    this.toBoolean = function(value) {
        return value === '1' ? true : false;
    };
    this.handleDatasets();
}
jQuery(document).ready(function() {
    return new S3DCClient();
});

