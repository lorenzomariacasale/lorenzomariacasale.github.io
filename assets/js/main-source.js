/* ==========================================================================
   jQuery plugin settings and other scripts
   ========================================================================== */

// Wait for jQuery to load, then wait for DOM ready
jQuery(document).ready(function($) {
  // Detect user's system preference
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Function to update theme UI (icon and tooltip)
  var updateThemeUI = function(theme) {
    if (theme === "dark") {
      $("#theme-icon").removeClass("fa-sun").addClass("fa-moon");
      $("#theme-icon").attr("title", "Switch to Light Mode");
    } else {
      $("#theme-icon").removeClass("fa-moon").addClass("fa-sun");
      $("#theme-icon").attr("title", "Switch to Dark Mode");
    }
  };

  // Function to apply theme to the page
  var applyTheme = function(theme) {
    if (theme === "dark") {
      $("html").attr("data-theme", "dark");
    } else {
      $("html").removeAttr("data-theme");
    }
    updateThemeUI(theme);
  };

  // Function to get current effective theme
  var getCurrentTheme = function() {
    // Priority: 1) localStorage override, 2) system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme;
    }
    return systemPrefersDark ? "dark" : "light";
  };

  // Initialize theme on page load
  var initializeTheme = function() {
    const currentTheme = getCurrentTheme();
    applyTheme(currentTheme);
    console.log("Initialized theme:", currentTheme, "System prefers dark:", systemPrefersDark);
  };

  // Initialize the theme
  initializeTheme();

  // Listen for system theme changes (only if user hasn't manually overridden)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener("change", function(e) {
    // Only follow system changes if user hasn't set a manual preference
    if (!localStorage.getItem("theme")) {
      const newTheme = e.matches ? "dark" : "light";
      applyTheme(newTheme);
      console.log("System theme changed to:", newTheme);
    }
  });

  // Manual theme toggle
  var toggleTheme = function() {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    // Save user's manual preference
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
    
    console.log("Theme manually toggled to:", newTheme);
  };

  // Bind the toggle function to the button
  $('#theme-toggle').on('click', toggleTheme);

  // These should be the same as the settings in _variables.scss
  const scssLarge = 925; // pixels

  // Sticky footer
  var bumpIt = function () {
    $("body").css("margin-bottom", $(".page__footer").outerHeight(true));
  },
    didResize = false;

  bumpIt();

  $(window).resize(function () {
    didResize = true;
  });
  setInterval(function () {
    if (didResize) {
      didResize = false;
      bumpIt();
    }
  }, 250);

  // FitVids init
  fitvids();

  // Follow menu drop down
  $(".author__urls-wrapper button").on("click", function () {
    $(".author__urls").fadeToggle("fast", function () { });
    $(".author__urls-wrapper button").toggleClass("open");
  });

  // Restore the follow menu if toggled on a window resize
  jQuery(window).on('resize', function () {
    if ($('.author__urls.social-icons').css('display') == 'none' && $(window).width() >= scssLarge) {
      $(".author__urls").css('display', 'block')
    }
  });

  // init smooth scroll, this needs to be slightly more than then fixed masthead height
  $("a").smoothScroll({ 
    offset: -75, // needs to match $masthead-height
    preventDefault: false,
  }); 

  // add lightbox class to all image links
  // Add "image-popup" to links ending in image extensions,
  // but skip any <a> that already contains an <img>
  $("a[href$='.jpg'],\
  a[href$='.jpeg'],\
  a[href$='.JPG'],\
  a[href$='.png'],\
  a[href$='.gif'],\
  a[href$='.webp']")
      .not(':has(img)')
      .addClass("image-popup");

  // 1) Wrap every <p><img> (except emoji images) in an <a> pointing at the image, and give it the lightbox class
  $('p > img').not('.emoji').each(function() {
    var $img = $(this);
    // skip if it's already wrapped in an <a.image-popup>
    if ( ! $img.parent().is('a.image-popup') ) {
      $('<a>')
        .addClass('image-popup')
        .attr('href', $img.attr('src'))
        .insertBefore($img)   // place the <a> right before the <img>
        .append($img);        // move the <img> into the <a>
    }
  });

  // Magnific-Popup options
  $(".image-popup").magnificPopup({
    type: 'image',
    tLoading: 'Loading image #%curr%...',
    gallery: {
      enabled: true,
      navigateByImgClick: true,
      preload: [0, 1] // Will preload 0 - before current, and 1 after the current image
    },
    image: {
      tError: '<a href="%url%">Image #%curr%</a> could not be loaded.',
    },
    removalDelay: 500, // Delay in milliseconds before popup is removed
    // Class that is added to body when popup is open.
    // make it a bit more fancy:
    mainClass: 'mfp-zoom-in',
    callbacks: {
      beforeOpen: function() {
        // just a hack that adds mfp-anim class to markup 
        this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
      }
    },
    closeOnContentClick: true,
    midClick: true // allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source.
  });
}); // End of jQuery document ready wrapper