//
//	imageSlider.js
//

var ImageSlider = function () {

	// Options
	var config = {
		spacing			: [0], 			// List of nav list indexes
		labels			: ['',''], 	// List of nav list names
		slideSpeed	: 500,			// Slide transition duration
		loopSpeed		: 5000			// Loop duration
	};

	var currIndex = 0;
	var numImages = 0;
	var timer = 0;

	var images = [];
	var navLists = [];

	// Element class name constants
	var CLASSNAME = {
		GALLERY: 'slider-gallery',
		WRAPPER: 'gallery-wrapper',
		HOLDER: 'gallery-holder',
		ARROW_NEXT: 'gallery-arrow next',
		ARROW_PREV: 'gallery-arrow prev',
		NAV: 'slider-nav',
		LIST: 'nav-list',
		LABEL: 'nav-label',
		SPACING: 'nav-spacing',
		DOT: 'nav-dot',
		DOT_SELECT: 'nav-dot select'
	};

	/**
	 *	Helper function for checking valid spacing input
	 */
	var isValidSpacing = function() {
		for(var i = 0; i < config.spacing.length-1; i++){
			if(config.spacing[i] < 0 ||
			   config.spacing[i+1] <= config.spacing[i]) {
				return false;
			}
		}
		return true;
	}

	/**
	 *	Helper function for finding the correct nav list
	 */
	var indexMap = function (index) {
		for(var i = 0; i < config.spacing.length; i++){
			if(index < config.spacing[i]) {
				return i;
			}
		}
		return i;
	}

	/**
	 *	Animates image transition
	 */
	var updateImage = function (newIndex) {
		var holder = images[0].parentElement; // Parent div of images
		var position = -(100 / numImages) * newIndex + '%';

		if(window.jQuery){
			$.Velocity.animate(holder, {translateX: position}, config.slideSpeed);
		} else {
			Velocity(holder, {translateX: position}, config.slideSpeed);
		}
	};

	/**
	 *	Selects a new nav
	 */
	var updateNav = function (newIndex) {
		if (newIndex < 0 || newIndex >= numImages) {
			console.log('Invalid index out of bounds');
			return;
		}

		if(navLists.length > 0){
			// Calculates indices of currIndex, unselect dot
			var navIndex = indexMap(currIndex);
			var dotIndex = (navIndex > 0) ? currIndex-config.spacing[navIndex-1]+1 : currIndex+1;
			navLists[navIndex].children[dotIndex].className = CLASSNAME.DOT;

			// Calculates indices of newIndex, select dot
			navIndex = indexMap(newIndex);
			dotIndex = (navIndex > 0) ? newIndex-config.spacing[navIndex-1]+1 : newIndex+1;
			navLists[navIndex].children[dotIndex].className = CLASSNAME.DOT_SELECT;
		}
	};

	/**
	 *	Updates image and nav dots
	 */
	var update = function (newIndex, loop) {
		if (newIndex < 0 || newIndex >= numImages) {
			console.log('Invalid index, out of bounds');
			return;
		}
		updateImage(newIndex);
		updateNav(newIndex);
		currIndex = newIndex;

		// Resets loop if running
		if (!loop && timer !== 0) {
			startLoop();
		}
	};

	var createNavDot = function (index) {
		var dot = document.createElement('div');
		dot.className = CLASSNAME.DOT;
		dot.addEventListener('click', function () {
			update(index);
		});
		return dot;
	};

	var createNavList = function (text) {
		var list = document.createElement('div');
		var label = document.createElement('div');
		list.className = CLASSNAME.LIST;
		label.className = CLASSNAME.LABEL;
		if(text) {
			label.appendChild(document.createTextNode(text));
		}
		list.appendChild(label);
		return list;
	};

	var createNav = function () {
		var nav = document.createElement('nav');
		nav.className = CLASSNAME.NAV;

		// Checks for valid input
		if(!isValidSpacing()) {
			console.log('Invalid slider input, please check the data attributes.\n \"data-spacing\" is a comma separated list of ascending integers.\n \"data-labels\" is a comma separated list of strings.');
			return nav;
		}

		// Appends spacers and nav lists in specified order
		var posIndex = -1; 	// Account for 0 spacing
		var spaceIndex = 0;
		for(var i = 0; i < (config.spacing.length*2) + 1; i++){
			if( config.spacing.length == 0 ||								// No spacing specified
				  spaceIndex >= config.spacing.length || 			// Last nav list
				  posIndex < config.spacing[spaceIndex] ) { 	// Before spacer
				var navList = createNavList(config.labels[spaceIndex]);
				nav.appendChild(navList);
				navLists.push(navList);
				posIndex = config.spacing[spaceIndex]
			} else {
				var navSpacing = document.createElement('div');
				navSpacing.className = CLASSNAME.SPACING;
				nav.appendChild(navSpacing);
				spaceIndex++;
			}
		}

		// Adds dots to nav lists
		for (var i = 0; i < numImages; i++) {
			var dot = createNavDot(i);
			var index = indexMap(i);
			navLists[index].appendChild(dot);
		}

		return nav;
	};

	var createGalleryArrows = function (gallery) {
		var next = document.createElement('div');
		var prev = document.createElement('div');
		next.className = CLASSNAME.ARROW_NEXT;
		prev.className = CLASSNAME.ARROW_PREV;
		next.addEventListener('click', nextSlide);
		prev.addEventListener('click', prevSlide);
		return [next, prev];
	};

	var createGallery = function (slider) {
		var gallery = document.createElement('div');
		var wrapper = document.createElement('div');
		var holder = document.createElement('div');
		var arrows = createGalleryArrows();
		gallery.className = CLASSNAME.GALLERY;
		wrapper.className = CLASSNAME.WRAPPER;
		holder.className = CLASSNAME.HOLDER;

		// Initialize gallery images
		var imageFrag = document.createDocumentFragment();
		for (var i = 0; i < numImages; i++) {
			var image = slider.children[0];
			imageFrag.appendChild(image);
			image.style.width = 100 / numImages + '%'; // Responsive image width
			image.style.display = 'block'; // Show images
			image.addEventListener('click', nextSlide);
		}
		holder.style.width = 100 * numImages + '%';		// Responsive slide transitions

		gallery.appendChild(wrapper);
		gallery.appendChild(arrows[0]);
		gallery.appendChild(arrows[1]);
		wrapper.appendChild(holder);
		holder.appendChild(imageFrag);
		images = holder.children; // Saves images

		return gallery;
	};

	/**
	 *	Starts loop for slide advance
	 */
	var startLoop = function () {
		stopLoop();
		timer = setInterval(nextSlide, config.loopSpeed);
	};

	/**
	 *	Clears and resets timer
	 */
	var stopLoop = function () {
		clearInterval(timer);
		timer = 0;
	};

	/**
	 *	Advances to next slide
	 */
	var nextSlide = function () {
		var nextIndex = (currIndex + 1) % numImages;
		update(nextIndex);
	}

	/**
	 *	Advances to previous slide
	 */
	var prevSlide = function () {
		var prevIndex = ((currIndex - 1) + numImages) % numImages;
		update(prevIndex);
	}

	/**
	 *	Gets and removes config variables from data attributes
	 */
	var initConfig = function (slider) {
		var spacingInput = slider.dataset.spacing;
		var labelsInput = slider.dataset.labels;
		config.spacing = spacingInput ? spacingInput.split(',') : [];
		config.labels = labelsInput ? labelsInput.split(',') : [];
		slider.removeAttribute('data-spacing');
		slider.removeAttribute('data-labels');
	};

	/**
	 *	Populates DOM with gallery and nav, adds event listeners
	 */
	var initSlide = function (slider) {
		initConfig(slider);
		numImages = slider.children.length;

		var gallery = createGallery(slider); // Create gallery element
		var nav = createNav(); // Create nav element
		slider.appendChild(gallery);
		slider.appendChild(nav);

		// Swipe on screens
		if(Hammer){
			var mc = new Hammer(slider);
			mc.on('swipeleft', function(ev) {
				nextSlide();
			});
			mc.on('swiperight', function(ev) {
				prevSlide();
			});
		}

		update(0); // Selects the first image
	};

	/**
	 *	Public methods
	 */
	return {
		init		: initSlide,
		start		: startLoop,
		stop		: stopLoop,
		next		: nextSlide,
		prev		: prevSlide
	};

};
