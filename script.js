/* ==========================================================================
   DEBRIS - AI-Powered Intelligent Waste Management Platform
   Core Application Engine & Logic (Vanilla ES6 JavaScript)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Core Services
  initThemeEngine();
  initMobileNav();
  initAnimatedCounters();
  initAIScannerSimulator();
  initFormValidation();
  initRegistrationValidation();
  initModals();
  initDashboardControls();
  initRewardsEngine();
});

/* ==========================================================================
   1. Theme Management System (Dark / Light Mode)
   ========================================================================== */
function initThemeEngine() {
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  const savedTheme = localStorage.getItem('debris-theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  setTheme(savedTheme);

  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      showToast(`Switched to ${newTheme.toUpperCase()} mode`, 'info');
    });
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('debris-theme', theme);

  // Update toggle icons if present
  const icons = document.querySelectorAll('.theme-toggle-btn i, .theme-toggle-btn span.theme-icon');
  icons.forEach(icon => {
    if (theme === 'dark') {
      icon.textContent = '☀️';
    } else {
      icon.textContent = '🌙';
    }
  });
}

/* ==========================================================================
   2. Responsive Mobile Navigation Toggle
   ========================================================================== */
function initMobileNav() {
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const navMenu = document.querySelector('.nav-menu');

  if (!hamburgerBtn || !navMenu) return;

  hamburgerBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const isExpanded = navMenu.classList.contains('active');
    hamburgerBtn.setAttribute('aria-expanded', isExpanded);
    hamburgerBtn.textContent = isExpanded ? '✕' : '☰';
  });

  // Close menu when clicking outside or link
  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
      navMenu.classList.remove('active');
      if (hamburgerBtn) hamburgerBtn.textContent = '☰';
    }
  });
}

/* ==========================================================================
   3. Animated Statistics Counter on Scroll
   ========================================================================== */
function initAnimatedCounters() {
  const counterElements = document.querySelectorAll('.stat-number[data-target]');
  if (counterElements.length === 0) return;

  const observerOptions = {
    threshold: 0.5
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  counterElements.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
  const target = parseInt(element.getAttribute('data-target'), 10);
  const suffix = element.getAttribute('data-suffix') || '';
  const prefix = element.getAttribute('data-prefix') || '';
  const duration = 2000; // 2 seconds
  const stepTime = 20;
  const steps = duration / stepTime;
  const increment = target / steps;

  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = `${prefix}${Math.floor(current).toLocaleString()}${suffix}`;
  }, stepTime);
}

/* ==========================================================================
   4. Live AI Waste Scanner Interactive Simulator
   ========================================================================== */
const AI_SAMPLE_DATABASE = {
  plastic: {
    name: 'PET Water Bottle',
    category: 'Recyclable Plastic',
    binColor: '#0EA5E9',
    binName: 'Blue Smart Bin (Recycling)',
    confidence: 98.4,
    points: 15,
    co2Saved: '0.25 kg',
    instructions: 'Rinse thoroughly, flatten bottle, and remove cap before disposal.',
    badgeClass: 'status-verified',
    image: 'https://images.unsplash.com/photo-1562077772-3bd90403f7f0?w=500&auto=format&fit=crop&q=80'
  },
  organic: {
    name: 'Apple Core & Food Residuals',
    category: 'Organic Bio-Waste',
    binColor: '#10B981',
    binName: 'Green Smart Bin (Compost)',
    confidence: 96.8,
    points: 10,
    co2Saved: '0.15 kg',
    instructions: 'Place directly in organic compost bin. Do not enclose in plastic bags.',
    badgeClass: 'status-verified',
    image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=500&auto=format&fit=crop&q=80'
  },
  ewaste: {
    name: 'Lithium Smartphone Battery',
    category: 'Hazardous E-Waste',
    binColor: '#F59E0B',
    binName: 'Orange E-Waste Vault / RVM',
    confidence: 99.1,
    points: 50,
    co2Saved: '1.20 kg',
    instructions: 'Hazardous chemical waste! Drop off at designated Reverse Vending Machine for safety.',
    badgeClass: 'status-pending',
    image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500&auto=format&fit=crop&q=80'
  },
  paper: {
    name: 'Corrugated Cardboard Box',
    category: 'Paper & Cardboard',
    binColor: '#8B5CF6',
    binName: 'Purple Smart Bin (Paper)',
    confidence: 97.5,
    points: 20,
    co2Saved: '0.40 kg',
    instructions: 'Collapse box flat to maximize bin volume efficiency.',
    badgeClass: 'status-verified',
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=80'
  }
};

function initAIScannerSimulator() {
  const presetBtns = document.querySelectorAll('.scanner-preset-btn');
  const viewport = document.querySelector('.scanner-viewport');
  const scanImg = document.getElementById('scanner-target-img');
  const resultTitle = document.getElementById('res-item-title');
  const resultCategory = document.getElementById('res-item-category');
  const resultBin = document.getElementById('res-item-bin');
  const resultConfidenceText = document.getElementById('res-confidence-text');
  const resultConfidenceFill = document.getElementById('res-confidence-fill');
  const resultPoints = document.getElementById('res-item-points');
  const resultInstructions = document.getElementById('res-item-instructions');
  const scanTriggerBtn = document.getElementById('run-scan-btn');

  if (!presetBtns.length || !viewport) return;

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const itemKey = btn.getAttribute('data-item');
      runScannerSimulation(itemKey);
    });
  });

  if (scanTriggerBtn) {
    scanTriggerBtn.addEventListener('click', () => {
      const activeBtn = document.querySelector('.scanner-preset-btn.active');
      const itemKey = activeBtn ? activeBtn.getAttribute('data-item') : 'plastic';
      runScannerSimulation(itemKey);
    });
  }

  function runScannerSimulation(key) {
    const data = AI_SAMPLE_DATABASE[key] || AI_SAMPLE_DATABASE.plastic;

    // Activate laser scanner UI
    viewport.classList.add('scanning');

    if (scanImg) {
      scanImg.style.opacity = '0.5';
      scanImg.src = data.image;
    }

    setTimeout(() => {
      viewport.classList.remove('scanning');
      if (scanImg) scanImg.style.opacity = '1';

      if (resultTitle) resultTitle.textContent = data.name;
      if (resultCategory) resultCategory.textContent = data.category;
      if (resultBin) {
        resultBin.textContent = data.binName;
        resultBin.style.color = data.binColor;
      }
      if (resultConfidenceText) resultConfidenceText.textContent = `${data.confidence}%`;
      if (resultConfidenceFill) resultConfidenceFill.style.width = `${data.confidence}%`;
      if (resultPoints) resultPoints.textContent = `+${data.points} Eco-Points`;
      if (resultInstructions) resultInstructions.textContent = data.instructions;

      showToast(`AI Identified: ${data.name} (+${data.points} pts)`, 'success');
    }, 1200);
  }
}

/* ==========================================================================
   5. Form Validation Engine
   ========================================================================== */
function initFormValidation() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');

    let isValid = true;

    if (!nameInput.value.trim()) {
      showFieldError(nameInput, 'Please enter your full name.');
      isValid = false;
    } else {
      clearFieldError(nameInput);
    }

    if (!emailInput.value.trim() || !validateEmail(emailInput.value)) {
      showFieldError(emailInput, 'Please enter a valid email address.');
      isValid = false;
    } else {
      clearFieldError(emailInput);
    }

    if (!messageInput.value.trim()) {
      showFieldError(messageInput, 'Please enter your message.');
      isValid = false;
    } else {
      clearFieldError(messageInput);
    }

    if (isValid) {
      showToast('Thank you! Your message has been sent to DEBRIS Support.', 'success');
      contactForm.reset();
    }
  });

  function showFieldError(input, msg) {
    const parent = input.parentElement;
    let errorEl = parent.querySelector('.form-error-msg');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'form-error-msg';
      parent.appendChild(errorEl);
    }
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
    input.style.borderColor = 'var(--status-danger)';
  }

  function clearFieldError(input) {
    const parent = input.parentElement;
    const errorEl = parent.querySelector('.form-error-msg');
    if (errorEl) errorEl.style.display = 'none';
    input.style.borderColor = 'var(--border-color)';
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

/* ==========================================================================
   6. Modal Dialog Management System
   ========================================================================== */
function initModals() {
  const modalTriggers = document.querySelectorAll('[data-modal-target]');
  const closeBtns = document.querySelectorAll('.modal-close-btn, .modal-cancel-btn');

  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = trigger.getAttribute('data-modal-target');
      const modal = document.getElementById(targetId);
      if (modal) {
        modal.classList.add('active');
      }
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const activeModal = btn.closest('.modal-overlay');
      if (activeModal) activeModal.classList.remove('active');
    });
  });

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('active');
    }
  });
}

/* ==========================================================================
   7. Citizen Dashboard Controls (Sidebar, Bins, Activity)
   ========================================================================== */
function initDashboardControls() {
  const sidebarToggle = document.getElementById('sidebar-toggle-btn');
  const sidebar = document.querySelector('.dashboard-sidebar');
  const mainContent = document.querySelector('.dashboard-main');

  if (sidebarToggle && sidebar && mainContent) {
    sidebarToggle.addEventListener('click', () => {
      if (window.innerWidth <= 1024) {
        sidebar.classList.toggle('mobile-open');
      } else {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
      }
    });
  }

  // Smart Bin Navigation Trigger
  const binNavBtns = document.querySelectorAll('.bin-nav-btn');
  binNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const binId = btn.getAttribute('data-bin-id') || 'BIN-104';
      const binLoc = btn.getAttribute('data-bin-loc') || 'Main Square';

      const modalBinId = document.getElementById('nav-modal-bin-id');
      const modalBinLoc = document.getElementById('nav-modal-bin-loc');
      const navModal = document.getElementById('modal-bin-navigate');

      if (modalBinId) modalBinId.textContent = binId;
      if (modalBinLoc) modalBinLoc.textContent = binLoc;
      if (navModal) navModal.classList.add('active');

      showToast(`Calculating route to ${binId}...`, 'info');
    });
  });
}
   /* ==========================================================================
   8. WASTE ISSUE REPORTING
   ========================================================================== */

function initWasteReporting() {

  const reportForm = document.getElementById('waste-report-form');
  const locationBtn = document.getElementById('get-location-btn');
  const imageInput = document.getElementById('report-image');

  if (!reportForm) return;


  /* -----------------------------
     GET CURRENT LOCATION
  ----------------------------- */

  if (locationBtn) {

    locationBtn.addEventListener('click', () => {

      const locationStatus =
        document.getElementById('location-status');

      if (!navigator.geolocation) {

        locationStatus.textContent =
          'Geolocation is not supported by this browser.';

        return;
      }

      locationStatus.textContent =
        'Detecting your location...';

      navigator.geolocation.getCurrentPosition(

        (position) => {

          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;

          document.getElementById('location-details').style.display =
            'block';

          document.getElementById('detected-location').textContent =
            'Location detected successfully';

          document.getElementById('coordinates').textContent =
            `Latitude: ${latitude.toFixed(6)} • Longitude: ${longitude.toFixed(6)}`;

          locationStatus.textContent =
            '✓ GPS location verified';

          locationStatus.style.color =
            'var(--status-success)';

          // Store coordinates for submission
          reportForm.dataset.latitude = latitude;
          reportForm.dataset.longitude = longitude;

        },

        () => {

          locationStatus.textContent =
            'Unable to detect location. Please allow location access.';

          locationStatus.style.color =
            'var(--status-danger)';

        }

      );

    });

  }


  /* -----------------------------
     IMAGE PREVIEW
  ----------------------------- */

  if (imageInput) {

    imageInput.addEventListener('change', (event) => {

      const file = event.target.files[0];

      if (!file) return;

      const preview =
        document.getElementById('report-image-preview');

      const previewContainer =
        document.getElementById('image-preview-container');

      const reader = new FileReader();

      reader.onload = (e) => {

        preview.src = e.target.result;

        previewContainer.style.display = 'block';

      };

      reader.readAsDataURL(file);

    });

  }


  /* -----------------------------
     SUBMIT REPORT
  ----------------------------- */

  reportForm.addEventListener('submit', (event) => {

    event.preventDefault();

    const issueType =
      document.getElementById('report-type').value;

    const binId =
      document.getElementById('reported-bin').value;

    const description =
      document.getElementById('report-description').value;

    const latitude =
      reportForm.dataset.latitude;

    const longitude =
      reportForm.dataset.longitude;


    if (!issueType) {

      showToast(
        'Please select an issue type.',
        'error'
      );

      return;

    }


    if (!latitude || !longitude) {

      showToast(
        'Please verify your location before submitting.',
        'error'
      );

      return;

    }


    // Generate temporary report ID
    const reportId =
      'DR-' +
      Math.floor(1000 + Math.random() * 9000);


    // Display success panel
    document.getElementById(
      'generated-report-id'
    ).textContent = reportId;

    document.getElementById(
      'submitted-location'
    ).textContent = 'GPS Verified';


    document.getElementById(
      'report-success'
    ).style.display = 'block';


    // Update report count
    const reportCards =
      document.querySelectorAll(
        '.dashboard-stat-card'
      );

    // Reset form
    reportForm.reset();

    document.getElementById(
      'location-details'
    ).style.display = 'none';

    document.getElementById(
      'location-status'
    ).textContent = 'Location not detected';

    document.getElementById(
      'image-preview-container'
    ).style.display = 'none';


    showToast(
      `Waste report ${reportId} submitted successfully!`,
      'success'
    );

  });

}
/* ==========================================================================
   8. Rewards & Gamification Engine
   ========================================================================== */
function initRewardsEngine() {
  const redeemBtns = document.querySelectorAll('.redeem-reward-btn');
  const userPointsEl = document.getElementById('user-points-display');

  if (!redeemBtns.length) return;

  redeemBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cost = parseInt(btn.getAttribute('data-cost') || '500', 10);
      let currentPoints = parseInt(userPointsEl ? userPointsEl.textContent.replace(',', '') : '1450', 10);

      if (currentPoints >= cost) {
        currentPoints -= cost;
        if (userPointsEl) userPointsEl.textContent = currentPoints.toLocaleString();

        btn.textContent = 'Redeemed ✓';
        btn.disabled = true;
        btn.style.background = 'var(--status-success)';
        btn.style.color = '#FFFFFF';

        showToast(`Coupon redeemed successfully! ${cost} pts deducted.`, 'success');
      } else {
        showToast(`Insufficient Eco-Points. You need ${cost - currentPoints} more points.`, 'warning');
      }
    });
  });
}

/* ==========================================================================
   9. Global Toast Notification System
   ========================================================================== */
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toast-container');

  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: '✅',
    warning: '⚠️',
    info: 'ℹ️',
    danger: '❌'
  };

  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type] || 'ℹ️'}</span>
    <span class="toast-message">${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ==========================================================================
   10. Registration Form Validation (Lab 3)
   ========================================================================== */
function initRegistrationValidation() {
  const form = document.getElementById('registrationForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const password = document.getElementById('password');
    const email = document.getElementById('email');
    const mobile = document.getElementById('mobile');
    const address = document.getElementById('address');
    const success = document.getElementById('registrationSuccess');

    const fields = [firstName, lastName, password, email, mobile, address];
    fields.forEach(clearRegistrationError);
    success.textContent = '';

    let valid = true;

    // 1. First Name: alphabets only and minimum 6 characters
    const namePattern = /^[A-Za-z]+$/;
    if (firstName.value.trim() === '' ||
        !namePattern.test(firstName.value.trim()) ||
        firstName.value.trim().length < 6) {
      showRegistrationError(firstName, 'First name must contain alphabets only and be at least 6 characters.');
      valid = false;
    }

    // 2. Last Name: must not be empty
    if (lastName.value.trim() === '') {
      showRegistrationError(lastName, 'Last name cannot be empty.');
      valid = false;
    }

    // 3. Password: minimum 6 characters
    if (password.value.length < 6) {
      showRegistrationError(password, 'Password must be at least 6 characters long.');
      valid = false;
    }

    // 4. E-mail: standard name@domain.com pattern
    const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailPattern.test(email.value.trim())) {
      showRegistrationError(email, 'Enter a valid email in the format name@domain.com.');
      valid = false;
    }

    // 5. Mobile Number: exactly 10 digits
    const mobilePattern = /^[0-9]{10}$/;
    if (!mobilePattern.test(mobile.value.trim())) {
      showRegistrationError(mobile, 'Mobile number must contain exactly 10 digits.');
      valid = false;
    }

    // 6. Address: must not be empty
    if (address.value.trim() === '') {
      showRegistrationError(address, 'Address cannot be empty.');
      valid = false;
    }

    if (valid) {
      success.textContent = '✓ Registration form validated successfully!';
      showToast('Registration form validated successfully!', 'success');
    } else {
      showToast('Please correct the highlighted fields.', 'danger');
    }
  });

  function showRegistrationError(input, message) {
    const error = document.getElementById(`${input.id}Error`);
    if (error) error.textContent = message;
    input.classList.add('input-error');
  }

  function clearRegistrationError(input) {
    const error = document.getElementById(`${input.id}Error`);
    if (error) error.textContent = '';
    input.classList.remove('input-error');
  }
}
initWasteReporting();