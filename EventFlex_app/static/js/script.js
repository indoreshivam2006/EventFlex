    (function () {
    'use strict';

    const API_BASE = '/api';
    let currentUser = null;
    let toastContainer;    const ready = (callback) => {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback, { once: true });
        }
    };

    ready(() => {
        loadCurrentUser();
        initMobileNav();
        initSmoothScroll();
        initMarketingTabs();
        initDashboardNavigation();
        initSecondaryTabs();
        initSkillTags();
        initUserTypeSelectors();
        initFormHandlers();
        initChatComposer();
        initToastTriggers();
        loadDynamicData();
    });

    // ============ USER SESSION MANAGEMENT ============
    function loadCurrentUser() {
        const stored = localStorage.getItem('eventflex_user');
        if (stored) {
            try {
                currentUser = JSON.parse(stored);
                updateUIForLoggedInUser();
            } catch (e) {
                localStorage.removeItem('eventflex_user');
            }
        }
        
        // Check if page requires authentication
        checkPageAuthentication();
    }

    function checkPageAuthentication() {
        const body = document.body;
        const requiresAuth = body.getAttribute('data-requires-auth') === 'true';
        const requiredUserType = body.getAttribute('data-user-type');
        
        if (requiresAuth) {
            if (!currentUser) {
                // No user logged in, redirect to login
                console.log('Protected page requires authentication - redirecting to login');
                window.location.href = '/login';
                return;
            }
            
            // Check if user type matches
            if (requiredUserType && currentUser.user_type !== requiredUserType) {
                console.log(`Page requires ${requiredUserType} access but user is ${currentUser.user_type}`);
                // Redirect to appropriate dashboard
                if (currentUser.user_type === 'organizer') {
                    window.location.href = '/organizer-dashboard/';
                } else if (currentUser.user_type === 'staff') {
                    window.location.href = '/staff-portal/';
                } else {
                    window.location.href = '/';
                }
            }
        }
    }

    function saveCurrentUser(user) {
        currentUser = user;
        if (user) {
            localStorage.setItem('eventflex_user', JSON.stringify(user));
            updateUIForLoggedInUser();
        } else {
            localStorage.removeItem('eventflex_user');
        }
    }

    function updateUIForLoggedInUser() {
        // Update welcome message, show/hide login buttons, etc.
        const welcomeElements = document.querySelectorAll('.user-welcome');
        welcomeElements.forEach(el => {
            if (currentUser) {
                el.textContent = `Welcome, ${currentUser.username}!`;
            }
        });

        // Update dashboard nav user info
        if (currentUser) {
            const userNameDisplay = document.getElementById('user-name-display');
            const userAvatar = document.getElementById('user-avatar');
            const navLinkText = document.querySelector('.nav-link-text');
            
            if (userNameDisplay) {
                userNameDisplay.textContent = currentUser.username || 'User';
            }
            
            if (userAvatar) {
                const fullName = currentUser.first_name && currentUser.last_name 
                    ? `${currentUser.first_name} ${currentUser.last_name}`
                    : currentUser.username;
                userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=6366f1&color=fff`;
                userAvatar.alt = fullName;
            }

            // Hide Login text and Sign Up button when logged in
            if (navLinkText) {
                navLinkText.style.display = 'none';
            }
            const signUpBtn = document.querySelector('.btn-primary-small');
            if (signUpBtn && signUpBtn.textContent.includes('Sign Up')) {
                signUpBtn.style.display = 'none';
            }

            // Update homepage navbar for logged-in user
            updateHomepageNavbar();
        }
    }

    function updateHomepageNavbar() {
        if (!currentUser) return;

        const navLoginItem = document.getElementById('nav-login-item');
        const navSignupItem = document.getElementById('nav-signup-item');
        const navUserItem = document.getElementById('nav-user-item');
        const navDashboardItem = document.getElementById('nav-dashboard-item');
        const navUserAvatar = document.getElementById('nav-user-avatar');
        const navUserName = document.getElementById('nav-user-name');
        const navDashboardLink = document.getElementById('nav-dashboard-link');

        // Hide login and signup buttons
        if (navLoginItem) navLoginItem.style.display = 'none';
        if (navSignupItem) navSignupItem.style.display = 'none';

        // Show user profile and dashboard button
        if (navUserItem) navUserItem.style.display = 'block';
        if (navDashboardItem) navDashboardItem.style.display = 'block';

        // Update user info
        if (navUserName) {
            navUserName.textContent = currentUser.username || 'User';
        }

        if (navUserAvatar) {
            const fullName = currentUser.first_name && currentUser.last_name 
                ? `${currentUser.first_name} ${currentUser.last_name}`
                : currentUser.username;
            navUserAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=6366f1&color=fff`;
            navUserAvatar.alt = fullName;
        }

        // Set dashboard link based on user type
        if (navDashboardLink && currentUser.user_type) {
            if (currentUser.user_type === 'organizer') {
                navDashboardLink.href = '/organizer-dashboard/';
                navDashboardLink.textContent = 'Organizer Dashboard';
            } else if (currentUser.user_type === 'staff') {
                navDashboardLink.href = '/staff-portal/';
                navDashboardLink.textContent = 'My Portal';
            }
        }
    }

    // ============ DATA LOADING ============
    async function loadDynamicData() {
        if (document.getElementById('jobListings')) {
            await loadJobListings();
        }
        
        if (document.getElementById('talentGrid')) {
            await loadTalentGrid();
        }
        
        // Load organizer talent grid
        if (document.getElementById('talent-grid-organizer')) {
            await loadOrganizerTalentGrid();
        }
        
        if (currentUser) {
            // Load dashboard statistics for organizer
            if (document.getElementById('stat-active-jobs')) {
                await loadDashboardStats();
            }
            
            // Load dashboard statistics for staff
            if (document.getElementById('stat-events-completed')) {
                await loadStaffDashboardStats();
            }
            
            // Load upcoming events for staff
            if (document.getElementById('staff-upcoming-events')) {
                await loadStaffUpcomingEvents();
            }
            
            // Load upcoming events for organizer
            if (document.getElementById('upcoming-events-list')) {
                await loadUpcomingEvents();
            }
            
            // Load recent applications
            if (document.getElementById('recent-applications-list')) {
                await loadRecentApplications();
            }
            
            // Load staff applications for my-applications section
            if (document.getElementById('pending-applications')) {
                await loadStaffApplications();
            }
            
            // Load staff bookings for my-bookings section
            if (document.getElementById('upcoming-bookings')) {
                await loadStaffBookings();
            }
            
            // Load wallet data
            if (document.getElementById('available-balance')) {
                await loadWalletData();
            }
            
            // Load profile data
            if (document.getElementById('profile')) {
                await loadProfileData();
            }
            
            if (document.querySelector('[data-tab-content="pending-applications"]')) {
                await loadMyApplications();
            }
            
            if (document.querySelector('[data-tab-content="active-jobs"]')) {
                await loadMyJobs();
            }
            
            if (document.querySelector('.chat-messages')) {
                await loadMessages();
            }
            
            if (document.getElementById('transactionsList')) {
                await loadTransactions();
            }
            
            // Update welcome message
            const welcomeMsg = document.getElementById('welcome-message');
            if (welcomeMsg) {
                welcomeMsg.textContent = `Welcome back, ${currentUser.username}! 👋`;
            }
        }
    }

    async function loadStaffDashboardStats() {
        try {
            const res = await fetch(`${API_BASE}/applications/`, {
                credentials: 'include'
            });
            
            if (!res.ok) return;
            
            const data = await res.json();
            const applications = data.results || [];
            
            // Count completed events (accepted applications)
            const completedEvents = applications.filter(app => app.status === 'accepted').length;
            
            // Calculate total earned
            let totalEarned = 0;
            applications.filter(app => app.status === 'accepted').forEach(app => {
                totalEarned += parseFloat(app.job.pay_rate || 0);
            });
            
            // Count upcoming events (accepted + future date)
            const now = new Date();
            const upcoming = applications.filter(app => {
                if (app.status !== 'accepted') return false;
                if (!app.job.date) return false;
                const jobDate = new Date(app.job.date);
                return jobDate >= now;
            }).length;
            
            // Update UI
            document.getElementById('stat-events-completed').textContent = completedEvents;
            document.getElementById('stat-total-earned').textContent = `₹${totalEarned.toLocaleString()}`;
            document.getElementById('stat-rating').textContent = '5.0'; // Placeholder
            document.getElementById('stat-upcoming').textContent = upcoming;
            
        } catch (err) {
            console.error('Failed to load staff dashboard stats:', err);
        }
    }

    async function loadStaffUpcomingEvents() {
        try {
            const res = await fetch(`${API_BASE}/applications/`, {
                credentials: 'include'
            });
            
            if (!res.ok) return;
            
            const data = await res.json();
            const applications = data.results || [];
            
            // Filter upcoming events
            const now = new Date();
            const upcoming = applications.filter(app => {
                if (app.status !== 'accepted') return false;
                if (!app.job.date) return false;
                const jobDate = new Date(app.job.date);
                return jobDate >= now;
            }).slice(0, 3);
            
            renderStaffUpcomingEvents(upcoming);
        } catch (err) {
            console.error('Failed to load staff upcoming events:', err);
        }
    }

    function renderStaffUpcomingEvents(applications) {
        const container = document.getElementById('staff-upcoming-events');
        if (!container) return;
        
        if (applications.length === 0) {
            container.innerHTML = '<p class="empty-state">No upcoming events. <a href="#find-jobs">Find jobs</a> to apply!</p>';
            return;
        }
        
        container.innerHTML = applications.map(app => {
            const job = app.job;
            const date = new Date(job.date);
            const day = date.getDate();
            const month = date.toLocaleDateString('en-US', { month: 'short' });
            
            return `
                <div class="event-item">
                    <div class="event-date">
                        <span class="day">${day}</span>
                        <span class="month">${month}</span>
                    </div>
                    <div class="event-details">
                        <h4>${escapeHtml(job.title)}</h4>
                        <p><i class="fas fa-map-marker-alt"></i> ${escapeHtml(job.location)}</p>
                        <p><i class="fas fa-rupee-sign"></i> ₹${job.pay_rate} • ${job.start_time || 'TBD'} - ${job.end_time || 'TBD'}</p>
                    </div>
                    <span class="status-badge confirmed">Confirmed</span>
                </div>
            `;
        }).join('');
    }

    async function loadDashboardStats() {
        try {
            const res = await fetch(`${API_BASE}/jobs/my/`, {
                credentials: 'include'
            });
            
            if (!res.ok) return;
            
            const data = await res.json();
            const jobs = data.results || [];
            
            // Count active jobs
            const activeJobs = jobs.length;
            
            // Count hired staff (applications accepted)
            const appsRes = await fetch(`${API_BASE}/applications/`, {
                credentials: 'include'
            });
            let hiredStaff = 0;
            let totalSpent = 0;
            
            if (appsRes.ok) {
                const appsData = await appsRes.json();
                hiredStaff = (appsData.results || []).filter(app => app.status === 'accepted').length;
                
                // Calculate total spent
                (appsData.results || []).filter(app => app.status === 'accepted').forEach(app => {
                    totalSpent += parseFloat(app.job.pay_rate || 0);
                });
            }
            
            // Count upcoming events (future dated jobs)
            const now = new Date();
            const upcomingEvents = jobs.filter(job => {
                if (!job.date) return false;
                const jobDate = new Date(job.date);
                return jobDate >= now;
            }).length;
            
            // Update UI
            document.getElementById('stat-active-jobs').textContent = activeJobs;
            document.getElementById('stat-hired-staff').textContent = hiredStaff;
            document.getElementById('stat-upcoming-events').textContent = upcomingEvents;
            document.getElementById('stat-total-spent').textContent = `₹${(totalSpent/1000).toFixed(1)}K`;
            
        } catch (err) {
            console.error('Failed to load dashboard stats:', err);
        }
    }

    async function loadUpcomingEvents() {
        try {
            const res = await fetch(`${API_BASE}/jobs/my/`, {
                credentials: 'include'
            });
            
            if (!res.ok) return;
            
            const data = await res.json();
            const jobs = data.results || [];
            
            // Filter upcoming events
            const now = new Date();
            const upcoming = jobs.filter(job => {
                if (!job.date) return false;
                const jobDate = new Date(job.date);
                return jobDate >= now;
            }).slice(0, 3);
            
            renderUpcomingEvents(upcoming);
        } catch (err) {
            console.error('Failed to load upcoming events:', err);
        }
    }

    function renderUpcomingEvents(events) {
        const container = document.getElementById('upcoming-events-list');
        if (!container) return;
        
        if (events.length === 0) {
            container.innerHTML = '<p class="empty-state">No upcoming events scheduled.</p>';
            return;
        }
        
        container.innerHTML = events.map(job => {
            const date = new Date(job.date);
            const day = date.getDate();
            const month = date.toLocaleDateString('en-US', { month: 'short' });
            
            return `
                <div class="event-item">
                    <div class="event-date">
                        <span class="day">${day}</span>
                        <span class="month">${month}</span>
                    </div>
                    <div class="event-details">
                        <h4>${escapeHtml(job.title)}</h4>
                        <p><i class="fas fa-map-marker-alt"></i> ${escapeHtml(job.location)}</p>
                        <p><i class="fas fa-users"></i> ${job.number_of_staff} Staff Needed</p>
                    </div>
                    <span class="status-badge pending">Active</span>
                </div>
            `;
        }).join('');
    }

    async function loadRecentApplications() {
        try {
            const res = await fetch(`${API_BASE}/applications/`, {
                credentials: 'include'
            });
            
            if (!res.ok) return;
            
            const data = await res.json();
            const applications = (data.results || []).filter(app => app.status === 'pending').slice(0, 3);
            
            renderRecentApplications(applications);
        } catch (err) {
            console.error('Failed to load recent applications:', err);
        }
    }

    function renderRecentApplications(applications) {
        const container = document.getElementById('recent-applications-list');
        if (!container) return;
        
        if (applications.length === 0) {
            container.innerHTML = '<p class="empty-state">No pending applications.</p>';
            return;
        }
        
        container.innerHTML = applications.map(app => {
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.applicant.username)}&background=6366f1&color=fff`;
            const badge = app.applicant.badge || '';
            
            return `
                <div class="application-item">
                    <img src="${avatarUrl}" alt="${escapeHtml(app.applicant.username)}">
                    <div class="application-details">
                        <h4>${escapeHtml(app.applicant.username)}</h4>
                        <p>${escapeHtml(app.job.role)}</p>
                        ${badge ? `<span class="badge-pro">${escapeHtml(badge)}</span>` : ''}
                    </div>
                    <div class="application-actions">
                        <button class="btn-sm btn-success" onclick="updateApplicationStatus(${app.id}, 'accepted')">Accept</button>
                        <button class="btn-sm btn-outline" onclick="updateApplicationStatus(${app.id}, 'rejected')">Reject</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    window.updateApplicationStatus = async function(appId, status) {
        try {
            const res = await fetch(`${API_BASE}/applications/${appId}/status/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
                credentials: 'include',
            });
            
            if (res.ok) {
                showToast(`Application ${status}!`, 'success');
                await loadRecentApplications();
                await loadDashboardStats();
            } else {
                showToast('Failed to update application', 'error');
            }
        } catch (err) {
            console.error('Error updating application:', err);
            showToast('Error updating application', 'error');
        }
    };

    async function loadJobListings() {
        try {
            const res = await fetch(`${API_BASE}/jobs/`);
            const data = await res.json();
            const jobs = data.results || [];
            
            // Fetch user's applications to check which jobs they've already applied to
            let appliedJobIds = [];
            if (currentUser) {
                try {
                    const appsRes = await fetch(`${API_BASE}/applications/`, {
                        credentials: 'include'
                    });
                    if (appsRes.ok) {
                        const appsData = await appsRes.json();
                        appliedJobIds = (appsData.results || []).map(app => app.job.id);
                    }
                } catch (err) {
                    console.error('Failed to fetch applications:', err);
                }
            }
            
            renderJobListings(jobs, appliedJobIds);
        } catch (err) {
            console.error('Failed to load jobs:', err);
        }
    }

    function renderJobListings(jobs, appliedJobIds = []) {
        const container = document.getElementById('jobListings');
        if (!container) return;
        
        if (jobs.length === 0) {
            container.innerHTML = '<p class="empty-state">No jobs available at the moment. Check back soon!</p>';
            return;
        }
        
        // Check if we're in staff portal (has job-listing-card style)
        const isStaffPortal = document.getElementById('discover-jobs') !== null;
        
        if (isStaffPortal) {
            // Staff portal detailed view
            container.innerHTML = jobs.map(job => {
                const skills = job.skills ? job.skills.split(',').map(s => s.trim()) : [];
                const organizerName = job.organizer?.username || 'Unknown Organizer';
                const isVerified = job.organizer?.kyc_verified || false;
                const hasApplied = appliedJobIds.includes(job.id);
                
                return `
                    <div class="job-listing-card">
                        <div class="job-listing-header">
                            <div>
                                <h3>${escapeHtml(job.title)}</h3>
                                <p class="organizer"><i class="fas fa-building"></i> ${escapeHtml(organizerName)}</p>
                            </div>
                            <div class="job-pay">₹${job.pay_rate}<span>/${job.payment_type}</span></div>
                        </div>
                        <div class="job-listing-details">
                            <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(job.location)}</span>
                            <span><i class="fas fa-calendar"></i> ${formatDate(job.date)}</span>
                            <span><i class="fas fa-clock"></i> ${job.start_time || 'TBD'} - ${job.end_time || 'TBD'}</span>
                            <span><i class="fas fa-users"></i> ${job.number_of_staff} position${job.number_of_staff > 1 ? 's' : ''}</span>
                        </div>
                        ${skills.length > 0 ? `
                        <div class="job-listing-skills">
                            ${skills.slice(0, 5).map(skill => `<span>${escapeHtml(skill)}</span>`).join('')}
                        </div>
                        ` : ''}
                        <p class="job-listing-description">
                            ${escapeHtml(job.description || 'No description available.')}
                        </p>
                        <div class="job-listing-footer">
                            <div class="job-listing-meta">
                                ${isVerified ? '<span class="badge-verified"><i class="fas fa-check-circle"></i> Verified Organizer</span>' : ''}
                                <span><i class="fas fa-briefcase"></i> ${escapeHtml(job.role)}</span>
                            </div>
                            ${hasApplied 
                                ? '<button class="btn-primary" disabled style="opacity: 0.6; cursor: not-allowed;">Applied</button>'
                                : `<button class="btn-primary apply-job-btn" data-job-id="${job.id}">Apply Now</button>`
                            }
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            // Simple card view for homepage
            container.innerHTML = jobs.map(job => {
                const hasApplied = appliedJobIds.includes(job.id);
                
                return `
                <div class="job-card">
                    <div class="job-header">
                        <h3>${escapeHtml(job.title)}</h3>
                        <span class="badge badge-${job.event_type}">${escapeHtml(job.event_type)}</span>
                    </div>
                    <div class="job-meta">
                        <span><i class="fas fa-briefcase"></i> ${escapeHtml(job.role)}</span>
                        <span><i class="fas fa-users"></i> ${job.number_of_staff} needed</span>
                        <span><i class="fas fa-calendar"></i> ${formatDate(job.date)}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(job.location)}</span>
                    </div>
                    <p class="job-description">${escapeHtml(job.description)}</p>
                    <div class="job-skills">
                        ${job.skills ? job.skills.split(',').map(s => `<span class="skill-tag">${escapeHtml(s.trim())}</span>`).join('') : ''}
                    </div>
                    <div class="job-footer">
                        <div class="pay-rate">₹${job.pay_rate}/${job.payment_type}</div>
                        ${hasApplied 
                            ? '<button class="btn-primary" disabled style="opacity: 0.6; cursor: not-allowed;">Applied</button>'
                            : `<button class="btn-primary apply-job-btn" data-job-id="${job.id}">Apply Now</button>`
                        }
                    </div>
                </div>
            `;
            }).join('');
        }
        
        // Add filter functionality if in staff portal
        if (isStaffPortal) {
            setupJobFilters();
        }
    }

    function setupJobFilters() {
        const searchInput = document.getElementById('job-search-input');
        const locationFilter = document.getElementById('filter-location');
        const eventTypeFilter = document.getElementById('filter-event-type');
        const payRangeFilter = document.getElementById('filter-pay-range');
        
        if (!searchInput) return;
        
        const filterJobs = () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            const locationTerm = locationFilter?.value.toLowerCase().trim();
            const eventType = eventTypeFilter?.value.toLowerCase();
            const payRange = payRangeFilter?.value;
            
            const jobCards = document.querySelectorAll('.job-listing-card');
            
            jobCards.forEach(card => {
                const text = card.textContent.toLowerCase();
                
                // Get job location from the card (look for location details)
                const locationElement = card.querySelector('[class*="location"], [class*="detail"]');
                const jobLocation = locationElement ? locationElement.textContent.toLowerCase() : text;
                
                const payElement = card.querySelector('.job-pay');
                const pay = payElement ? parseInt(payElement.textContent.replace(/[^0-9]/g, '')) : 0;
                
                let show = true;
                
                // Search filter - searches in entire card text
                if (searchTerm && !text.includes(searchTerm)) {
                    show = false;
                }
                
                // Location filter - specifically analyzes job location
                // Checks if the entered location matches any part of the job's location
                if (locationTerm && locationTerm.length > 0) {
                    // Split location terms by common separators (comma, space, etc)
                    const locationWords = locationTerm.split(/[\s,]+/).filter(word => word.length > 2);
                    
                    // Check if any of the location words match the job location
                    const hasLocationMatch = locationWords.some(word => 
                        jobLocation.includes(word) || word.includes(jobLocation)
                    );
                    
                    if (!hasLocationMatch) {
                        show = false;
                    }
                }
                
                // Event type filter
                if (eventType && !text.includes(eventType)) {
                    show = false;
                }
                
                // Pay range filter
                if (payRange) {
                    if (payRange === '0-2000' && pay > 2000) show = false;
                    if (payRange === '2000-3000' && (pay < 2000 || pay > 3000)) show = false;
                    if (payRange === '3000-5000' && (pay < 3000 || pay > 5000)) show = false;
                    if (payRange === '5000+' && pay < 5000) show = false;
                }
                
                card.style.display = show ? 'block' : 'none';
            });
        };
        
        searchInput.addEventListener('input', filterJobs);
        // Changed from 'change' to 'input' for real-time filtering as user types
        locationFilter?.addEventListener('input', filterJobs);
        eventTypeFilter?.addEventListener('change', filterJobs);
        payRangeFilter?.addEventListener('change', filterJobs);
    }

    async function loadTalentGrid() {
        try {
            const res = await fetch(`${API_BASE}/talent/`);
            const data = await res.json();
            renderTalentGrid(data.results || []);
        } catch (err) {
            console.error('Failed to load talent:', err);
        }
    }

    function renderTalentGrid(talents) {
        const container = document.getElementById('talentGrid');
        if (!container) return;
        
        if (talents.length === 0) {
            container.innerHTML = '<p class="empty-state">No talent profiles found.</p>';
            return;
        }
        
        container.innerHTML = talents.map(talent => `
            <div class="talent-card">
                <div class="talent-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <h3>${escapeHtml(talent.username)}</h3>
                <p class="talent-city"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(talent.city)}</p>
                ${talent.badge ? `<span class="badge badge-pro">${escapeHtml(talent.badge)}</span>` : ''}
                <p class="talent-bio">${escapeHtml(talent.bio || 'No bio available')}</p>
                <div class="talent-verification">
                    ${talent.kyc_verified ? '<span class="verified"><i class="fas fa-check-circle"></i> KYC</span>' : ''}
                    ${talent.video_verified ? '<span class="verified"><i class="fas fa-video"></i> Video</span>' : ''}
                </div>
                <button class="btn-secondary" data-profile-id="${talent.id}">View Profile</button>
            </div>
        `).join('');
    }

    // Load talent grid for organizer dashboard
    async function loadOrganizerTalentGrid() {
        try {
            const res = await fetch(`${API_BASE}/talent/`);
            const data = await res.json();
            renderOrganizerTalentGrid(data.results || []);
        } catch (err) {
            console.error('Failed to load talent:', err);
        }
    }

    function renderOrganizerTalentGrid(talents) {
        const container = document.getElementById('talent-grid-organizer');
        if (!container) return;
        
        if (talents.length === 0) {
            container.innerHTML = '<p class="empty-state">No talent profiles found.</p>';
            return;
        }
        
        container.innerHTML = talents.map(talent => {
            const skills = talent.bio ? talent.bio.split(',').slice(0, 3) : [];
            const rating = talent.rating || 4.5;
            const stars = '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '★' : '☆').repeat(5 - Math.ceil(rating));
            const completedEvents = talent.events_completed || 0;
            const badgeClass = talent.badge === 'Elite Pro' ? 'elite' : talent.badge === 'Pro' ? 'pro' : 'rising';
            const firstName = talent.first_name || talent.username.split(' ')[0];
            const lastName = talent.last_name || talent.username.split(' ')[1] || '';
            const fullName = `${firstName} ${lastName}`.trim();
            
            return `
                <div class="talent-card">
                    <div class="talent-header">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=6366f1&color=fff" alt="${escapeHtml(fullName)}">
                        ${talent.badge ? `<div class="talent-badge ${badgeClass}">${escapeHtml(talent.badge)}</div>` : ''}
                    </div>
                    <h3>${escapeHtml(fullName)}</h3>
                    <p class="talent-role">${escapeHtml(talent.bio ? talent.bio.split(',')[0] : 'Event Professional')}</p>
                    <div class="talent-rating">
                        <span class="stars">${stars}</span>
                        <span>${rating.toFixed(1)} (${completedEvents} reviews)</span>
                    </div>
                    ${skills.length > 0 ? `
                    <div class="talent-skills">
                        ${skills.map(skill => `<span>${escapeHtml(skill.trim())}</span>`).join('')}
                    </div>
                    ` : ''}
                    <div class="talent-info">
                        <p><i class="fas fa-map-marker-alt"></i> ${escapeHtml(talent.city || 'India')}</p>
                        <p><i class="fas fa-briefcase"></i> ${completedEvents} Events</p>
                        <p><i class="fas fa-rupee-sign"></i> ₹${talent.expected_pay || 2000}/day</p>
                    </div>
                    <div class="talent-actions">
                        <button class="btn-outline view-profile-btn" data-profile-id="${talent.id}">View Profile</button>
                        <button class="btn-primary hire-talent-btn" data-talent-id="${talent.id}" data-talent-name="${escapeHtml(fullName)}">Hire Now</button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Setup filters
        setupTalentFilters();
    }

    function setupTalentFilters() {
        const searchInput = document.getElementById('talent-search-input');
        const skillsFilter = document.getElementById('filter-talent-skills');
        const ratingFilter = document.getElementById('filter-talent-rating');
        const badgeFilter = document.getElementById('filter-talent-badge');
        
        if (!searchInput) return;
        
        const filterTalent = () => {
            const searchTerm = searchInput.value.toLowerCase();
            const skills = skillsFilter?.value.toLowerCase();
            const rating = ratingFilter?.value;
            const badge = badgeFilter?.value;
            
            const talentCards = document.querySelectorAll('.talent-card');
            
            talentCards.forEach(card => {
                const text = card.textContent.toLowerCase();
                const cardRating = parseFloat(card.querySelector('.talent-rating span:last-child')?.textContent || '0');
                const cardBadge = card.querySelector('.talent-badge')?.textContent || '';
                
                let show = true;
                
                // Search filter
                if (searchTerm && !text.includes(searchTerm)) {
                    show = false;
                }
                
                // Skills filter
                if (skills && !text.includes(skills)) {
                    show = false;
                }
                
                // Rating filter
                if (rating) {
                    const minRating = parseFloat(rating);
                    if (cardRating < minRating) {
                        show = false;
                    }
                }
                
                // Badge filter
                if (badge && !cardBadge.includes(badge)) {
                    show = false;
                }
                
                card.style.display = show ? 'block' : 'none';
            });
        };
        
        searchInput.addEventListener('input', filterTalent);
        skillsFilter?.addEventListener('change', filterTalent);
        ratingFilter?.addEventListener('change', filterTalent);
        badgeFilter?.addEventListener('change', filterTalent);
    }

    async function loadMyApplications() {
        try {
            const res = await fetch(`${API_BASE}/applications/`, {
                credentials: 'include'
            });
            
            if (!res.ok) {
                if (res.status === 401) {
                    console.log('User not authenticated');
                }
                return;
            }
            
            const data = await res.json();
            renderApplications(data.results || []);
        } catch (err) {
            console.error('Failed to load applications:', err);
        }
    }

    // New function for staff portal applications
    async function loadStaffApplications() {
        try {
            const res = await fetch(`${API_BASE}/applications/`, {
                credentials: 'include'
            });
            
            if (!res.ok) {
                if (res.status === 401) {
                    console.log('User not authenticated - redirecting to login');
                    localStorage.removeItem('eventflex_user');
                    window.location.href = '/login';
                }
                return;
            }
            
            const data = await res.json();
            const applications = data.results || [];
            
            renderStaffApplications(applications);
        } catch (err) {
            console.error('Failed to load applications:', err);
        }
    }

    function renderStaffApplications(applications) {
        const pending = applications.filter(app => app.status === 'pending');
        const accepted = applications.filter(app => app.status === 'accepted');
        const rejected = applications.filter(app => app.status === 'rejected');
        
        // Update counts
        document.getElementById('pending-count').textContent = `(${pending.length})`;
        document.getElementById('accepted-count').textContent = `(${accepted.length})`;
        document.getElementById('rejected-count').textContent = `(${rejected.length})`;
        
        // Render pending applications
        const pendingContainer = document.getElementById('pending-applications');
        if (pendingContainer) {
            if (pending.length === 0) {
                pendingContainer.innerHTML = '<p class="empty-state">No pending applications.</p>';
            } else {
                pendingContainer.innerHTML = pending.map(app => renderApplicationCard(app, 'pending')).join('');
            }
        }
        
        // Render accepted applications (these should NOT appear here, only in bookings)
        const acceptedContainer = document.getElementById('accepted-applications');
        if (acceptedContainer) {
            if (accepted.length === 0) {
                acceptedContainer.innerHTML = '<p class="empty-state">No accepted applications. Accepted applications move to "My Bookings".</p>';
            } else {
                acceptedContainer.innerHTML = accepted.map(app => renderApplicationCard(app, 'accepted')).join('');
            }
        }
        
        // Render rejected applications
        const rejectedContainer = document.getElementById('rejected-applications');
        if (rejectedContainer) {
            if (rejected.length === 0) {
                rejectedContainer.innerHTML = '<p class="empty-state">No rejected applications.</p>';
            } else {
                rejectedContainer.innerHTML = rejected.map(app => renderApplicationCard(app, 'rejected')).join('');
            }
        }
    }

    function renderApplicationCard(app, status) {
        const statusBadgeClass = status === 'pending' ? 'pending' : status === 'accepted' ? 'confirmed' : 'pending';
        const statusText = status === 'pending' ? 'Under Review' : status === 'accepted' ? 'Accepted' : 'Closed';
        const organizerName = app.job.organizer?.username || 'Unknown Organizer';
        
        return `
            <div class="application-card">
                <div class="application-header">
                    <div>
                        <h3>${escapeHtml(app.job.title)}</h3>
                        <p>${escapeHtml(organizerName)} • ${escapeHtml(app.job.location)}</p>
                    </div>
                    <span class="status-badge ${statusBadgeClass}">${statusText}</span>
                </div>
                <div class="application-details">
                    <p><i class="fas fa-calendar"></i> ${formatDate(app.job.date)} • ${app.job.start_time || 'TBD'} - ${app.job.end_time || 'TBD'}</p>
                    <p><i class="fas fa-rupee-sign"></i> ₹${app.job.pay_rate}/${app.job.payment_type}</p>
                </div>
                <div class="application-footer">
                    <span class="applied-date">Applied ${getTimeAgo(app.created_at)}</span>
                    ${status === 'pending' ? '<button class="btn-outline btn-sm" onclick="withdrawApplication(' + app.id + ')">Withdraw</button>' : ''}
                </div>
            </div>
        `;
    }

    async function loadStaffBookings() {
        try {
            const res = await fetch(`${API_BASE}/applications/`, {
                credentials: 'include'
            });
            
            if (!res.ok) {
                if (res.status === 401) {
                    console.log('User not authenticated - redirecting to login');
                    localStorage.removeItem('eventflex_user');
                    window.location.href = '/login';
                }
                return;
            }
            
            const data = await res.json();
            const applications = data.results || [];
            
            // Only accepted applications are bookings
            const acceptedApplications = applications.filter(app => app.status === 'accepted');
            
            renderStaffBookings(acceptedApplications);
        } catch (err) {
            console.error('Failed to load bookings:', err);
        }
    }

    function renderStaffBookings(applications) {
        const now = new Date();
        const upcoming = applications.filter(app => {
            const jobDate = new Date(app.job.date);
            return jobDate >= now;
        });
        const completed = applications.filter(app => {
            const jobDate = new Date(app.job.date);
            return jobDate < now;
        });
        
        // Update counts
        document.getElementById('upcoming-bookings-count').textContent = `(${upcoming.length})`;
        document.getElementById('completed-bookings-count').textContent = `(${completed.length})`;
        document.getElementById('cancelled-bookings-count').textContent = `(0)`;
        
        // Render upcoming bookings
        const upcomingContainer = document.getElementById('upcoming-bookings');
        if (upcomingContainer) {
            if (upcoming.length === 0) {
                upcomingContainer.innerHTML = '<p class="empty-state">No upcoming bookings.</p>';
            } else {
                upcomingContainer.innerHTML = upcoming.map(app => renderBookingCard(app, 'upcoming')).join('');
            }
        }
        
        // Render completed bookings
        const completedContainer = document.getElementById('completed-bookings');
        if (completedContainer) {
            if (completed.length === 0) {
                completedContainer.innerHTML = '<p class="empty-state">No completed bookings.</p>';
            } else {
                completedContainer.innerHTML = completed.map(app => renderBookingCard(app, 'completed')).join('');
            }
        }
    }

    function renderBookingCard(app, type) {
        const jobDate = new Date(app.job.date);
        const day = jobDate.getDate();
        const month = jobDate.toLocaleDateString('en-US', { month: 'short' });
        const organizerName = app.job.organizer?.username || 'Unknown Organizer';
        const statusBadgeClass = type === 'upcoming' ? 'confirmed' : 'completed';
        const statusText = type === 'upcoming' ? 'Confirmed' : 'Completed';
        
        return `
            <div class="booking-card">
                <div class="booking-header">
                    <div class="booking-date-badge">
                        <span class="day">${day}</span>
                        <span class="month">${month}</span>
                    </div>
                    <div class="booking-info">
                        <h3>${escapeHtml(app.job.title)}</h3>
                        <p class="organizer">${escapeHtml(organizerName)}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${escapeHtml(app.job.location)}</p>
                    </div>
                    <span class="status-badge ${statusBadgeClass}">${statusText}</span>
                </div>
                <div class="booking-details">
                    <div class="detail-item">
                        <span class="label">Time:</span>
                        <span class="value">${app.job.start_time || 'TBD'} - ${app.job.end_time || 'TBD'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Role:</span>
                        <span class="value">${escapeHtml(app.job.role)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Payment:</span>
                        <span class="value">₹${app.job.pay_rate}</span>
                    </div>
                    ${type === 'upcoming' ? `
                    <div class="detail-item">
                        <span class="label">Check-in:</span>
                        <span class="value"><button class="btn-sm btn-primary" onclick="generateQRCode(${app.id}, '${escapeHtml(app.job.title)}', '${formatDate(app.job.date)}', '${escapeHtml(app.job.location)}')">Generate QR</button></span>
                    </div>
                    ` : ''}
                </div>
                <div class="booking-actions">
                    <button class="btn-outline">View Details</button>
                    ${type === 'upcoming' ? '<button class="btn-outline">Contact Organizer</button>' : ''}
                    ${type === 'completed' ? '<button class="btn-outline">Download Invoice</button>' : ''}
                </div>
            </div>
        `;
    }

    function getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        const weeks = Math.floor(days / 7);
        if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        return formatDate(dateString);
    }

    // Wallet Functions
    async function loadWalletData() {
        await loadWalletStats();
        await loadTransactionHistory();
    }

    async function loadWalletStats() {
        try {
            const res = await fetch(`${API_BASE}/wallet/stats/`, {
                credentials: 'include'
            });
            
            if (!res.ok) {
                if (res.status === 401) {
                    console.log('User not authenticated - redirecting to login');
                    localStorage.removeItem('eventflex_user');
                    window.location.href = '/login';
                }
                return;
            }
            
            const data = await res.json();
            
            // Update balance cards
            document.getElementById('available-balance').textContent = `₹${formatNumber(data.available_balance)}`;
            document.getElementById('pending-amount').textContent = `₹${formatNumber(data.pending_amount)}`;
            document.getElementById('pending-text').textContent = `From ${data.pending_count} completed event${data.pending_count !== 1 ? 's' : ''}`;
            document.getElementById('total-earned').textContent = `₹${formatNumber(data.total_earned)}`;
            document.getElementById('total-events-text').textContent = `Across ${data.total_events} event${data.total_events !== 1 ? 's' : ''}`;
            
            // Render earnings chart
            renderEarningsChart(data.monthly_earnings);
        } catch (err) {
            console.error('Failed to load wallet stats:', err);
        }
    }

    function renderEarningsChart(monthlyData) {
        const chartBars = document.getElementById('earnings-chart');
        const chartLabels = document.getElementById('chart-labels');
        
        if (!chartBars || !chartLabels) return;
        
        if (monthlyData.length === 0) {
            chartBars.innerHTML = '<p class="empty-state">No earnings data available</p>';
            chartLabels.innerHTML = '';
            return;
        }
        
        // Find max amount for scaling
        const maxAmount = Math.max(...monthlyData.map(m => parseFloat(m.amount)), 1);
        
        // Generate bars
        chartBars.innerHTML = monthlyData.map(item => {
            const amount = parseFloat(item.amount);
            const height = (amount / maxAmount) * 100;
            const displayAmount = amount >= 1000 ? `₹${(amount / 1000).toFixed(0)}k` : `₹${amount}`;
            
            return `<div class="chart-bar" style="height: ${height}%"><span>${displayAmount}</span></div>`;
        }).join('');
        
        // Generate labels
        chartLabels.innerHTML = monthlyData.map(item => 
            `<span>${item.month}</span>`
        ).join('');
    }

    async function loadTransactionHistory() {
        try {
            const res = await fetch(`${API_BASE}/transactions/`, {
                credentials: 'include'
            });
            
            if (!res.ok) {
                if (res.status === 401) {
                    console.log('User not authenticated - redirecting to login');
                    localStorage.removeItem('eventflex_user');
                    window.location.href = '/login';
                }
                return;
            }
            
            const data = await res.json();
            const transactions = data.results || [];
            
            renderTransactionHistory(transactions);
        } catch (err) {
            console.error('Failed to load transactions:', err);
        }
    }

    function renderTransactionHistory(transactions) {
        const container = document.getElementById('transactions-list');
        if (!container) return;
        
        if (transactions.length === 0) {
            container.innerHTML = '<tr><td colspan="5" class="empty-state">No transactions found</td></tr>';
            return;
        }
        
        container.innerHTML = transactions.map(txn => {
            const date = formatDate(txn.created_at);
            const statusClass = txn.status === 'completed' ? 'completed' : 'pending';
            const statusText = txn.status === 'completed' ? 'Paid' : 'Pending';
            const eventTitle = txn.event_title || 'Payment';
            const organizerName = txn.organizer_name || '-';
            
            return `
                <tr>
                    <td>${date}</td>
                    <td>${escapeHtml(eventTitle)}</td>
                    <td>${escapeHtml(organizerName)}</td>
                    <td>₹${formatNumber(txn.amount)}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                </tr>
            `;
        }).join('');
    }

    function formatNumber(num) {
        const number = parseFloat(num);
        return number.toLocaleString('en-IN', { maximumFractionDigits: 0 });
    }

    window.withdrawApplication = async function(appId) {
        if (!confirm('Are you sure you want to withdraw this application?')) {
            return;
        }
        
        showToast('Withdraw functionality coming soon', 'info');
    };


    function renderApplications(applications) {
        const tabs = ['pending', 'accepted', 'rejected'];
        
        tabs.forEach(status => {
            const container = document.querySelector(`[data-tab-content="${status}-applications"]`);
            if (!container) return;
            
            const filtered = applications.filter(app => app.status === status);
            
            if (filtered.length === 0) {
                container.innerHTML = '<p class="empty-state">No ' + status + ' applications found.</p>';
                return;
            }
            
            container.innerHTML = filtered.map(app => `
                <div class="application-card">
                    <h3>${escapeHtml(app.job.title)}</h3>
                    <div class="application-meta">
                        <span><i class="fas fa-briefcase"></i> ${escapeHtml(app.job.role)}</span>
                        <span><i class="fas fa-calendar"></i> ${formatDate(app.job.date)}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(app.job.location)}</span>
                    </div>
                    <p><strong>Cover:</strong> ${escapeHtml(app.cover_message)}</p>
                    <p><strong>Pay:</strong> ₹${app.job.pay_rate}/${app.job.payment_type}</p>
                    <p class="application-date">Applied: ${formatDate(app.created_at)}</p>
                    <span class="badge badge-${status}">${capitalize(status)}</span>
                </div>
            `).join('');
        });
    }

    async function loadMyJobs() {
        try {
            const res = await fetch(`${API_BASE}/jobs/my/`, {
                credentials: 'include'
            });
            
            if (!res.ok) return;
            
            const data = await res.json();
            renderMyJobs(data.results || []);
        } catch (err) {
            console.error('Failed to load jobs:', err);
        }
    }

    function renderMyJobs(jobs) {
        const container = document.querySelector('[data-tab-content="active-jobs"]');
        if (!container) return;
        
        if (jobs.length === 0) {
            container.innerHTML = '<p class="empty-state">No jobs posted yet. Create your first job posting!</p>';
            return;
        }
        
        container.innerHTML = jobs.map(job => `
            <div class="job-card">
                <div class="job-header">
                    <h3>${escapeHtml(job.title)}</h3>
                    <span class="badge badge-${job.event_type}">${escapeHtml(job.event_type)}</span>
                </div>
                <div class="job-meta">
                    <span><i class="fas fa-briefcase"></i> ${escapeHtml(job.role)}</span>
                    <span><i class="fas fa-users"></i> ${job.number_of_staff} needed</span>
                    <span><i class="fas fa-calendar"></i> ${formatDate(job.date)}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(job.location)}</span>
                </div>
                <p>${escapeHtml(job.description)}</p>
                <div class="job-footer">
                    <div class="pay-rate">₹${job.pay_rate}/${job.payment_type}</div>
                </div>
            </div>
        `).join('');
    }

    async function loadMessages() {
        try {
            const res = await fetch(`${API_BASE}/messages/`, {
                credentials: 'include'
            });
            
            if (!res.ok) return;
            
            const data = await res.json();
            renderMessages(data.results || []);
        } catch (err) {
            console.error('Failed to load messages:', err);
        }
    }

    function renderMessages(messages) {
        const container = document.querySelector('.chat-messages');
        if (!container) return;
        
        if (messages.length === 0) {
            container.innerHTML = '<p class="empty-state">No messages yet. Start a conversation!</p>';
            return;
        }
        
        container.innerHTML = messages.map(msg => {
            const isSent = currentUser && msg.sender.id === currentUser.id;
            return `
                <div class="message ${isSent ? 'sent' : 'received'}">
                    <p><strong>${escapeHtml(isSent ? 'You' : msg.sender.username)}:</strong> ${escapeHtml(msg.text)}</p>
                    <span class="time">${formatDateTime(msg.created_at)}</span>
                </div>
            `;
        }).join('');
        
        container.scrollTop = container.scrollHeight;
    }

    async function loadTransactions() {
        try {
            const res = await fetch(`${API_BASE}/transactions/`, {
                credentials: 'include'
            });
            
            if (!res.ok) return;
            
            const data = await res.json();
            renderTransactions(data.results || []);
        } catch (err) {
            console.error('Failed to load transactions:', err);
        }
    }

    function renderTransactions(transactions) {
        const container = document.getElementById('transactionsList');
        if (!container) return;
        
        if (transactions.length === 0) {
            container.innerHTML = '<p class="empty-state">No transactions yet.</p>';
            return;
        }
        
        container.innerHTML = transactions.map(txn => `
            <div class="transaction-item">
                <div>
                    <strong>${escapeHtml(txn.note)}</strong>
                    <span class="date">${formatDate(txn.created_at)}</span>
                </div>
                <div class="amount ${parseFloat(txn.amount) >= 0 ? 'positive' : 'negative'}">
                    ${parseFloat(txn.amount) >= 0 ? '+' : ''}₹${txn.amount}
                </div>
            </div>
        `).join('');
    }

    async function loadProfileData() {
        if (!currentUser) {
            console.log('No currentUser found in loadProfileData');
            return;
        }
        
        console.log('Loading profile data for:', currentUser); // Debug log
        
        // Populate profile header
        const profileName = document.querySelector('.profile-header-info h2');
        if (profileName) {
            profileName.textContent = currentUser.username || 'User';
        }
        
        // Update all profile display elements (not just form inputs)
        const navUserName = document.querySelector('.nav-user .user-profile span');
        if (navUserName) {
            navUserName.textContent = currentUser.username || 'User';
        }
        
        // Update profile image
        const profileImages = document.querySelectorAll('.profile-image-large, .user-avatar img, .nav-user img, .profile-header img');
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username || 'User')}&background=6366f1&color=fff`;
        profileImages.forEach(img => {
            img.src = avatarUrl;
            img.alt = currentUser.username;
        });
        
        // Update profile role
        const profileRole = document.querySelector('.profile-role');
        if (profileRole) {
            profileRole.textContent = currentUser.user_type === 'organizer' ? 'Event Organizer' : 'Event Professional';
        }
        
        // Populate form fields
        const profileForm = document.querySelector('.profile-form');
        if (profileForm) {
            console.log('Populating profile form with:', currentUser); // Debug log
            
            // Full Name / Company Name
            const nameInput = profileForm.querySelector('input[name="username"]');
            if (nameInput) {
                nameInput.value = currentUser.username || '';
                console.log('Set username to:', currentUser.username);
            }
            
            // Contact Person (for organizers) - use username if not available
            const contactInput = profileForm.querySelector('input[name="contact_person"]');
            if (contactInput) {
                contactInput.value = currentUser.contact_person || currentUser.username || '';
                console.log('Set contact_person to:', currentUser.contact_person || currentUser.username);
            }
            
            // Email
            const emailInput = profileForm.querySelector('input[name="email"]');
            if (emailInput) {
                emailInput.value = currentUser.email || '';
                console.log('Set email to:', currentUser.email);
            }
            
            // Phone
            const phoneInput = profileForm.querySelector('input[name="phone"]');
            if (phoneInput) {
                phoneInput.value = currentUser.phone || '';
                console.log('Set phone to:', currentUser.phone);
            }
            
            // City
            const citySelect = profileForm.querySelector('select[name="city"]');
            if (citySelect && currentUser.city) {
                citySelect.value = currentUser.city.toLowerCase();
                console.log('Set city to:', currentUser.city);
            }
            
            // Bio
            const bioTextarea = profileForm.querySelector('textarea[name="bio"]');
            if (bioTextarea) {
                bioTextarea.value = currentUser.bio || '';
                console.log('Set bio to:', currentUser.bio || '(empty)');
            }
        } else {
            console.log('Profile form not found');
        }
        
        // Update verification badges
        const badgesContainer = document.querySelector('.profile-badges');
        if (badgesContainer && currentUser.kyc_verified !== undefined) {
            let badgesHTML = '';
            
            if (currentUser.badge) {
                const badgeIcons = {
                    'elite': 'crown',
                    'pro': 'star',
                    'verified': 'check-circle'
                };
                const icon = badgeIcons[currentUser.badge.toLowerCase()] || 'check-circle';
                badgesHTML += `<span class="badge-elite"><i class="fas fa-${icon}"></i> ${currentUser.badge}</span>`;
            }
            
            if (currentUser.kyc_verified) {
                badgesHTML += `<span class="badge-verified"><i class="fas fa-check-circle"></i> KYC Verified</span>`;
            }
            
            if (currentUser.video_verified) {
                badgesHTML += `<span class="badge-verified"><i class="fas fa-video"></i> Video Verified</span>`;
            }
            
            if (badgesHTML) {
                badgesContainer.innerHTML = badgesHTML;
            }
        }
        
        // Update dashboard welcome message
        const welcomeUser = document.querySelector('.dashboard-main h1');
        if (welcomeUser && welcomeUser.textContent.includes('Welcome')) {
            welcomeUser.textContent = `Welcome back, ${currentUser.username}! 👋`;
        }
    }

    // ============ HELPER FUNCTIONS ============
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    function formatDateTime(dateStr) {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleString('en-IN', { 
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // ============ MOBILE NAVIGATION ============
    function initMobileNav() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        if (!hamburger || !navMenu) return;

        const closeMenu = () => {
            navMenu.classList.remove('open');
            hamburger.classList.remove('active');
            document.body.classList.remove('menu-open');
        };

        const toggleMenu = () => {
            navMenu.classList.toggle('open');
            hamburger.classList.toggle('active');
            document.body.classList.toggle('menu-open', navMenu.classList.contains('open'));
        };

        hamburger.addEventListener('click', toggleMenu);

        navMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => closeMenu());
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) {
                closeMenu();
            }
        });

        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeMenu();
            }
        });
    }

    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        if (!links.length) return;

        links.forEach((link) => {
            const href = link.getAttribute('href');
            if (!href || href.length <= 1) return;
            if (link.closest('.sidebar-menu')) return;

            const target = document.getElementById(href.substring(1));
            if (!target) return;

            link.addEventListener('click', (event) => {
                event.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    function initMarketingTabs() {
        const buttons = document.querySelectorAll('.tab-btn');
        const contents = document.querySelectorAll('.tab-content');
        if (!buttons.length || !contents.length) return;

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                const targetId = button.dataset.tab;
                if (!targetId) return;

                buttons.forEach((btn) => btn.classList.toggle('active', btn === button));
                contents.forEach((content) => content.classList.toggle('active', content.id === targetId));
            });
        });
    }

    function initDashboardNavigation() {
        const sidebar = document.querySelector('.sidebar-menu');
        const sections = document.querySelectorAll('.dashboard-section');
        if (!sidebar || !sections.length) return;

        const links = Array.from(sidebar.querySelectorAll('a')).filter((link) => {
            const href = link.getAttribute('href');
            return href && href.startsWith('#');
        });

        const activateSection = (targetId) => {
            sections.forEach((section) => {
                section.classList.toggle('active', section.id === targetId);
            });

            links.forEach((link) => {
                const listItem = link.parentElement;
                if (!listItem) return;
                const matches = link.getAttribute('href') === `#${targetId}`;
                listItem.classList.toggle('active', matches);
            });

            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Load data when specific sections are activated
            if (targetId === 'discover-jobs') {
                loadJobListings();
            } else if (targetId === 'discover') {
                loadOrganizerTalentGrid();
            } else if (targetId === 'my-applications') {
                loadStaffApplications();
            } else if (targetId === 'my-bookings') {
                loadStaffBookings();
            } else if (targetId === 'dashboard') {
                // Check which dashboard (organizer or staff)
                if (document.getElementById('stat-active-jobs')) {
                    loadDashboardStats();
                    loadUpcomingEvents();
                    loadRecentApplications();
                } else if (document.getElementById('stat-events-completed')) {
                    loadStaffDashboardStats();
                    loadStaffUpcomingEvents();
                }
            }
        };

        links.forEach((link) => {
            const href = link.getAttribute('href');
            if (!href) return;
            const targetId = href.substring(1);
            const targetSection = document.getElementById(targetId);
            if (!targetSection) return;

            link.addEventListener('click', (event) => {
                event.preventDefault();
                activateSection(targetId);
                if (history.replaceState) {
                    history.replaceState(null, '', `#${targetId}`);
                }
            });
        });

        const initialLink = links.find((link) => link.parentElement?.classList.contains('active')) || links[0];
        if (initialLink) {
            const initialId = initialLink.getAttribute('href').substring(1);
            activateSection(initialId);
        }
    }

    function initSecondaryTabs() {
        const tabGroups = document.querySelectorAll('.tabs-secondary');
        if (!tabGroups.length) return;

        tabGroups.forEach((group) => {
            const buttons = group.querySelectorAll('.tab-btn-secondary');
            if (!buttons.length) return;

            const section = group.closest('.dashboard-section');
            const panels = section ? section.querySelectorAll('[data-tab-content]') : [];

            const showPanel = (target) => {
                panels.forEach((panel) => {
                    panel.hidden = panel.dataset.tabContent !== target;
                });
            };

            buttons.forEach((button) => {
                button.addEventListener('click', () => {
                    const target = button.dataset.tab;
                    buttons.forEach((btn) => btn.classList.toggle('active', btn === button));
                    if (target) {
                        showPanel(target);
                    }
                });
            });

            const initialButton = group.querySelector('.tab-btn-secondary.active') || buttons[0];
            if (initialButton) {
                initialButton.click();
            }
        });
    }

    function initUserTypeSelectors() {
        const selectors = document.querySelectorAll('.user-type-selector');
        if (!selectors.length) return;

        // Check URL parameter for pre-selection
        const urlParams = new URLSearchParams(window.location.search);
        const typeFromUrl = urlParams.get('type');

        selectors.forEach((selector) => {
            const buttons = selector.querySelectorAll('.user-type-btn');
            if (!buttons.length) return;

            const resolveForm = () => {
                const next = selector.nextElementSibling;
                if (next && next.tagName === 'FORM') return next;
                return selector.closest('.auth-card')?.querySelector('form') || null;
            };

            const form = resolveForm();

            const activate = (button) => {
                buttons.forEach((btn) => btn.classList.toggle('active', btn === button));
                if (form) {
                    form.dataset.userType = button.dataset.type || '';
                }
            };

            buttons.forEach((button) => {
                button.addEventListener('click', () => activate(button));
            });

            // Pre-select based on URL parameter or default to first active button
            let initial = selector.querySelector('.user-type-btn.active');
            if (typeFromUrl) {
                const matchingBtn = Array.from(buttons).find(btn => btn.dataset.type === typeFromUrl);
                if (matchingBtn) {
                    initial = matchingBtn;
                }
            }
            initial = initial || buttons[0];
            if (initial) activate(initial);
        });
    }

    function initSkillTags() {
        const skillAreas = document.querySelectorAll('.skill-tags');
        if (!skillAreas.length) return;

        skillAreas.forEach((area) => {
            const input = area.querySelector('input');
            if (!input) return;

            normalizeExistingTags(area);

            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ',') {
                    event.preventDefault();
                    const value = input.value.trim().replace(/,$/, '');
                    if (!value) return;
                    addSkillTag(area, value);
                    input.value = '';
                }
            });

            area.addEventListener('click', (event) => {
                const target = event.target;
                if (target.classList.contains('remove-skill')) {
                    target.parentElement?.remove();
                    return;
                }
                input.focus();
            });
        });
    }

    function normalizeExistingTags(area) {
        area.querySelectorAll('.skill-tag').forEach((tag) => {
            const label = getSkillTagLabel(tag);
            tag.dataset.value = label;

            let icon = tag.querySelector('i.fa-times');
            if (!icon) {
                icon = document.createElement('i');
                icon.className = 'fas fa-times';
                tag.appendChild(icon);
            }

            let labelElement = tag.querySelector('.skill-label');
            if (!labelElement) {
                labelElement = document.createElement('span');
                labelElement.className = 'skill-label';
                labelElement.textContent = label;
                tag.insertBefore(labelElement, icon);
            } else {
                labelElement.textContent = label;
            }

            Array.from(tag.childNodes)
                .filter((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim())
                .forEach((node) => node.parentNode?.removeChild(node));

            icon.classList.add('remove-skill');
            icon.setAttribute('role', 'button');
            icon.setAttribute('tabindex', '0');
            icon.setAttribute('aria-label', `Remove ${label}`);
        });
    }

    function addSkillTag(area, value) {
        const normalized = value.trim();
        if (!normalized) return;

        const exists = Array.from(area.querySelectorAll('.skill-tag')).some(
            (tag) => getSkillTagLabel(tag).toLowerCase() === normalized.toLowerCase()
        );

        if (exists) {
            showToast(`"${normalized}" is already added.`, 'info');
            return;
        }

        const tag = document.createElement('span');
        tag.className = 'skill-tag';
        tag.dataset.value = normalized;

        const labelSpan = document.createElement('span');
        labelSpan.className = 'skill-label';
        labelSpan.textContent = normalized;

        const icon = document.createElement('i');
        icon.className = 'fas fa-times remove-skill';
        icon.setAttribute('role', 'button');
        icon.setAttribute('tabindex', '0');
        icon.setAttribute('aria-label', `Remove ${normalized}`);

        tag.append(labelSpan, icon);
        area.insertBefore(tag, area.querySelector('input'));
    }

    function getSkillTagLabel(tag) {
        const explicitLabel = tag.querySelector('.skill-label');
        if (explicitLabel) return explicitLabel.textContent.trim();

        const clone = tag.cloneNode(true);
        clone.querySelectorAll('i').forEach((icon) => icon.remove());
        return clone.textContent.replace(/×/, '').trim();
    }

    // ============ FORM HANDLERS ============
    function initFormHandlers() {
        // Logout Button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (event) => {
                event.preventDefault();
                handleLogout();
            });
        }

        // Job Post Form
        const jobForm = document.getElementById('jobPostForm');
        if (jobForm) {
            jobForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                await handleJobPost(jobForm);
            });
        }

        // Login Form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                await handleLogin(loginForm);
            });
        }

        // Signup Form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                await handleSignup(signupForm);
            });
        }

        // Profile Forms
        document.querySelectorAll('.profile-form').forEach((form) => {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                await handleProfileUpdate(form);
            });
        });

        // Apply Job Buttons (delegated)
        document.addEventListener('click', async (event) => {
            const btn = event.target.closest('.apply-job-btn');
            if (btn) {
                event.preventDefault();
                await handleJobApply(btn);
            }
        });

        // View Profile Buttons (delegated)
        document.addEventListener('click', async (event) => {
            const btn = event.target.closest('.view-profile-btn');
            if (btn) {
                event.preventDefault();
                await handleViewProfile(btn);
            }
        });

        // Hire Talent Buttons (delegated)
        document.addEventListener('click', async (event) => {
            const btn = event.target.closest('.hire-talent-btn');
            if (btn) {
                event.preventDefault();
                await handleHireTalent(btn);
            }
        });
    }

    async function handleJobPost(form) {
        if (!currentUser) {
            showToast('Please log in to post a job.', 'warning');
            return;
        }

        const formData = new FormData(form);
        
        // Collect skills from skill tags
        const skillTags = Array.from(form.querySelectorAll('.skill-tag'))
            .map(tag => tag.dataset.value || getSkillTagLabel(tag))
            .filter(s => s);
        
        // Collect requirements from checkboxes
        const requirementsChecked = Array.from(form.querySelectorAll('input[name="requirements"]:checked'))
            .map(cb => cb.value)
            .join(', ');
        
        const payload = {
            title: formData.get('title'),
            role: formData.get('role'),
            event_type: formData.get('event_type'),
            number_of_staff: formData.get('number_of_staff'),
            skills: skillTags.join(', '),
            date: formData.get('date'),
            start_time: formData.get('start_time'),
            end_time: formData.get('end_time'),
            location: formData.get('location'),
            pay_rate: formData.get('pay_rate'),
            payment_type: formData.get('payment_type'),
            description: formData.get('description'),
            requirements: requirementsChecked
        };

        console.log('Job post payload:', payload); // Debug log

        try {
            const res = await fetch(`${API_BASE}/jobs/create/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include',
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                showToast(data.error || 'Failed to create job', 'error');
                console.error('Job creation error:', data);
                return;
            }
            
            showToast('Job posted successfully!', 'success');
            form.reset();
            
            // Reload jobs if on My Jobs section
            setTimeout(() => loadMyJobs(), 500);
        } catch (err) {
            showToast('Network error while creating job', 'error');
            console.error(err);
        }
    }

    async function handleLogin(form) {
        const formData = new FormData(form);
        const payload = {
            username: (formData.get('username') || '').toString().trim(),
            password: (formData.get('password') || '').toString(),
        };

        if (!payload.username || !payload.password) {
            showToast('Please enter username and password.', 'warning');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/auth/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include',
            });
            
            const data = await res.json();
            console.log('Login response data:', data); // Debug log
            
            if (!res.ok) {
                showToast(data.error || 'Login failed', 'error');
                return;
            }
            
            if (data.profile) {
                console.log('Profile data received:', data.profile); // Debug log
                saveCurrentUser(data.profile);
            } else {
                console.log('No profile in response, using username only');
                saveCurrentUser({ username: payload.username });
            }
            
            showToast(`Welcome back, ${currentUser.username}!`, 'success');
            
            // Redirect to appropriate dashboard
            setTimeout(() => {
                if (currentUser.user_type === 'organizer') {
                    window.location.href = '/organizer-dashboard/';
                } else {
                    window.location.href = '/staff-portal/';
                }
            }, 1000);
        } catch (err) {
            showToast('Network error during login', 'error');
            console.error('Login error:', err);
        }
    }

    function handleLogout() {
        // Clear user session
        localStorage.removeItem('eventflex_user');
        localStorage.clear(); // Clear all localStorage to be safe
        currentUser = null;
        
        showToast('Logged out successfully', 'success');
        
        // Redirect to home page and force reload
        setTimeout(() => {
            window.location.href = '/';
            window.location.reload();
        }, 800);
    }

    async function handleSignup(form) {
        const formData = new FormData(form);
        const payload = {
            username: (formData.get('username') || '').toString().trim(),
            email: (formData.get('email') || '').toString().trim(),
            password: (formData.get('password') || '').toString(),
            user_type: form.dataset.userType || 'staff',
            city: (formData.get('city') || '').toString(),
        };

        console.log('Signup payload:', payload); // Debug log

        if (!payload.username || !payload.password) {
            showToast('Username and password are required.', 'warning');
            console.error('Missing required fields:', { username: payload.username, password: payload.password });
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/auth/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            const data = await res.json();
            console.log('Signup response:', data); // Debug log
            
            if (!res.ok) {
                showToast(data.error || 'Registration failed', 'error');
                return;
            }
            
            showToast('Account created successfully! Please log in.', 'success');
            
            // Redirect to login page
            setTimeout(() => {
                window.location.href = '/login/';
            }, 1500);
        } catch (err) {
            showToast('Network error during registration', 'error');
            console.error('Signup error:', err);
        }
    }

    async function handleProfileUpdate(form) {
        if (!currentUser) {
            showToast('Please log in to update profile.', 'warning');
            return;
        }

        const formData = new FormData(form);
        const payload = {
            phone: formData.get('phone'),
            bio: formData.get('bio'),
            city: formData.get('city')
        };

        try {
            const res = await fetch(`${API_BASE}/profiles/update/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include',
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                showToast(data.error || 'Profile update failed', 'error');
                return;
            }
            
            saveCurrentUser(data.profile);
            showToast('Profile updated successfully!', 'success');
        } catch (err) {
            showToast('Network error while updating profile', 'error');
            console.error(err);
        }
    }

    async function handleJobApply(button) {
        const jobId = button.dataset.jobId;
        
        if (!jobId) {
            showToast('Job ID missing', 'error');
            return;
        }

        if (!currentUser || !currentUser.username) {
            showToast('Please log in to apply for jobs.', 'warning');
            setTimeout(() => {
                window.location.href = '/login/';
            }, 1500);
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/jobs/${jobId}/apply/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: currentUser.username, 
                    cover_message: 'I am interested in this opportunity and would like to apply.' 
                }),
                credentials: 'include',
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                // Check if it's a duplicate application error
                if (data.already_applied) {
                    showToast('You have already applied to this job', 'warning');
                    // Update button to show applied state
                    button.disabled = true;
                    button.textContent = 'Applied';
                    button.style.opacity = '0.6';
                    button.style.cursor = 'not-allowed';
                } else {
                    showToast(data.error || 'Failed to apply', 'error');
                }
                return;
            }
            
            showToast('Application submitted successfully!', 'success');
            button.disabled = true;
            button.textContent = 'Applied';
            button.style.opacity = '0.6';
            button.style.cursor = 'not-allowed';
            
            // Redirect to my-applications section
            setTimeout(() => {
                window.location.href = '/staff-portal/#my-applications';
                // Reload applications to show the new one
                loadStaffApplications();
            }, 1500);
        } catch (err) {
            showToast('Network error while applying', 'error');
            console.error(err);
        }
    }

    async function handleViewProfile(button) {
        const profileId = button.dataset.profileId;
        
        if (!profileId) {
            showToast('Profile ID missing', 'error');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/profiles/${profileId}/`);
            
            if (!res.ok) {
                showToast('Failed to load profile', 'error');
                return;
            }
            
            const profile = await res.json();
            showProfileModal(profile);
        } catch (err) {
            showToast('Network error while loading profile', 'error');
            console.error(err);
        }
    }

    function showProfileModal(profile) {
        const firstName = profile.first_name || profile.username.split(' ')[0];
        const lastName = profile.last_name || profile.username.split(' ')[1] || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        const modalHTML = `
            <div class="modal-overlay" id="profileModal">
                <div class="modal-content" style="max-width: 600px;">
                    <button class="modal-close" onclick="closeProfileModal()">&times;</button>
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=6366f1&color=fff&size=120" 
                             alt="${escapeHtml(fullName)}" 
                             style="width: 120px; height: 120px; border-radius: 50%; margin-bottom: 15px;">
                        <h2 style="margin: 10px 0;">${escapeHtml(fullName)}</h2>
                        ${profile.badge ? `<span class="badge badge-pro">${escapeHtml(profile.badge)}</span>` : ''}
                        <p style="color: #666; margin: 5px 0;"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(profile.city || 'India')}</p>
                    </div>
                    
                    <div style="margin: 20px 0;">
                        <h3 style="margin-bottom: 10px;">About</h3>
                        <p style="color: #555;">${escapeHtml(profile.bio || 'No bio available')}</p>
                    </div>
                    
                    <div style="margin: 20px 0;">
                        <h3 style="margin-bottom: 10px;">Verification Status</h3>
                        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                            ${profile.kyc_verified ? '<span class="badge badge-success"><i class="fas fa-check-circle"></i> KYC Verified</span>' : '<span class="badge"><i class="fas fa-times-circle"></i> KYC Pending</span>'}
                            ${profile.video_verified ? '<span class="badge badge-success"><i class="fas fa-video"></i> Video Verified</span>' : '<span class="badge"><i class="fas fa-times-circle"></i> Video Pending</span>'}
                        </div>
                    </div>
                    
                    <div style="margin: 20px 0;">
                        <h3 style="margin-bottom: 10px;">Expected Pay</h3>
                        <p style="font-size: 18px; color: #0066ff; font-weight: 600;">₹${profile.expected_pay || 2000}/day</p>
                    </div>
                    
                    <div style="margin-top: 30px; display: flex; gap: 10px; justify-content: center;">
                        <button class="btn-outline" onclick="closeProfileModal()">Close</button>
                        <button class="btn-primary hire-talent-btn" data-talent-id="${profile.id}" data-talent-name="${escapeHtml(fullName)}" onclick="closeProfileModal()">Hire Now</button>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('profileModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    window.closeProfileModal = function() {
        const modal = document.getElementById('profileModal');
        if (modal) {
            modal.remove();
        }
    };

    async function handleHireTalent(button) {
        const talentId = button.dataset.talentId;
        const talentName = button.dataset.talentName;
        
        if (!talentId) {
            showToast('Talent ID missing', 'error');
            return;
        }

        if (!currentUser || !currentUser.username) {
            showToast('Please log in to hire talent.', 'warning');
            setTimeout(() => {
                window.location.href = '/login/';
            }, 1500);
            return;
        }

        // Show hire modal/confirmation
        const confirmed = confirm(`Would you like to send a job offer to ${talentName}?\n\nYou can select a specific job or send a general invitation.`);
        
        if (!confirmed) return;

        showToast('Direct hiring feature coming soon! For now, please post a job and wait for applications.', 'info');
        
        // Optionally redirect to post job section
        setTimeout(() => {
            window.location.href = '/organizer-dashboard/#post-job';
        }, 2000);
    }

    // ============ CHAT COMPOSER ============
    function initChatComposer() {
        document.querySelectorAll('.chat-area').forEach((chatArea) => {
            const input = chatArea.querySelector('.chat-input input');
            const button = chatArea.querySelector('.chat-input button');
            const messages = chatArea.querySelector('.chat-messages');
            if (!input || !button || !messages) return;

            const sendMessage = async () => {
                const text = input.value.trim();
                if (!text) return;

                if (!currentUser) {
                    showToast('Please log in to send messages.', 'warning');
                    return;
                }

                // For prototype: just add to UI (in real app, you'd send to backend)
                const bubble = document.createElement('div');
                bubble.className = 'message sent';

                const paragraph = document.createElement('p');
                paragraph.textContent = text;
                bubble.appendChild(paragraph);

                const time = document.createElement('span');
                time.className = 'time';
                time.textContent = 'Just now';
                bubble.appendChild(time);

                messages.appendChild(bubble);
                messages.scrollTop = messages.scrollHeight;
                input.value = '';

                showToast('Message sent (demo mode)', 'info');
            };

            button.addEventListener('click', (event) => {
                event.preventDefault();
                sendMessage();
            });

            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    sendMessage();
                }
            });
        });
    }

    function initToastTriggers() {
        document.addEventListener('click', (event) => {
            const trigger = event.target.closest('[data-toast]');
            if (!trigger) return;

            const message = trigger.getAttribute('data-toast');
            if (!message) return;

            const variant = trigger.getAttribute('data-toast-variant') || 'info';
            showToast(message, variant);
        });
    }

    function showToast(message, variant = 'info') {
        const container = getToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast toast-${variant}`;

        const text = document.createElement('span');
        text.textContent = message;
        toast.appendChild(text);

        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('visible');
        });

        const hide = () => {
            toast.classList.remove('visible');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        };

        setTimeout(hide, 3200);
    }

    function getToastContainer() {
        if (toastContainer) return toastContainer;
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
        return toastContainer;
    }

    window.togglePassword = function togglePassword(event) {
        const trigger = event?.currentTarget || event?.target;
        if (!trigger) return;
        const input = trigger.parentElement?.querySelector('input');
        if (!input) return;

        const isPassword = input.getAttribute('type') === 'password';
        input.setAttribute('type', isPassword ? 'text' : 'password');

        trigger.classList.toggle('fa-eye', !isPassword);
        trigger.classList.toggle('fa-eye-slash', isPassword);
        trigger.setAttribute('aria-pressed', String(isPassword));
    };

    // QR Code Generation Functions
    window.generateQRCode = function(applicationId, eventTitle, eventDate, eventLocation) {
        const modal = document.getElementById('qr-modal');
        const qrContainer = document.getElementById('qr-code-container');
        const eventTitleElement = document.getElementById('qr-event-title');
        const eventDetailsElement = document.getElementById('qr-event-details');
        
        // Clear previous QR code
        qrContainer.innerHTML = '';
        
        // Set event information
        eventTitleElement.textContent = eventTitle;
        eventDetailsElement.innerHTML = `
            <strong>Date:</strong> ${eventDate}<br>
            <strong>Location:</strong> ${eventLocation}<br>
            <strong>Booking ID:</strong> #${applicationId}
        `;
        
        // Generate QR code data
        const qrData = JSON.stringify({
            applicationId: applicationId,
            eventTitle: eventTitle,
            eventDate: eventDate,
            eventLocation: eventLocation,
            timestamp: new Date().toISOString()
        });
        
        // Create QR code
        try {
            new QRCode(qrContainer, {
                text: qrData,
                width: 256,
                height: 256,
                colorDark: "#0f172a",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
            
            // Show modal
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            showToast('QR code generated successfully!', 'success');
        } catch (error) {
            console.error('QR code generation failed:', error);
            showToast('Failed to generate QR code. Please try again.', 'error');
        }
    };

    window.closeQRModal = function() {
        const modal = document.getElementById('qr-modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('qr-modal');
        if (event.target === modal) {
            closeQRModal();
        }
    });

    // Withdraw Funds Functions
    window.showWithdrawModal = function() {
        const modal = document.getElementById('withdraw-modal');
        const balanceInput = document.getElementById('withdraw-balance');
        const availableBalance = document.getElementById('available-balance');
        
        if (availableBalance) {
            balanceInput.value = availableBalance.textContent;
        }
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    window.closeWithdrawModal = function() {
        const modal = document.getElementById('withdraw-modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    window.handleWithdraw = async function(event) {
        event.preventDefault();
        
        const amount = document.getElementById('withdraw-amount').value;
        
        try {
            const res = await fetch(`${API_BASE}/wallet/withdraw/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ amount })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                showToast(data.message, 'success');
                closeWithdrawModal();
                // Reload wallet data
                if (typeof loadWalletData === 'function') {
                    await loadWalletData();
                }
            } else {
                showToast(data.error || 'Withdrawal failed', 'error');
            }
        } catch (err) {
            console.error('Withdrawal error:', err);
            showToast('Failed to process withdrawal', 'error');
        }
    };

    // Photo Upload Functions
    window.showPhotoModal = function() {
        const modal = document.getElementById('photo-modal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    window.closePhotoModal = function() {
        const modal = document.getElementById('photo-modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    window.handlePhotoUpload = async function(event) {
        event.preventDefault();
        
        const fileInput = document.getElementById('photo-input');
        const formData = new FormData();
        formData.append('photo', fileInput.files[0]);
        
        try {
            const res = await fetch(`${API_BASE}/upload/photo/`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            
            const data = await res.json();
            
            if (res.ok) {
                showToast(data.message, 'success');
                closePhotoModal();
                // Update profile photo
                const userAvatar = document.getElementById('user-avatar');
                if (userAvatar && data.photo_url) {
                    userAvatar.src = data.photo_url;
                }
            } else {
                showToast(data.error || 'Upload failed', 'error');
            }
        } catch (err) {
            console.error('Photo upload error:', err);
            showToast('Failed to upload photo', 'error');
        }
    };

    // Video Upload Functions
    window.showVideoModal = function() {
        const modal = document.getElementById('video-modal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    window.closeVideoModal = function() {
        const modal = document.getElementById('video-modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    window.handleVideoUpload = async function(event) {
        event.preventDefault();
        
        const fileInput = document.getElementById('video-input');
        const formData = new FormData();
        formData.append('video', fileInput.files[0]);
        
        try {
            const res = await fetch(`${API_BASE}/upload/video/`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            
            const data = await res.json();
            
            if (res.ok) {
                showToast(data.message, 'success');
                closeVideoModal();
            } else {
                showToast(data.error || 'Upload failed', 'error');
            }
        } catch (err) {
            console.error('Video upload error:', err);
            showToast('Failed to upload video', 'error');
        }
    };

    // Profile Save Function
    window.handleProfileSave = async function(event) {
        event.preventDefault();
        
        const form = document.getElementById('profile-form');
        const formData = new FormData(form);
        
        const data = {
            first_name: formData.get('first_name') || '',
            last_name: formData.get('last_name') || '',
            email: formData.get('email') || '',
            phone: formData.get('phone') || '',
            city: formData.get('city') || '',
            bio: formData.get('bio') || ''
        };
        
        try {
            const res = await fetch(`${API_BASE}/profile/save/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            
            const result = await res.json();
            
            if (res.ok) {
                showToast(result.message, 'success');
            } else {
                showToast(result.error || 'Failed to save profile', 'error');
            }
        } catch (err) {
            console.error('Profile save error:', err);
            showToast('Failed to save profile', 'error');
        }
    };
})();


