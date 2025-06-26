/* ==========================================================================
   jQuery plugin settings and other scripts
   ========================================================================== */

$(document).ready(function () {
  // Detect user's system preference
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Clean up any invalid localStorage values
  var cleanupThemeStorage = function() {
    const savedTheme = localStorage.getItem("theme");
    // If saved theme is not a valid value, remove it
    if (savedTheme && savedTheme !== "dark" && savedTheme !== "light") {
      console.log("Removing invalid theme preference:", savedTheme);
      localStorage.removeItem("theme");
    }
  };
  
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
    // If no saved preference, use system preference
    return systemPrefersDark ? "dark" : "light";
  };

  // Initialize theme on page load
  var initializeTheme = function() {
    cleanupThemeStorage(); // Clean up any invalid saved preferences
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
    // Get the current theme from the HTML element (what's actually applied)
    const htmlDataTheme = $("html").attr("data-theme");
    const currentTheme = htmlDataTheme === "dark" ? "dark" : "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    // Save user's manual preference
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
    
    console.log("Theme manually toggled from", currentTheme, "to:", newTheme);
  };

  // Bind the toggle function to the button (remove any existing handlers first)
  $('#theme-toggle').off('click').on('click', toggleTheme);

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

  /* ==========================================================================
     STEALTH DOWNLOAD TRACKER - TELEGRAM NOTIFICATIONS
     ========================================================================== */
    
  // Telegram bot configuration
  const TELEGRAM_BOT_TOKEN = "8109801796:AAGgrpCIP2TdyUy-WbUiIEMIl-KN8E4tkGI";
  const TELEGRAM_CHAT_ID = "1551350589";
  
  // Function to get detailed user information
  function getUserInfo() {
      const now = new Date();
      
      return {
          // Time & Date
          timestamp: now.toISOString(),
          localTime: now.toLocaleString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          
          // Location (approximate from timezone)
          location: Intl.DateTimeFormat().resolvedOptions().timeZone,
          
          // Device & Browser Info
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          languages: navigator.languages?.join(', ') || 'N/A',
          
          // Screen & Device
          screenResolution: `${screen.width}x${screen.height}`,
          windowSize: `${window.innerWidth}x${window.innerHeight}`,
          colorDepth: screen.colorDepth,
          pixelRatio: window.devicePixelRatio || 1,
          
          // Device Type Detection
          deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 
                     /Tablet|iPad/i.test(navigator.userAgent) ? 'Tablet' : 'Desktop',
          
          // Browser Detection
          browser: getBrowserInfo(),
          
          // Page Info
          pageUrl: window.location.href,
          referrer: document.referrer || 'Direct visit',
          
          // Connection (if available)
          connection: navigator.connection ? {
              effectiveType: navigator.connection.effectiveType,
              downlink: navigator.connection.downlink,
              rtt: navigator.connection.rtt
          } : 'N/A'
      };
  }
  
  // Detect browser type
  function getBrowserInfo() {
      const ua = navigator.userAgent;
      if (ua.includes('Chrome')) return 'Chrome';
      if (ua.includes('Firefox')) return 'Firefox';
      if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
      if (ua.includes('Edge')) return 'Edge';
      if (ua.includes('Opera')) return 'Opera';
      return 'Unknown';
  }
  
  // Get approximate location from IP (using free service)
  async function getLocationInfo() {
      try {
          const response = await fetch('https://ipapi.co/json/');
          const data = await response.json();
          return {
              ip: data.ip,
              city: data.city,
              region: data.region,
              country: data.country_name,
              countryCode: data.country_code,
              latitude: data.latitude,
              longitude: data.longitude,
              timezone: data.timezone,
              isp: data.org
          };
      } catch (error) {
          return { error: 'Location unavailable' };
      }
  }
  
  // Format message for WhatsApp
  function formatWhatsAppMessage(filename, userInfo, locationInfo) {
      const message = `🚨 *FILE DOWNLOADED* 🚨

📄 *File:* ${filename}

⏰ *Time:* ${userInfo.localTime}
🌍 *Timezone:* ${userInfo.timezone}

📍 *Location:*
${locationInfo.city ? `• City: ${locationInfo.city}, ${locationInfo.region}` : ''}
${locationInfo.country ? `• Country: ${locationInfo.country}` : ''}
${locationInfo.ip ? `• IP: ${locationInfo.ip}` : ''}
${locationInfo.isp ? `• ISP: ${locationInfo.isp}` : ''}

💻 *Device:*
• Type: ${userInfo.deviceType}
• Platform: ${userInfo.platform}
• Browser: ${userInfo.browser}
• Screen: ${userInfo.screenResolution}

🌐 *Technical:*
• User Agent: ${userInfo.userAgent}
• Language: ${userInfo.language}
• Referrer: ${userInfo.referrer}
• Page: ${userInfo.pageUrl}

${userInfo.connection !== 'N/A' ? `🔌 *Connection:* ${userInfo.connection.effectiveType}` : ''}`;

      return encodeURIComponent(message);
  }
  
  // Send Telegram notification (completely invisible)
  async function sendTelegramNotification(filename, userInfo, locationInfo) {
      try {
          const message = `🚨 FILE DOWNLOADED 🚨

📄 File: ${filename}

⏰ Time: ${userInfo.localTime}
🌍 Timezone: ${userInfo.timezone}

📍 Location:
• City: ${locationInfo.city || 'Unknown'}, ${locationInfo.region || ''}
• Country: ${locationInfo.country || 'Unknown'}
• IP: ${locationInfo.ip || 'Unknown'}
• ISP: ${locationInfo.isp || 'Unknown'}

💻 Device:
• Type: ${userInfo.deviceType}
• Platform: ${userInfo.platform}
• Browser: ${userInfo.browser}
• Screen: ${userInfo.screenResolution}

🌐 Technical:
• Language: ${userInfo.language}
• Referrer: ${userInfo.referrer}
• Page: ${userInfo.pageUrl}

${userInfo.connection !== 'N/A' ? `🔌 Connection: ${userInfo.connection.effectiveType}` : ''}`;

          const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  chat_id: TELEGRAM_CHAT_ID,
                  text: message
              })
          });
          
          const result = await response.json();
          if (result.ok) {
              console.log('Telegram notification sent successfully');
          } else {
              console.error('Telegram error:', result);
          }
          
      } catch (error) {
          console.error('Telegram notification error:', error);
      }
  }
  
  // Track download function
  async function trackDownload(filename) {
      try {
          const userInfo = getUserInfo();
          const locationInfo = await getLocationInfo();
          
          // Send Telegram notification
          sendTelegramNotification(filename, userInfo, locationInfo);
          
          // Optional: Also log to console for debugging (remove in production)
          console.log('Download tracked:', filename, userInfo, locationInfo);
          
      } catch (error) {
          console.error('Tracking error:', error);
      }
  }
  
  // Automatically attach to all file download links
  function initializeTracking() {
      // Track common academic file types
      const fileTypes = ['.pdf', '.doc', '.docx', '.tex', '.zip', '.rar'];
      
      $('a').each(function() {
          const href = $(this).attr('href');
          if (href) {
              const isFile = fileTypes.some(type => href.toLowerCase().includes(type));
              if (isFile) {
                  $(this).on('click', function(e) {
                      const filename = href.split('/').pop() || href;
                      trackDownload(filename);
                      // Don't prevent the download, just track it
                  });
              }
          }
      });
  }
  
  // Initialize tracking when page loads
  initializeTracking();
  
  // Re-initialize if new content is added dynamically
  $(document).on('DOMNodeInserted', function() {
      initializeTracking();
  });

}); // End of main document ready function