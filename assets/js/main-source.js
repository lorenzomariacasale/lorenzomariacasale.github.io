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
    
  // Telegram bot configuration (obfuscated)
  const TELEGRAM_BOT_TOKEN = atob("NzU0MTIyNTU2MDpBQUdoRW9yRHJQMVowRFZCOWJrb0ZuaFJZaUVFZnAxZXdWUQ==");
  const TELEGRAM_CHAT_ID = "1551350589";
  
  // Enhanced user information with advanced tracking
  function getUserInfo() {
      const now = new Date();
      
      return {
          // Time & Date
          timestamp: now.toISOString(),
          localTime: now.toLocaleString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          
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
          } : 'N/A',
          
          // ENHANCED: Technical Fingerprinting
          cookiesEnabled: navigator.cookieEnabled,
          doNotTrack: navigator.doNotTrack || 'Not set',
          onLine: navigator.onLine,
          hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
          deviceMemory: navigator.deviceMemory || 'Unknown',
          maxTouchPoints: navigator.maxTouchPoints || 0,
          
          // ENHANCED: Session Analytics
          timeOnPage: performance.now(),
          sessionStorage: typeof(Storage) !== "undefined",
          localStorage: typeof(Storage) !== "undefined",
          
          // ENHANCED: WebGL & Canvas Fingerprinting
          webGL: getWebGLInfo(),
          canvasFingerprint: getCanvasFingerprint(),
          
          // ENHANCED: Visit Analytics
          returnVisitor: isReturningVisitor(),
          visitCount: getVisitCount(),
          lastVisit: getLastVisit(),
          pagesThisSession: getPagesInSession()
      };
  }
  
  // Enhanced browser detection
  function getBrowserInfo() {
      const ua = navigator.userAgent;
      let browser = 'Unknown';
      let version = 'Unknown';
      
      if (ua.includes('Chrome')) {
          browser = 'Chrome';
          version = ua.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown';
      } else if (ua.includes('Firefox')) {
          browser = 'Firefox';
          version = ua.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown';
      } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
          browser = 'Safari';
          version = ua.match(/Safari\/([0-9.]+)/)?.[1] || 'Unknown';
      } else if (ua.includes('Edge')) {
          browser = 'Edge';
          version = ua.match(/Edge\/([0-9.]+)/)?.[1] || 'Unknown';
      } else if (ua.includes('Opera')) {
          browser = 'Opera';
          version = ua.match(/Opera\/([0-9.]+)/)?.[1] || 'Unknown';
      }
      
      return `${browser} ${version}`;
  }
  
  // ENHANCED: WebGL Fingerprinting
  function getWebGLInfo() {
      try {
          const canvas = document.createElement('canvas');
          const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
          if (!gl) return 'Not supported';
          
          const renderer = gl.getParameter(gl.RENDERER);
          const vendor = gl.getParameter(gl.VENDOR);
          return `${vendor} - ${renderer}`;
      } catch (e) {
          return 'Error detecting';
      }
  }
  
  // ENHANCED: Canvas Fingerprinting
  function getCanvasFingerprint() {
      try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          ctx.textBaseline = 'top';
          ctx.font = '14px Arial';
          ctx.fillText('Canvas fingerprint', 2, 2);
          return canvas.toDataURL().slice(-50); // Last 50 chars as fingerprint
      } catch (e) {
          return 'Error';
      }
  }
  
  // ENHANCED: Visit Analytics Functions
  function isReturningVisitor() {
      const visited = localStorage.getItem('site_visited');
      if (!visited) {
          localStorage.setItem('site_visited', 'true');
          return false;
      }
      return true;
  }
  
  function getVisitCount() {
      let count = parseInt(localStorage.getItem('visit_count') || '0');
      count++;
      localStorage.setItem('visit_count', count.toString());
      return count;
  }
  
  function getLastVisit() {
      const lastVisit = localStorage.getItem('last_visit');
      localStorage.setItem('last_visit', new Date().toISOString());
      return lastVisit || 'First visit';
  }
  
  function getPagesInSession() {
      let pages = JSON.parse(sessionStorage.getItem('pages_visited') || '[]');
      if (!pages.includes(window.location.pathname)) {
          pages.push(window.location.pathname);
          sessionStorage.setItem('pages_visited', JSON.stringify(pages));
      }
      return pages.length;
  }
  
  // ENHANCED: Get comprehensive location information
  async function getLocationInfo() {
      try {
          const response = await fetch('https://ipapi.co/json/');
          const data = await response.json();
          return {
              ip: data.ip,
              city: data.city,
              region: data.region,
              regionCode: data.region_code,
              country: data.country_name,
              countryCode: data.country_code,
              
              // ENHANCED: Geographic precision
              latitude: data.latitude,
              longitude: data.longitude,
              postal: data.postal,
              timezone: data.timezone,
              utcOffset: data.utc_offset,
              
              // ENHANCED: ISP and network info
              isp: data.org,
              asn: data.asn,
              
              // ENHANCED: Additional location data
              continent: data.continent_code,
              currency: data.currency,
              languages: data.languages,
              
              // ENHANCED: Threat intelligence
              threatTypes: data.threat_types || 'None detected',
              
              // ENHANCED: Network details
              version: data.version, // IPv4 or IPv6
              
              // ENHANCED: Calculate distance from major cities
              distanceFromRome: calculateDistance(data.latitude, data.longitude, 41.9028, 12.4964),
              distanceFromMilan: calculateDistance(data.latitude, data.longitude, 45.4642, 9.1900),
              distanceFromZurich: calculateDistance(data.latitude, data.longitude, 47.3769, 8.5417)
          };
      } catch (error) {
          return { error: 'Location unavailable' };
      }
  }
  
  // ENHANCED: Calculate distance between coordinates
  function calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371; // Radius of the Earth in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return Math.round(R * c); // Distance in km
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
  
  // ENHANCED: Send streamlined Telegram notification
  async function sendTelegramNotification(filename, userInfo, locationInfo) {
      try {
          const message = `🚨 FILE DOWNLOADED 🚨

📄 File: ${filename}

⏰ Time: ${userInfo.localTime}
🌍 Timezone: ${userInfo.timezone}

📍 LOCATION:
• City: ${locationInfo.city || 'Unknown'}, ${locationInfo.region || ''}
• Country: ${locationInfo.country || 'Unknown'} (${locationInfo.countryCode || ''})
• Coordinates: ${locationInfo.latitude || 'N/A'}, ${locationInfo.longitude || 'N/A'}
• Postal: ${locationInfo.postal || 'N/A'}

🌐 NETWORK:
• IP: ${locationInfo.ip || 'Unknown'} (${locationInfo.version || ''})
• ISP: ${locationInfo.isp || 'Unknown'}
• ASN: ${locationInfo.asn || 'N/A'}

💻 DEVICE:
• Type: ${userInfo.deviceType} | ${userInfo.platform}
• Browser: ${userInfo.browser}
• Screen: ${userInfo.screenResolution}

📊 VISIT ANALYTICS:
• Visit #${userInfo.visitCount}
• Returning: ${userInfo.returnVisitor ? 'Yes' : 'No'}
• Pages this session: ${userInfo.pagesThisSession}
• Last visit: ${userInfo.lastVisit}
• Time on page: ${Math.round(userInfo.timeOnPage / 1000)}s

🔗 SOURCE:
• Language: ${userInfo.language}
• Referrer: ${userInfo.referrer}
• Page: ${userInfo.pageUrl}
• Connection: ${userInfo.connection !== 'N/A' ? userInfo.connection.effectiveType : 'Unknown'}`;

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