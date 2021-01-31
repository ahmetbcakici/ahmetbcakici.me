/**
 *
 */
var init = function() {

	//	Initialize image sliders
	var imageElements = document.getElementsByClassName('image-slider');
	for(var i = 0; i < imageElements.length; i++) {
		var slider = new ImageSlider();
		slider.init(imageElements[i]);
	}

	//	Initialize tab sliders
	var tabElements = document.getElementsByClassName('tab-slider');
	for(var i = 0; i < tabElements.length; i++) {
		var slider = new TabSlider();				// Create new Slider object
		slider.init(tabElements[i]);		// Initialize it with HTML element
	}

	//	Initialize nav sliders
	var navElements = document.getElementsByClassName('nav-link');
	var portfolioElements = document.getElementsByClassName('portfolio-item');
	for(var i = 0; i < navElements.length; i++) {
		(function(index){
			navElements[index].addEventListener('click', function() {
				var target = ( index == 0 ) ? document.body : portfolioElements[index-1];
				if(window.jQuery) {
					$(target).velocity('scroll', { duration: 800 });
				} else {
					Velocity(target, 'scroll', { duration: 800 });
				}
			});
		})(i);
	}
};

init();
