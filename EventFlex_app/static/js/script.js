(function () {
    'use strict';

    const API_BASE = '/api';
    let currentUser = null;
    let toastContainer; const ready = (callback) => {
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

        checkPageAuthentication();
    }

    function checkPageAuthentication() {
        const body = document.body;
        const requiresAuth = body.getAttribute('data-requires-auth') === 'true';
        const requiredUserType = body.getAttribute('data-user-type');

        if (requiresAuth) {
            if (!currentUser) {
                console.log('Protected page requires authentication - redirecting to login');
                window.location.href = '/login';
                return;
            }

            if (requiredUserType && currentUser.user_type !== requiredUserType) {
                console.log(`Page requires ${requiredUserType} access but user is ${currentUser.user_type}`);
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
        const welcomeElements = document.querySelectorAll('.user-welcome');
        welcomeElements.forEach(el => {
            if (currentUser) {
                el.textContent = `Welcome, ${currentUser.username}!`;
            }
        });

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

            if (navLinkText) {
                navLinkText.style.display = 'none';
            }
            const signUpBtn = document.querySelector('.btn-primary-small');
            if (signUpBtn && signUpBtn.textContent.includes('Sign Up')) {
                signUpBtn.style.display = 'none';
            }

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

        if (navLoginItem) navLoginItem.style.display = 'none';
        if (navSignupItem) navSignupItem.style.display = 'none';

        if (navUserItem) navUserItem.style.display = 'block';
        if (navDashboardItem) navDashboardItem.style.display = 'block';

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

        if (navDashboardLink && currentUser.user_type) {
            if (currentUser.user_type === 'organizer') {
                navDashboardLink.href = '/organizer-dashboard/';
                navDashboardLink.textContent = 'Organizer Dashboard';
            } else if (currentUser.user_type === 'staff') {
                navDashboardLink.href = '/staff-portal/';
                navDashboardLink.textContent = 'My Portal';
            }
        }
    }    // ============ DATA LOADING ============
    async function loadDynamicData() {
        if (document.getElementById('jobListings')) {
            await loadJobListings();
        }

        if (document.getElementById('talentGrid')) {
            await loadTalentGrid();
        }

        if (document.getElementById('talent-grid-organizer')) {
            await loadOrganizerTalentGrid();
        }

        if (currentUser) {
            if (document.getElementById('stat-active-jobs')) {
                await loadDashboardStats();
            }

            if (document.getElementById('stat-events-completed')) {
                await loadStaffDashboardStats();
            }

            if (document.getElementById('staff-upcoming-events')) {
                await loadStaffUpcomingEvents();
            }

            if (document.getElementById('upcoming-events-list')) {
                await loadUpcomingEvents();
            }

            if (document.getElementById('recent-applications-list')) {
                await loadRecentApplications();
            }

            if (document.getElementById('pending-applications')) {
                await loadStaffApplications();
            }

            if (document.getElementById('upcoming-bookings')) {
                await loadStaffBookings();
            }

            if (document.getElementById('available-balance')) {
                await loadWalletData();
            }

            // Load organizer wallet stats
            if (document.getElementById('organizer-wallet-balance')) {
                await loadOrganizerWalletStats();
            }

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

            const completedEvents = applications.filter(app => app.status === 'accepted').length;

            let totalEarned = 0;
            applications.filter(app => app.status === 'accepted').forEach(app => {
                totalEarned += parseFloat(app.job.pay_rate || 0);
            });

            const now = new Date();
            const upcoming = applications.filter(app => {
                if (app.status !== 'accepted') return false;
                if (!app.job.date) return false;
                const jobDate = new Date(app.job.date);
                return jobDate >= now;
            }).length;

            const completedEl = document.getElementById('stat-events-completed');
            const earnedEl = document.getElementById('stat-total-earned');
            const ratingEl = document.getElementById('stat-rating');
            const upcomingEl = document.getElementById('stat-upcoming');

            if (completedEl) completedEl.textContent = completedEvents;
            if (earnedEl) earnedEl.textContent = `₹${totalEarned.toLocaleString()}`;
            if (ratingEl) ratingEl.textContent = '5.0'; // Placeholder
            if (upcomingEl) upcomingEl.textContent = upcoming;

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

            const activeJobs = jobs.length;

            const appsRes = await fetch(`${API_BASE}/applications/`, {
                credentials: 'include'
            });
            let hiredStaff = 0;
            let totalSpent = 0;

            if (appsRes.ok) {
                const appsData = await appsRes.json();
                hiredStaff = (appsData.results || []).filter(app => app.status === 'accepted').length;

                (appsData.results || []).filter(app => app.status === 'accepted').forEach(app => {
                    totalSpent += parseFloat(app.job.pay_rate || 0);
                });
            }

            const now = new Date();
            const upcomingEvents = jobs.filter(job => {
                if (!job.date) return false;
                const jobDate = new Date(job.date);
                return jobDate >= now;
            }).length;

            document.getElementById('stat-active-jobs').textContent = activeJobs;
            document.getElementById('stat-hired-staff').textContent = hiredStaff;
            document.getElementById('stat-upcoming-events').textContent = upcomingEvents;
            document.getElementById('stat-total-spent').textContent = `₹${(totalSpent / 1000).toFixed(1)}K`;

        } catch (err) {
            console.error('Failed to load dashboard stats:', err);
        }
    }

    // Make globally accessible for event handlers
    window.loadDashboardStats = loadDashboardStats;

    async function loadUpcomingEvents() {
        try {
            const res = await fetch(`${API_BASE}/jobs/my/`, {
                credentials: 'include'
            });

            if (!res.ok) return;

            const data = await res.json();
            const jobs = data.results || [];

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
            const fullName = app.full_name || app.applicant.username;

            let ratingHTML = '';
            if (app.ai_rating !== null && app.ai_rating !== undefined) {
                const fullStars = Math.floor(app.ai_rating);
                const hasHalfStar = (app.ai_rating % 1) >= 0.5;
                const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

                ratingHTML = '<div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">';
                ratingHTML += '<span style="color: #FFD700; font-size: 0.9rem;">';
                for (let i = 0; i < fullStars; i++) {
                    ratingHTML += '<i class="fas fa-star"></i>';
                }
                if (hasHalfStar) {
                    ratingHTML += '<i class="fas fa-star-half-alt"></i>';
                }
                for (let i = 0; i < emptyStars; i++) {
                    ratingHTML += '<i class="far fa-star"></i>';
                }
                ratingHTML += '</span>';
                ratingHTML += `<span style="font-size: 0.85rem; color: #888;">${app.ai_rating.toFixed(1)}/5</span>`;
                ratingHTML += '</div>';
            }

            return `
                <div class="application-item">
                    <img src="${avatarUrl}" alt="${escapeHtml(app.applicant.username)}">
                    <div class="application-details">
                        <h4>${escapeHtml(fullName)}</h4>
                        <p>${escapeHtml(app.job.role)}</p>
                        ${badge ? `<span class="badge-pro">${escapeHtml(badge)}</span>` : ''}
                        ${ratingHTML}
                    </div>
                    <div class="application-actions">
                        <button class="btn-sm btn-primary" onclick="viewApplicationDetail(${app.id})" style="margin-right: 0.5rem;">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    window.updateApplicationStatus = async function (appId, status) {
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

        const isStaffPortal = document.getElementById('discover-jobs') !== null;

        if (isStaffPortal) {
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

                const locationElement = card.querySelector('[class*="location"], [class*="detail"]');
                const jobLocation = locationElement ? locationElement.textContent.toLowerCase() : text;

                const payElement = card.querySelector('.job-pay');
                const pay = payElement ? parseInt(payElement.textContent.replace(/[^0-9]/g, '')) : 0;

                let show = true;

                if (searchTerm && !text.includes(searchTerm)) {
                    show = false;
                }

                if (locationTerm && locationTerm.length > 0) {
                    const locationWords = locationTerm.split(/[\s,]+/).filter(word => word.length > 2);

                    const hasLocationMatch = locationWords.some(word =>
                        jobLocation.includes(word) || word.includes(jobLocation)
                    );

                    if (!hasLocationMatch) {
                        show = false;
                    }
                }

                if (eventType && !text.includes(eventType)) {
                    show = false;
                }

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

                if (searchTerm && !text.includes(searchTerm)) {
                    show = false;
                }

                if (skills && !text.includes(skills)) {
                    show = false;
                }

                if (rating) {
                    const minRating = parseFloat(rating);
                    if (cardRating < minRating) {
                        show = false;
                    }
                }

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

        document.getElementById('pending-count').textContent = `(${pending.length})`;
        document.getElementById('accepted-count').textContent = `(${accepted.length})`;
        document.getElementById('rejected-count').textContent = `(${rejected.length})`;

        const pendingContainer = document.getElementById('pending-applications');
        if (pendingContainer) {
            if (pending.length === 0) {
                pendingContainer.innerHTML = '<p class="empty-state">No pending applications.</p>';
            } else {
                pendingContainer.innerHTML = pending.map(app => renderApplicationCard(app, 'pending')).join('');
            }
        }

        const acceptedContainer = document.getElementById('accepted-applications');
        if (acceptedContainer) {
            if (accepted.length === 0) {
                acceptedContainer.innerHTML = '<p class="empty-state">No accepted applications. Accepted applications move to "My Bookings".</p>';
            } else {
                acceptedContainer.innerHTML = accepted.map(app => renderApplicationCard(app, 'accepted')).join('');
            }
        }

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

        document.getElementById('upcoming-bookings-count').textContent = `(${upcoming.length})`;
        document.getElementById('completed-bookings-count').textContent = `(${completed.length})`;
        document.getElementById('cancelled-bookings-count').textContent = `(0)`;

        const upcomingContainer = document.getElementById('upcoming-bookings');
        if (upcomingContainer) {
            if (upcoming.length === 0) {
                upcomingContainer.innerHTML = '<p class="empty-state">No upcoming bookings.</p>';
            } else {
                upcomingContainer.innerHTML = upcoming.map(app => renderBookingCard(app, 'upcoming')).join('');
            }
        }

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
        const organizerEmail = app.job.organizer?.email || '';
        const organizerPhone = app.job.organizer?.phone || '';
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
                    <button class="btn-outline" onclick="viewBookingDetails(${app.job.id})">
                        <i class="fas fa-info-circle"></i> View Details
                    </button>
                    ${type === 'upcoming' ? `
                    <button class="btn-outline" onclick="contactOrganizer('${escapeHtml(organizerName)}', '${escapeHtml(organizerEmail)}', '${escapeHtml(organizerPhone)}')">
                        <i class="fas fa-envelope"></i> Contact Organizer
                    </button>
                    <button class="btn-outline" onclick="withdrawFromEvent(${app.id}, '${escapeHtml(app.job.title)}')" style="background: rgba(239, 68, 68, 0.1); border-color: #ef4444; color: #ef4444;">
                        <i class="fas fa-times-circle"></i> Withdraw
                    </button>
                    ` : ''}
                    ${type === 'completed' ? '<button class="btn-outline" onclick="downloadInvoice(' + app.id + ')"><i class="fas fa-file-invoice"></i> Download Invoice</button>' : ''}
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

            const availableBalanceEl = document.getElementById('available-balance');
            const pendingAmountEl = document.getElementById('pending-amount');
            const pendingTextEl = document.getElementById('pending-text');
            const totalEarnedEl = document.getElementById('total-earned');
            const totalEventsTextEl = document.getElementById('total-events-text');

            if (availableBalanceEl) availableBalanceEl.textContent = `₹${formatNumber(data.available_balance)}`;
            if (pendingAmountEl) pendingAmountEl.textContent = `₹${formatNumber(data.pending_amount)}`;
            if (pendingTextEl) pendingTextEl.textContent = `From ${data.pending_count} completed event${data.pending_count !== 1 ? 's' : ''}`;
            if (totalEarnedEl) totalEarnedEl.textContent = `₹${formatNumber(data.total_earned)}`;
            if (totalEventsTextEl) totalEventsTextEl.textContent = `Across ${data.total_events} event${data.total_events !== 1 ? 's' : ''}`;

            if (data.monthly_earnings) {
                renderEarningsChart(data.monthly_earnings);
            }
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

        const maxAmount = Math.max(...monthlyData.map(m => parseFloat(m.amount)), 1);

        chartBars.innerHTML = monthlyData.map(item => {
            const amount = parseFloat(item.amount);
            const height = (amount / maxAmount) * 100;
            const displayAmount = amount >= 1000 ? `₹${(amount / 1000).toFixed(0)}k` : `₹${amount}`;

            return `<div class="chart-bar" style="height: ${height}%"><span>${displayAmount}</span></div>`;
        }).join('');

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

    // ===== Wallet Management Functions =====

    window.showAddFundsModal = function () {
        document.getElementById('add-funds-modal').style.display = 'flex';
        document.getElementById('add-funds-amount').value = '';
        document.getElementById('add-funds-amount').focus();
    };

    window.closeAddFundsModal = function () {
        document.getElementById('add-funds-modal').style.display = 'none';
    };

    window.handleAddFunds = async function (event) {
        event.preventDefault();

        const amount = parseFloat(document.getElementById('add-funds-amount').value);

        if (amount < 100) {
            showToast('Minimum amount is ₹100', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/wallet/add-funds/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount: amount })
            });

            const data = await response.json();

            if (response.ok) {
                showToast(data.message || `₹${amount} added successfully!`, 'success');
                closeAddFundsModal();

                // Refresh wallet stats
                await loadOrganizerWalletStats();

                // Refresh transactions if on that tab
                if (typeof loadTransactionHistory === 'function') {
                    await loadTransactionHistory();
                }
            } else {
                showToast(data.error || 'Failed to add funds', 'error');
            }
        } catch (error) {
            console.error('Error adding funds:', error);
            showToast('Error adding funds. Please try again.', 'error');
        }
    };

    window.showPendingPaymentsModal = async function () {
        const modal = document.getElementById('pending-payments-modal');
        modal.style.display = 'flex';

        const listContainer = document.getElementById('pending-payments-list');
        listContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">Loading...</p>';

        try {
            // Get all applications for active jobs
            const response = await fetch(`${API_BASE}/applications/`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to load applications');
            }

            const data = await response.json();
            const applications = data.results || [];

            // Filter for accepted applications in active jobs
            const pendingPayments = applications.filter(app =>
                app.status === 'accepted' &&
                app.job &&
                app.job.status === 'active'
            );

            if (pendingPayments.length === 0) {
                listContainer.innerHTML = '<p class="empty-state">No pending payments. All hired staff have been paid.</p>';
                return;
            }

            // Group by job
            const jobGroups = {};
            pendingPayments.forEach(app => {
                const jobId = app.job.id;
                if (!jobGroups[jobId]) {
                    jobGroups[jobId] = {
                        job: app.job,
                        staff: []
                    };
                }
                jobGroups[jobId].staff.push(app);
            });

            // Render grouped payments
            listContainer.innerHTML = Object.values(jobGroups).map(group => {
                const totalPayment = group.staff.reduce((sum, app) => sum + parseFloat(app.job.pay_rate), 0);

                return `
                    <div style="border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; background: #fafafa;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                            <div>
                                <h3 style="color: var(--gold); margin-bottom: 0.5rem;">${escapeHtml(group.job.title)}</h3>
                                <p style="color: #666; font-size: 0.9rem;">
                                    <i class="fas fa-calendar"></i> ${formatDate(group.job.date)} | 
                                    <i class="fas fa-map-marker-alt"></i> ${escapeHtml(group.job.location)}
                                </p>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 1.5rem; font-weight: bold; color: var(--gold);">₹${formatNumber(totalPayment)}</div>
                                <div style="font-size: 0.9rem; color: #666;">${group.staff.length} staff member${group.staff.length !== 1 ? 's' : ''}</div>
                            </div>
                        </div>
                        <div style="background: white; border-radius: 6px; padding: 1rem;">
                            ${group.staff.map(app => `
                                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0;">
                                    <div>
                                        <strong>${escapeHtml(app.full_name || app.applicant.user.username)}</strong>
                                        <div style="font-size: 0.85rem; color: #666;">${escapeHtml(app.job.role)}</div>
                                    </div>
                                    <div style="font-weight: bold; color: var(--gold);">₹${formatNumber(app.job.pay_rate)}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center;">
                            <p style="margin: 0; font-size: 0.85rem; color: #999;">
                                💡 Click "Release Payment" to complete this event and pay staff
                            </p>
                            <button 
                                class="btn-primary" 
                                style="background: #10b981; border-color: #10b981; padding: 0.6rem 1.2rem; font-size: 0.9rem;"
                                onclick="handleReleasePaymentForJob(${group.job.id}, '${escapeHtml(group.job.title)}', ${totalPayment})">
                                <i class="fas fa-check-circle"></i> Release Payment
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error('Error loading pending payments:', error);
            listContainer.innerHTML = '<p class="empty-state" style="color: red;">Error loading pending payments</p>';
        }
    };

    window.closePendingPaymentsModal = function () {
        document.getElementById('pending-payments-modal').style.display = 'none';
    };

    window.handleReleasePaymentForJob = async function (jobId, jobTitle, totalAmount) {
        if (!confirm(`Are you sure you want to release ₹${formatNumber(totalAmount)} for "${jobTitle}"?\n\nThis will:\n✓ Mark the event as finished\n✓ Deduct ₹${formatNumber(totalAmount)} from your wallet\n✓ Pay all hired staff immediately`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/jobs/${jobId}/finish/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to release payment');
            }

            // Success
            showToast(`✓ Successfully released ₹${formatNumber(totalAmount)} for "${jobTitle}"`, 'success');

            // Close the pending payments modal
            closePendingPaymentsModal();

            // Refresh wallet stats and jobs list
            loadOrganizerWalletStats();
            loadOrganizerJobs();

        } catch (error) {
            console.error('Payment release error:', error);

            // Show detailed error message
            if (error.message.includes('insufficient')) {
                showToast('⚠️ Insufficient balance. Please add funds to your wallet first.', 'error');
            } else {
                showToast(`❌ Failed to release payment: ${error.message}`, 'error');
            }
        }
    };

    window.showReleasedPaymentsModal = async function () {
        const modal = document.getElementById('released-payments-modal');
        modal.style.display = 'flex';

        const listContainer = document.getElementById('released-payments-list');
        listContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">Loading...</p>';

        try {
            // Get transactions of type 'escrow_release'
            const response = await fetch(`${API_BASE}/transactions/`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to load transactions');
            }

            const data = await response.json();
            const transactions = data.results || [];

            // Filter for escrow_release transactions
            const releasedPayments = transactions.filter(txn =>
                txn.transaction_type === 'escrow_release'
            );

            if (releasedPayments.length === 0) {
                listContainer.innerHTML = '<p class="empty-state">No payments released yet.</p>';
                return;
            }

            listContainer.innerHTML = releasedPayments.map(txn => `
                <div style="border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; background: #fafafa;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <h3 style="color: var(--gold); margin-bottom: 0.5rem;">
                                ${escapeHtml(txn.event_title || 'Event Payment')}
                            </h3>
                            <p style="color: #666; font-size: 0.9rem; margin-bottom: 0.5rem;">
                                ${escapeHtml(txn.note || 'Payment released to staff')}
                            </p>
                            <p style="font-size: 0.85rem; color: #999;">
                                <i class="fas fa-calendar"></i> ${formatDate(txn.created_at)}
                            </p>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.5rem; font-weight: bold; color: #e74c3c;">-₹${formatNumber(txn.amount)}</div>
                            <div style="font-size: 0.85rem; color: #666; margin-top: 0.25rem;">
                                Balance: ₹${formatNumber(txn.balance_after)}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error loading released payments:', error);
            listContainer.innerHTML = '<p class="empty-state" style="color: red;">Error loading payment history</p>';
        }
    };

    window.closeReleasedPaymentsModal = function () {
        document.getElementById('released-payments-modal').style.display = 'none';
    };

    async function loadOrganizerWalletStats() {
        try {
            const res = await fetch(`${API_BASE}/wallet/stats/`, {
                credentials: 'include'
            });

            if (!res.ok) {
                return;
            }

            const data = await res.json();

            // Update wallet balance
            const balanceEl = document.getElementById('organizer-wallet-balance');
            if (balanceEl) {
                balanceEl.textContent = `₹${formatNumber(data.available_balance)}`;
            }

            // Update pending payments (committed but not yet released)
            const pendingEl = document.getElementById('organizer-pending-payments');
            if (pendingEl) {
                pendingEl.textContent = `₹${formatNumber(data.pending_amount)}`;
            }

            // Calculate total released (from transactions)
            const transRes = await fetch(`${API_BASE}/transactions/`, {
                credentials: 'include'
            });

            if (transRes.ok) {
                const transData = await transRes.json();
                const transactions = transData.results || [];

                // Sum all escrow_release transactions
                const totalReleased = transactions
                    .filter(txn => txn.transaction_type === 'escrow_release')
                    .reduce((sum, txn) => sum + parseFloat(txn.amount), 0);

                const releasedEl = document.getElementById('organizer-total-released');
                if (releasedEl) {
                    releasedEl.textContent = `₹${formatNumber(totalReleased)}`;
                }
            }

        } catch (err) {
            console.error('Failed to load organizer wallet stats:', err);
        }
    }

    // ===== End Wallet Management Functions =====

    window.withdrawApplication = async function (appId) {
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

    async function loadMyJobs(status = 'active') {
        try {
            const res = await fetch(`${API_BASE}/jobs/my/?status=${status}`, {
                credentials: 'include'
            });

            if (!res.ok) return;

            const data = await res.json();

            if (status === 'completed') {
                renderCompletedJobs(data.results || []);
            } else if (status === 'draft') {
                renderDraftJobs(data.results || []);
            } else {
                renderMyJobs(data.results || []);
            }
        } catch (err) {
            console.error('Failed to load jobs:', err);
        }
    }

    // Make globally accessible for event handlers
    window.loadMyJobs = loadMyJobs;

    function renderMyJobs(jobs) {
        const container = document.querySelector('[data-tab-content="active-jobs"]');
        if (!container) return;

        if (jobs.length === 0) {
            container.innerHTML = '<p class="empty-state">No active jobs. Create your first job posting!</p>';
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
                    <div class="job-actions" style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button class="btn-primary" onclick="openEventDetailsModal(${job.id})" style="flex: 1;">
                            <i class="fas fa-info-circle"></i> View Details
                        </button>
                        <button class="btn-outline" onclick="cancelEvent(${job.id})" style="flex: 1; background: #dc3545; border-color: #dc3545; color: white;">
                            <i class="fas fa-times-circle"></i> Cancel Event
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function renderCompletedJobs(jobs) {
        const container = document.querySelector('[data-tab-content="completed-jobs"]');
        if (!container) return;

        if (jobs.length === 0) {
            container.innerHTML = '<p class="empty-state">No completed events yet.</p>';
            return;
        }

        container.innerHTML = jobs.map(job => `
            <div class="job-card" style="opacity: 0.9; border-left: 4px solid #10b981;">
                <div class="job-header">
                    <h3>${escapeHtml(job.title)}</h3>
                    <span class="badge" style="background: #10b981; color: white;">
                        <i class="fas fa-check-circle"></i> Completed
                    </span>
                </div>
                <div class="job-meta">
                    <span><i class="fas fa-briefcase"></i> ${escapeHtml(job.role)}</span>
                    <span><i class="fas fa-users"></i> ${job.number_of_staff} staff</span>
                    <span><i class="fas fa-calendar"></i> ${formatDate(job.date)}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(job.location)}</span>
                </div>
                <p>${escapeHtml(job.description)}</p>
                <div class="job-footer">
                    <div class="pay-rate">₹${job.pay_rate}/${job.payment_type}</div>
                    <div class="job-actions" style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button class="btn-primary" onclick="openEventDetailsModal(${job.id})" style="flex: 1;">
                            <i class="fas fa-info-circle"></i> View Details
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function renderDraftJobs(jobs) {
        const container = document.querySelector('[data-tab-content="draft-jobs"]');
        if (!container) return;

        if (jobs.length === 0) {
            container.innerHTML = '<p class="empty-state">No draft jobs yet. Save your work as a draft to continue later.</p>';
            return;
        }

        container.innerHTML = jobs.map(job => `
            <div class="job-card" style="opacity: 0.85; border-left: 4px solid #f59e0b;">
                <div class="job-header">
                    <h3>${escapeHtml(job.title || 'Untitled Draft')}</h3>
                    <span class="badge" style="background: #f59e0b; color: white;">
                        <i class="fas fa-file-alt"></i> Draft
                    </span>
                </div>
                <div class="job-meta">
                    <span><i class="fas fa-briefcase"></i> ${escapeHtml(job.role || 'Not specified')}</span>
                    <span><i class="fas fa-users"></i> ${job.number_of_staff} staff</span>
                    <span><i class="fas fa-calendar"></i> ${formatDate(job.date) || 'Not set'}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(job.location || 'Not specified')}</span>
                </div>
                <p>${escapeHtml(job.description || 'No description yet')}</p>
                <div class="job-footer">
                    <div class="pay-rate">₹${job.pay_rate}/${job.payment_type}</div>
                    <div class="job-actions" style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button class="btn-outline" onclick="editDraft(${job.id})" style="flex: 1;">
                            <i class="fas fa-edit"></i> Edit Draft
                        </button>
                        <button class="btn-outline" onclick="deleteDraft(${job.id})" style="flex: 1; background: #ef4444; color: white;">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async function loadMessages() {
        // This function now loads conversations list
        await loadConversations();
    }

    let currentChatPartner = null;
    let messagePollingInterval = null;

    async function loadConversations() {
        try {
            const res = await fetch(`${API_BASE}/messages/conversations/`, {
                credentials: 'include'
            });

            if (!res.ok) {
                console.error('Failed to load conversations');
                return;
            }

            const data = await res.json();
            renderConversations(data.conversations || []);
        } catch (err) {
            console.error('Failed to load conversations:', err);
        }
    }

    function renderConversations(conversations) {
        const container = document.querySelector('.conversation-list');
        if (!container) return;

        if (conversations.length === 0) {
            container.innerHTML = '<p class="empty-state" style="padding: 2rem; text-align: center; color: #94a3b8;">No conversations yet. Hire staff to start chatting!</p>';

            // Clear chat area
            const chatArea = document.querySelector('.chat-area');
            if (chatArea) {
                const chatMessages = chatArea.querySelector('.chat-messages');
                if (chatMessages) {
                    chatMessages.innerHTML = '<p class="empty-state">Select a conversation to start chatting</p>';
                }
            }
            return;
        }

        container.innerHTML = conversations.map((conv, index) => {
            const partner = conv.partner;
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.username)}&background=${index % 2 === 0 ? '6366f1' : '10b981'}&color=fff`;
            const isActive = currentChatPartner && currentChatPartner.id === partner.id;

            return `
                <div class="conversation-item ${isActive ? 'active' : ''}" onclick="openChat(${partner.id}, '${escapeHtml(partner.username)}', '${avatarUrl}')" data-partner-id="${partner.id}">
                    <img src="${avatarUrl}" alt="${escapeHtml(partner.username)}">
                    <div class="conversation-info">
                        <h4>${escapeHtml(partner.username)}</h4>
                        <p>${escapeHtml(conv.last_message || 'No messages yet')}</p>
                    </div>
                    <span class="time">${conv.last_message_time ? getTimeAgo(conv.last_message_time) : ''}</span>
                </div>
            `;
        }).join('');
    }

    window.openChat = async function (partnerId, partnerName, avatarUrl) {
        currentChatPartner = { id: partnerId, username: partnerName, avatar: avatarUrl };

        // Update active conversation
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.conversation-item[data-partner-id="${partnerId}"]`)?.classList.add('active');

        // Update chat header
        const chatHeader = document.querySelector('.chat-header');
        if (chatHeader) {
            chatHeader.innerHTML = `
                <img src="${avatarUrl}" alt="${escapeHtml(partnerName)}">
                <div>
                    <h4>${escapeHtml(partnerName)}</h4>
                    <p style="color: #22c55e; font-size: 0.85rem;"><i class="fas fa-circle" style="font-size: 0.5rem;"></i> Active</p>
                </div>
            `;
        }

        // Load messages for this conversation
        await loadChatMessages(partnerId);

        // Start polling for new messages
        if (messagePollingInterval) {
            clearInterval(messagePollingInterval);
        }
        messagePollingInterval = setInterval(() => loadChatMessages(partnerId, true), 3000);
    };

    async function loadChatMessages(partnerId, silent = false) {
        try {
            const res = await fetch(`${API_BASE}/messages/?partner_id=${partnerId}`, {
                credentials: 'include'
            });

            if (!res.ok) return;

            const data = await res.json();
            renderChatMessages(data.results || [], silent);
        } catch (err) {
            if (!silent) {
                console.error('Failed to load chat messages:', err);
            }
        }
    }

    function renderChatMessages(messages, silent = false) {
        const container = document.querySelector('.chat-messages');
        if (!container) return;

        if (messages.length === 0) {
            container.innerHTML = '<p class="empty-state">No messages yet. Start the conversation!</p>';
            return;
        }

        const previousScrollHeight = container.scrollHeight;
        const wasScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 100;

        container.innerHTML = messages.map(msg => {
            const isSent = currentUser && msg.sender.id === currentUser.id;
            return `
                <div class="message ${isSent ? 'sent' : 'received'}">
                    <p>${escapeHtml(msg.text)}</p>
                    <span class="time">${formatTime(msg.created_at)}</span>
                </div>
            `;
        }).join('');

        // Auto-scroll to bottom if user was already at bottom or if this is the first load
        if (wasScrolledToBottom || !silent) {
            container.scrollTop = container.scrollHeight;
        }
    }

    function formatTime(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;

        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    // Initialize chat input functionality
    function initChatInput() {
        const chatInput = document.querySelector('.chat-input input');
        const chatButton = document.querySelector('.chat-input button');

        if (!chatInput || !chatButton) return;

        const sendMessage = async () => {
            const text = chatInput.value.trim();
            if (!text || !currentChatPartner) {
                if (!currentChatPartner) {
                    showToast('Please select a conversation first', 'warning');
                }
                return;
            }

            if (!currentUser) {
                showToast('Please log in to send messages', 'warning');
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/messages/send/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        recipient_id: currentChatPartner.id,
                        text: text
                    })
                });

                if (!res.ok) {
                    const data = await res.json();
                    showToast(data.error || 'Failed to send message', 'error');
                    return;
                }

                chatInput.value = '';

                // Immediately reload messages to show the sent message
                await loadChatMessages(currentChatPartner.id);

                // Also reload conversations to update last message
                await loadConversations();

            } catch (err) {
                console.error('Error sending message:', err);
                showToast('Failed to send message', 'error');
            }
        };

        chatButton.addEventListener('click', (event) => {
            event.preventDefault();
            sendMessage();
        });

        chatInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        });
    }

    // Initialize chat functionality when page loads
    if (document.querySelector('.chat-input')) {
        initChatInput();
    }

    // Initialize conversation search
    function initConversationSearch() {
        const searchInput = document.querySelector('.message-search input');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const conversations = document.querySelectorAll('.conversation-item');

            conversations.forEach(conv => {
                const name = conv.querySelector('h4')?.textContent.toLowerCase() || '';
                const message = conv.querySelector('p')?.textContent.toLowerCase() || '';

                if (name.includes(searchTerm) || message.includes(searchTerm)) {
                    conv.style.display = '';
                } else {
                    conv.style.display = 'none';
                }
            });
        });
    }

    // Initialize search when conversations are loaded
    setTimeout(initConversationSearch, 1000);

    // Clean up polling when leaving messages section
    window.addEventListener('hashchange', () => {
        if (!window.location.hash.includes('messages') && messagePollingInterval) {
            clearInterval(messagePollingInterval);
            messagePollingInterval = null;
            currentChatPartner = null;
        }
    });

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

        container.innerHTML = transactions.map(txn => {
            const amount = parseFloat(txn.amount);
            const isPositive = amount >= 0;

            // Determine transaction icon and description based on type
            let icon = '💰';
            let typeLabel = '';

            switch (txn.transaction_type) {
                case 'deposit':
                    icon = '💳';
                    typeLabel = 'Deposit';
                    break;
                case 'payment':
                    icon = '💵';
                    typeLabel = 'Payment Received';
                    break;
                case 'withdrawal':
                    icon = '🏦';
                    typeLabel = 'Withdrawal';
                    break;
                case 'escrow_hold':
                    icon = '🔒';
                    typeLabel = 'Funds Held';
                    break;
                case 'escrow_release':
                    icon = '📤';
                    typeLabel = 'Payment Released';
                    break;
                case 'refund':
                    icon = '↩️';
                    typeLabel = 'Refund';
                    break;
                default:
                    typeLabel = txn.note || 'Transaction';
            }

            return `
                <div class="transaction-item">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 24px;">${icon}</span>
                        <div>
                            <strong>${escapeHtml(typeLabel)}</strong>
                            ${txn.event_title ? `<div style="font-size: 12px; color: #666;">${escapeHtml(txn.event_title)}</div>` : ''}
                            ${txn.note ? `<div style="font-size: 11px; color: #999;">${escapeHtml(txn.note)}</div>` : ''}
                            <span class="date">${formatDate(txn.created_at)}</span>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div class="amount ${isPositive ? 'positive' : 'negative'}" style="font-size: 18px; font-weight: bold;">
                            ${isPositive ? '+' : ''}₹${Math.abs(amount).toFixed(2)}
                        </div>
                        <div style="font-size: 11px; color: #666; margin-top: 2px;">
                            Balance: ₹${parseFloat(txn.balance_after).toFixed(2)}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async function loadProfileData() {
        if (!currentUser) {
            console.log('No currentUser found in loadProfileData');
            return;
        }

        console.log('Loading profile data for:', currentUser); // Debug log

        const profileName = document.querySelector('.profile-header-info h2');
        if (profileName) {
            profileName.textContent = currentUser.username || 'User';
        }

        const navUserName = document.querySelector('.nav-user .user-profile span');
        if (navUserName) {
            navUserName.textContent = currentUser.username || 'User';
        }

        const profileImages = document.querySelectorAll('.profile-image-large, .user-avatar img, .nav-user img, .profile-header img');
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username || 'User')}&background=6366f1&color=fff`;
        profileImages.forEach(img => {
            img.src = avatarUrl;
            img.alt = currentUser.username;
        });

        const profileRole = document.querySelector('.profile-role');
        if (profileRole) {
            profileRole.textContent = currentUser.user_type === 'organizer' ? 'Event Organizer' : 'Event Professional';
        }

        const profileForm = document.querySelector('.profile-form');
        if (profileForm) {
            console.log('Populating profile form with:', currentUser); // Debug log

            const nameInput = profileForm.querySelector('input[name="username"]');
            if (nameInput) {
                nameInput.value = currentUser.username || '';
                console.log('Set username to:', currentUser.username);
            }

            const contactInput = profileForm.querySelector('input[name="contact_person"]');
            if (contactInput) {
                contactInput.value = currentUser.contact_person || currentUser.username || '';
                console.log('Set contact_person to:', currentUser.contact_person || currentUser.username);
            }

            const emailInput = profileForm.querySelector('input[name="email"]');
            if (emailInput) {
                emailInput.value = currentUser.email || '';
                console.log('Set email to:', currentUser.email);
            }

            const phoneInput = profileForm.querySelector('input[name="phone"]');
            if (phoneInput) {
                phoneInput.value = currentUser.phone || '';
                console.log('Set phone to:', currentUser.phone);
            }

            const citySelect = profileForm.querySelector('select[name="city"]');
            if (citySelect && currentUser.city) {
                citySelect.value = currentUser.city.toLowerCase();
                console.log('Set city to:', currentUser.city);
            }

            const bioTextarea = profileForm.querySelector('textarea[name="bio"]');
            if (bioTextarea) {
                bioTextarea.value = currentUser.bio || '';
                console.log('Set bio to:', currentUser.bio || '(empty)');
            }
        } else {
            console.log('Profile form not found');
        }

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

    // Make globally accessible for event handlers
    window.escapeHtml = escapeHtml;

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

    // Make utility functions globally accessible
    window.formatDate = formatDate;
    window.formatDateTime = formatDateTime;
    window.capitalize = capitalize;

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

            if (targetId === 'discover-jobs') {
                loadJobListings();
            } else if (targetId === 'discover') {
                loadOrganizerTalentGrid();
            } else if (targetId === 'my-applications') {
                loadStaffApplications();
            } else if (targetId === 'my-bookings') {
                loadStaffBookings();
            } else if (targetId === 'dashboard') {
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
                    panel.style.display = panel.dataset.tabContent === target ? 'block' : 'none';
                });

                // Load jobs based on tab selection for My Jobs section
                if (section && section.id === 'my-jobs') {
                    if (target === 'active-jobs') {
                        loadMyJobs('active');
                    } else if (target === 'completed-jobs') {
                        loadMyJobs('completed');
                    } else if (target === 'draft-jobs') {
                        loadMyJobs('draft');
                    }
                }
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
                const target = initialButton.dataset.tab;
                showPanel(target);
            }
        });
    }

    function initUserTypeSelectors() {
        const selectors = document.querySelectorAll('.user-type-selector');
        if (!selectors.length) return;

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
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (event) => {
                event.preventDefault();
                handleLogout();
            });
        }

        const jobForm = document.getElementById('jobPostForm');
        if (jobForm) {
            jobForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                await handleJobPost(jobForm);
            });
        }

        const saveDraftBtn = document.getElementById('saveDraftBtn');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', async (event) => {
                event.preventDefault();
                await handleSaveDraft();
            });
        }

        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                await handleLogin(loginForm);
            });
        }

        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                await handleSignup(signupForm);
            });
        }

        document.querySelectorAll('.profile-form').forEach((form) => {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                await handleProfileUpdate(form);
            });
        });

        const applicationForm = document.getElementById('application-form');
        if (applicationForm) {
            applicationForm.addEventListener('submit', async (event) => {
                await handleJobApplication(event);
            });
        }

        document.addEventListener('click', async (event) => {
            const btn = event.target.closest('.apply-job-btn');
            if (btn) {
                event.preventDefault();
                await handleJobApply(btn);
            }
        });

        document.addEventListener('click', async (event) => {
            const btn = event.target.closest('.view-profile-btn');
            if (btn) {
                event.preventDefault();
                await handleViewProfile(btn);
            }
        });

        document.addEventListener('click', async (event) => {
            const btn = event.target.closest('.hire-talent-btn');
            if (btn) {
                event.preventDefault();
                await handleHireTalent(btn);
            }
        });

        const applicationModal = document.getElementById('application-modal');
        if (applicationModal) {
            applicationModal.addEventListener('click', (event) => {
                if (event.target === applicationModal) {
                    closeApplicationModal();
                }
            });
        }
    }

    async function handleJobPost(form) {
        if (!currentUser) {
            showToast('Please log in to post a job.', 'warning');
            return;
        }

        const formData = new FormData(form);

        const skillTags = Array.from(form.querySelectorAll('.skill-tag'))
            .map(tag => tag.dataset.value || getSkillTagLabel(tag))
            .filter(s => s);

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

            setTimeout(() => loadMyJobs(), 500);
        } catch (err) {
            showToast('Network error while creating job', 'error');
            console.error(err);
        }
    }

    async function handleSaveDraft() {
        if (!currentUser) {
            showToast('Please log in to save a draft.', 'warning');
            return;
        }

        const form = document.getElementById('jobPostForm');
        if (!form) return;

        const formData = new FormData(form);

        const skillTags = Array.from(form.querySelectorAll('.skill-tag'))
            .map(tag => tag.dataset.value || getSkillTagLabel(tag))
            .filter(s => s);

        const requirementsChecked = Array.from(form.querySelectorAll('input[name="requirements"]:checked'))
            .map(cb => cb.value)
            .join(', ');

        const payload = {
            title: formData.get('title') || '',
            role: formData.get('role') || '',
            event_type: formData.get('event_type') || '',
            number_of_staff: formData.get('number_of_staff') || '',
            skills: skillTags.join(', '),
            date: formData.get('date') || null,
            start_time: formData.get('start_time') || null,
            end_time: formData.get('end_time') || null,
            location: formData.get('location') || '',
            pay_rate: formData.get('pay_rate') || '0',
            payment_type: formData.get('payment_type') || 'daily',
            description: formData.get('description') || '',
            requirements: requirementsChecked,
            is_draft: true
        };

        console.log('Draft save payload:', payload); // Debug log

        try {
            const res = await fetch(`${API_BASE}/jobs/create/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include',
            });

            const data = await res.json();

            if (!res.ok) {
                showToast(data.error || 'Failed to save draft', 'error');
                console.error('Draft save error:', data);
                return;
            }

            showToast('Draft saved successfully!', 'success');
            form.reset();

            // Switch to draft tab and reload
            setTimeout(() => {
                const draftTab = document.querySelector('[data-tab="draft-jobs"]');
                if (draftTab) draftTab.click();
                loadMyJobs('draft');
            }, 500);
        } catch (err) {
            showToast('Network error while saving draft', 'error');
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
        localStorage.removeItem('eventflex_user');
        localStorage.clear(); // Clear all localStorage to be safe
        currentUser = null;

        showToast('Logged out successfully', 'success');

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

        console.log('handleJobApply called with jobId:', jobId);

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

        console.log('Calling showApplicationModal...');
        showApplicationModal(jobId, button);
    }

    function showApplicationModal(jobId, button) {
        console.log('showApplicationModal called with jobId:', jobId);

        const modal = document.getElementById('application-modal');
        const jobIdInput = document.getElementById('apply-job-id');
        const modalJobTitle = document.getElementById('modal-job-title');
        const roleInput = document.getElementById('apply-role');

        console.log('Modal element:', modal);
        console.log('Job ID input:', jobIdInput);

        if (!modal || !jobIdInput) {
            console.error('Application modal or job ID input not found');
            return;
        }

        const jobCard = button.closest('.job-listing-card, .job-card');
        let jobTitle = 'Job Application';
        let jobRole = '';

        if (jobCard) {
            const titleElement = jobCard.querySelector('h3');
            if (titleElement) {
                jobTitle = titleElement.textContent.trim();
            }

            const roleElement = jobCard.querySelector('.job-role, [class*="role"]');
            if (roleElement) {
                jobRole = roleElement.textContent.trim();
            } else {
                const metaSpans = jobCard.querySelectorAll('.job-meta span');
                metaSpans.forEach(span => {
                    const text = span.textContent.toLowerCase();
                    if (text.includes('photographer') || text.includes('videographer') ||
                        text.includes('security') || text.includes('coordinator')) {
                        jobRole = span.textContent.trim();
                    }
                });
            }
        }

        jobIdInput.value = jobId;
        if (modalJobTitle) {
            modalJobTitle.textContent = `Applying for: ${jobTitle}`;
        }

        if (currentUser) {
            const fullNameInput = document.getElementById('apply-full-name');
            const emailInput = document.getElementById('apply-email');
            const phoneInput = document.getElementById('apply-phone');
            const cityInput = document.getElementById('apply-city');

            if (fullNameInput && currentUser.first_name && currentUser.last_name) {
                fullNameInput.value = `${currentUser.first_name} ${currentUser.last_name}`.trim();
            } else if (fullNameInput && currentUser.username) {
                fullNameInput.value = currentUser.username;
            }

            if (emailInput && currentUser.email) {
                emailInput.value = currentUser.email;
            }

            if (phoneInput && currentUser.phone) {
                phoneInput.value = currentUser.phone;
            }

            if (cityInput && currentUser.city) {
                cityInput.value = currentUser.city;
            }
        }

        if (roleInput && jobRole) {
            roleInput.value = jobRole;
        }

        console.log('About to show modal...');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        console.log('Modal should now be visible');
    }

    function closeApplicationModal() {
        const modal = document.getElementById('application-modal');
        const form = document.getElementById('application-form');

        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        if (form) {
            form.reset();
        }
    }

    async function handleJobApplication(event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);
        const jobId = formData.get('job_id');

        if (!jobId) {
            showToast('Job ID missing', 'error');
            return;
        }

        if (!currentUser || !currentUser.username) {
            showToast('Please log in to submit application', 'warning');
            return;
        }

        const cvFile = formData.get('cv');
        if (!cvFile || cvFile.size === 0) {
            showToast('Please upload your resume/CV', 'error');
            return;
        }

        if (cvFile.size > 5 * 1024 * 1024) {
            showToast('CV file size must be less than 5MB', 'error');
            return;
        }

        const allowedTypes = ['.pdf', '.doc', '.docx'];
        const fileName = cvFile.name.toLowerCase();
        const isValidType = allowedTypes.some(type => fileName.endsWith(type));
        if (!isValidType) {
            showToast('Please upload PDF, DOC, or DOCX file only', 'error');
            return;
        }

        const cvData = {
            name: cvFile.name,
            size: cvFile.size,
            type: cvFile.type
        };

        const payload = {
            username: currentUser.username,
            full_name: formData.get('full_name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            city: formData.get('city'),
            role: formData.get('role'),
            experience_years: formData.get('experience_years'),
            portfolio_link: formData.get('portfolio_link') || '',
            relevant_skills: formData.get('relevant_skills'),
            certifications: formData.get('certifications') || '',
            availability: formData.get('availability'),
            notice_period: formData.get('notice_period') || '',
            previous_events: formData.get('previous_events'),
            references: formData.get('references') || '',
            why_interested: formData.get('why_interested'),
            expected_compensation: formData.get('expected_compensation') || '',
            cover_message: formData.get('cover_message'),
            cv_info: JSON.stringify(cvData)
        };

        try {
            const res = await fetch(`${API_BASE}/jobs/${jobId}/apply/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include',
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.already_applied) {
                    showToast('You have already applied to this job', 'warning');
                } else {
                    showToast(data.error || 'Failed to submit application', 'error');
                }
                closeApplicationModal();
                return;
            }

            showToast('Application submitted successfully!', 'success');
            closeApplicationModal();

            const applyButtons = document.querySelectorAll(`[data-job-id="${jobId}"]`);
            applyButtons.forEach(btn => {
                btn.disabled = true;
                btn.textContent = 'Applied';
                btn.style.opacity = '0.6';
                btn.style.cursor = 'not-allowed';
            });

            setTimeout(() => {
                if (typeof loadStaffApplications === 'function') {
                    loadStaffApplications();
                }
            }, 1000);
        } catch (err) {
            showToast('Network error while submitting application', 'error');
            console.error(err);
        }
    }

    window.showApplicationModal = showApplicationModal;
    window.closeApplicationModal = closeApplicationModal;
    window.handleJobApplication = handleJobApplication;

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

        const existingModal = document.getElementById('profileModal');
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    window.closeProfileModal = function () {
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

        const confirmed = confirm(`Would you like to send a job offer to ${talentName}?\n\nYou can select a specific job or send a general invitation.`);

        if (!confirmed) return;

        showToast('Direct hiring feature coming soon! For now, please post a job and wait for applications.', 'info');

        setTimeout(() => {
            window.location.href = '/organizer-dashboard/#post-job';
        }, 2000);
    }

    // ============ CHAT COMPOSER - Removed, now using real chat functionality ============

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

    // Make showToast globally accessible
    window.showToast = showToast;

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

    window.generateQRCode = function (applicationId, eventTitle, eventDate, eventLocation) {
        const modal = document.getElementById('qr-modal');
        const qrContainer = document.getElementById('qr-code-container');
        const eventTitleElement = document.getElementById('qr-event-title');
        const eventDetailsElement = document.getElementById('qr-event-details');

        qrContainer.innerHTML = '';

        eventTitleElement.textContent = eventTitle;
        eventDetailsElement.innerHTML = `
            <strong>Date:</strong> ${eventDate}<br>
            <strong>Location:</strong> ${eventLocation}<br>
            <strong>Booking ID:</strong> #${applicationId}
        `;

        const qrData = JSON.stringify({
            applicationId: applicationId,
            eventTitle: eventTitle,
            eventDate: eventDate,
            eventLocation: eventLocation,
            timestamp: new Date().toISOString()
        });

        try {
            new QRCode(qrContainer, {
                text: qrData,
                width: 256,
                height: 256,
                colorDark: "#0f172a",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });

            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            showToast('QR code generated successfully!', 'success');
        } catch (error) {
            console.error('QR code generation failed:', error);
            showToast('Failed to generate QR code. Please try again.', 'error');
        }
    };

    window.viewBookingDetails = async function (jobId) {
        try {
            const response = await fetch(`${API_BASE}/jobs/${jobId}/details/`, {
                credentials: 'include'
            });

            if (!response.ok) {
                showToast('Failed to load booking details', 'error');
                return;
            }

            const job = await response.json();

            // Create and show a modal with booking details
            const modalHTML = `
                <div id="booking-details-modal" class="modal" style="display: flex;">
                    <div class="modal-content" style="max-width: 600px;">
                        <span class="close" onclick="closeBookingDetailsModal()">&times;</span>
                        <h2 style="color: #DAA520; margin-bottom: 1rem;">
                            <i class="fas fa-calendar-check"></i> Booking Details
                        </h2>
                        
                        <div style="background: rgba(218, 165, 32, 0.1); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                            <h3 style="margin-bottom: 1rem; font-size: 1.4rem;">${escapeHtml(job.title)}</h3>
                            <div style="display: grid; gap: 0.75rem;">
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <i class="fas fa-briefcase" style="color: #DAA520; width: 20px;"></i>
                                    <strong>Role:</strong> ${escapeHtml(job.role)}
                                </div>
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <i class="fas fa-tag" style="color: #DAA520; width: 20px;"></i>
                                    <strong>Event Type:</strong> ${escapeHtml(job.event_type)}
                                </div>
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <i class="fas fa-calendar" style="color: #DAA520; width: 20px;"></i>
                                    <strong>Date:</strong> ${formatDate(job.date)}
                                </div>
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <i class="fas fa-clock" style="color: #DAA520; width: 20px;"></i>
                                    <strong>Time:</strong> ${job.start_time || 'TBD'} - ${job.end_time || 'TBD'}
                                </div>
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <i class="fas fa-map-marker-alt" style="color: #DAA520; width: 20px;"></i>
                                    <strong>Location:</strong> ${escapeHtml(job.location)}
                                </div>
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <i class="fas fa-money-bill-wave" style="color: #DAA520; width: 20px;"></i>
                                    <strong>Payment:</strong> ₹${job.pay_rate}/${job.payment_type}
                                </div>
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <i class="fas fa-users" style="color: #DAA520; width: 20px;"></i>
                                    <strong>Staff Needed:</strong> ${job.number_of_staff}
                                </div>
                            </div>
                        </div>

                        <div style="margin-bottom: 1.5rem;">
                            <h4 style="color: #DAA520; margin-bottom: 0.5rem;">
                                <i class="fas fa-info-circle"></i> Description
                            </h4>
                            <p style="line-height: 1.6; color: #94a3b8;">${escapeHtml(job.description) || 'No description provided'}</p>
                        </div>

                        ${job.skills ? `
                        <div style="margin-bottom: 1.5rem;">
                            <h4 style="color: #DAA520; margin-bottom: 0.5rem;">
                                <i class="fas fa-star"></i> Required Skills
                            </h4>
                            <p style="line-height: 1.6; color: #94a3b8;">${escapeHtml(job.skills)}</p>
                        </div>
                        ` : ''}

                        ${job.requirements ? `
                        <div style="margin-bottom: 1.5rem;">
                            <h4 style="color: #DAA520; margin-bottom: 0.5rem;">
                                <i class="fas fa-clipboard-check"></i> Requirements
                            </h4>
                            <p style="line-height: 1.6; color: #94a3b8;">${escapeHtml(job.requirements)}</p>
                        </div>
                        ` : ''}

                        <div style="background: rgba(34, 197, 94, 0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid #22c55e;">
                            <strong style="color: #22c55e;">
                                <i class="fas fa-check-circle"></i> You are confirmed for this event!
                            </strong>
                        </div>
                    </div>
                </div>
            `;

            // Remove any existing modal
            const existingModal = document.getElementById('booking-details-modal');
            if (existingModal) {
                existingModal.remove();
            }

            // Add modal to body
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            document.body.style.overflow = 'hidden';

        } catch (error) {
            console.error('Error loading booking details:', error);
            showToast('Error loading booking details', 'error');
        }
    };

    window.closeBookingDetailsModal = function () {
        const modal = document.getElementById('booking-details-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    };

    window.contactOrganizer = function (organizerName, organizerEmail, organizerPhone) {
        const contactHTML = `
            <div id="contact-organizer-modal" class="modal" style="display: flex;">
                <div class="modal-content" style="max-width: 500px;">
                    <span class="close" onclick="closeContactOrganizerModal()">&times;</span>
                    <h2 style="color: #DAA520; margin-bottom: 1.5rem;">
                        <i class="fas fa-address-book"></i> Contact Organizer
                    </h2>
                    
                    <div style="background: rgba(218, 165, 32, 0.1); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                        <h3 style="margin-bottom: 1rem; font-size: 1.3rem;">
                            <i class="fas fa-user-circle"></i> ${escapeHtml(organizerName)}
                        </h3>
                        
                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            ${organizerEmail ? `
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <i class="fas fa-envelope" style="color: #DAA520; width: 20px;"></i>
                                <div style="flex: 1;">
                                    <strong style="display: block; font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.25rem;">Email</strong>
                                    <a href="mailto:${escapeHtml(organizerEmail)}" 
                                       style="color: #DAA520; text-decoration: none; font-size: 1rem;"
                                       onmouseover="this.style.textDecoration='underline'"
                                       onmouseout="this.style.textDecoration='none'">
                                        ${escapeHtml(organizerEmail)}
                                    </a>
                                </div>
                                <button onclick="copyToClipboard('${escapeHtml(organizerEmail)}')" 
                                        class="btn-sm" 
                                        style="padding: 0.5rem; background: rgba(218, 165, 32, 0.2); border: 1px solid #DAA520;"
                                        title="Copy email">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                            ` : '<p style="color: #94a3b8;"><i class="fas fa-envelope"></i> No email available</p>'}
                            
                            ${organizerPhone ? `
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <i class="fas fa-phone" style="color: #DAA520; width: 20px;"></i>
                                <div style="flex: 1;">
                                    <strong style="display: block; font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.25rem;">Phone</strong>
                                    <a href="tel:${escapeHtml(organizerPhone)}" 
                                       style="color: #DAA520; text-decoration: none; font-size: 1rem;"
                                       onmouseover="this.style.textDecoration='underline'"
                                       onmouseout="this.style.textDecoration='none'">
                                        ${escapeHtml(organizerPhone)}
                                    </a>
                                </div>
                                <button onclick="copyToClipboard('${escapeHtml(organizerPhone)}')" 
                                        class="btn-sm" 
                                        style="padding: 0.5rem; background: rgba(218, 165, 32, 0.2); border: 1px solid #DAA520;"
                                        title="Copy phone">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                            ` : '<p style="color: #94a3b8;"><i class="fas fa-phone"></i> No phone number available</p>'}
                        </div>
                    </div>

                    <div style="background: rgba(59, 130, 246, 0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid #3b82f6;">
                        <p style="margin: 0; color: #94a3b8; font-size: 0.9rem;">
                            <i class="fas fa-info-circle" style="color: #3b82f6;"></i>
                            Contact the organizer for any questions about the event, venue details, or special instructions.
                        </p>
                    </div>
                </div>
            </div>
        `;

        // Remove any existing modal
        const existingModal = document.getElementById('contact-organizer-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', contactHTML);
        document.body.style.overflow = 'hidden';
    };

    window.closeContactOrganizerModal = function () {
        const modal = document.getElementById('contact-organizer-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    };

    window.copyToClipboard = function (text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('Copied to clipboard!', 'success');
            }).catch(err => {
                console.error('Failed to copy:', err);
                showToast('Failed to copy', 'error');
            });
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                showToast('Copied to clipboard!', 'success');
            } catch (err) {
                console.error('Failed to copy:', err);
                showToast('Failed to copy', 'error');
            }
            document.body.removeChild(textarea);
        }
    };

    window.downloadInvoice = async function (applicationId) {
        try {
            // Check if user is logged in
            if (!currentUser) {
                showToast('Please log in to download invoice', 'error');
                return;
            }

            // Fetch application details
            const response = await fetch(`${API_BASE}/applications/${applicationId}/`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch booking details');
            }

            const application = await response.json();

            // Generate invoice HTML
            generateInvoiceHTML(application, currentUser);

        } catch (error) {
            console.error('Error generating invoice:', error);
            showToast('Failed to generate invoice', 'error');
        }
    };

    function generateInvoiceHTML(application, user) {
        const job = application.job;
        const invoiceNumber = `INV-${String(application.id).padStart(6, '0')}`;
        const invoiceDate = new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const eventDate = new Date(job.date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Calculate amounts
        const subtotal = parseFloat(job.pay_rate);
        const platformFee = 0; // No platform fee for demo
        const tax = 0; // No tax for demo
        const total = subtotal + platformFee + tax;

        // Create invoice HTML
        const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice ${invoiceNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            background: #f5f5f5;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            border-bottom: 3px solid #DAA520;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #DAA520;
        }
        .invoice-title {
            text-align: right;
        }
        .invoice-title h1 {
            color: #333;
            font-size: 28px;
            margin-bottom: 5px;
        }
        .invoice-title .invoice-number {
            color: #666;
            font-size: 14px;
        }
        .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        .info-box {
            flex: 1;
        }
        .info-box h3 {
            color: #DAA520;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 10px;
            letter-spacing: 1px;
        }
        .info-box p {
            color: #333;
            line-height: 1.6;
            font-size: 14px;
        }
        .info-box p strong {
            display: inline-block;
            width: 80px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th {
            background: #DAA520;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
        }
        .items-table td {
            padding: 15px 12px;
            border-bottom: 1px solid #e0e0e0;
            color: #333;
            font-size: 14px;
        }
        .items-table tr:last-child td {
            border-bottom: 2px solid #DAA520;
        }
        .totals {
            margin-left: auto;
            width: 300px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
        }
        .total-row.grand-total {
            border-top: 2px solid #DAA520;
            margin-top: 10px;
            padding-top: 15px;
            font-size: 18px;
            font-weight: bold;
            color: #DAA520;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        .payment-status {
            display: inline-block;
            padding: 6px 15px;
            background: #10b981;
            color: white;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 10px;
        }
        .notes {
            background: #f9f9f9;
            padding: 20px;
            border-left: 4px solid #DAA520;
            margin: 20px 0;
            font-size: 13px;
            color: #666;
        }
        @media print {
            body { padding: 0; background: white; }
            .no-print { display: none; }
        }
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: #DAA520;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 2px 10px rgba(218, 165, 32, 0.3);
        }
        .print-button:hover {
            background: #c79400;
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">
        🖨️ Print / Download PDF
    </button>
    
    <div class="invoice-container">
        <div class="header">
            <div class="logo">
                ✨ EventFlex
            </div>
            <div class="invoice-title">
                <h1>INVOICE</h1>
                <p class="invoice-number">${invoiceNumber}</p>
                <p class="invoice-number">Date: ${invoiceDate}</p>
            </div>
        </div>

        <div class="info-section">
            <div class="info-box">
                <h3>Billed To</h3>
                <p><strong>Name:</strong> ${escapeHtml(user.first_name || user.username)} ${escapeHtml(user.last_name || '')}</p>
                <p><strong>Email:</strong> ${escapeHtml(user.email || 'N/A')}</p>
                <p><strong>Phone:</strong> ${escapeHtml(user.phone || 'N/A')}</p>
                <p><strong>City:</strong> ${escapeHtml(user.city || 'N/A')}</p>
            </div>
            <div class="info-box">
                <h3>Event Organizer</h3>
                <p><strong>Name:</strong> ${escapeHtml(job.organizer?.username || 'N/A')}</p>
                <p><strong>Email:</strong> ${escapeHtml(job.organizer?.email || 'N/A')}</p>
                <p><strong>Phone:</strong> ${escapeHtml(job.organizer?.phone || 'N/A')}</p>
            </div>
        </div>

        <div class="notes">
            <strong>📋 Event Details:</strong><br>
            <strong>Event Name:</strong> ${escapeHtml(job.title)}<br>
            <strong>Event Date:</strong> ${eventDate}<br>
            <strong>Location:</strong> ${escapeHtml(job.location)}<br>
            <strong>Role:</strong> ${escapeHtml(job.role)}<br>
            <strong>Time:</strong> ${job.start_time || 'TBD'} - ${job.end_time || 'TBD'}
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Rate</th>
                    <th style="text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <strong>${escapeHtml(job.role)}</strong><br>
                        <small style="color: #666;">${escapeHtml(job.title)} - ${eventDate}</small>
                    </td>
                    <td style="text-align: center;">1</td>
                    <td style="text-align: right;">₹${formatNumber(subtotal)}</td>
                    <td style="text-align: right;">₹${formatNumber(subtotal)}</td>
                </tr>
            </tbody>
        </table>

        <div class="totals">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>₹${formatNumber(subtotal)}</span>
            </div>
            <div class="total-row">
                <span>Platform Fee:</span>
                <span>₹${formatNumber(platformFee)}</span>
            </div>
            <div class="total-row">
                <span>Tax (GST):</span>
                <span>₹${formatNumber(tax)}</span>
            </div>
            <div class="total-row grand-total">
                <span>TOTAL:</span>
                <span>₹${formatNumber(total)}</span>
            </div>
        </div>

        <div style="text-align: center;">
            <span class="payment-status">✓ PAYMENT RECEIVED</span>
        </div>

        <div class="footer">
            <p><strong>EventFlex - Your Event Staffing Partner</strong></p>
            <p>Thank you for using EventFlex! For any queries, contact us at support@eventflex.com</p>
            <p style="margin-top: 10px;">This is a computer-generated invoice and does not require a signature.</p>
        </div>
    </div>
</body>
</html>`;

        // Open invoice in new window
        const invoiceWindow = window.open('', '_blank');
        invoiceWindow.document.write(invoiceHTML);
        invoiceWindow.document.close();

        showToast('Invoice generated successfully! You can now print or save as PDF.', 'success');
    }

    window.withdrawFromEvent = async function (applicationId, eventTitle) {
        const confirmMessage = `Are you sure you want to withdraw from "${eventTitle}"?\n\nThis action will:\n• Remove you from the event\n• Notify the organizer\n• Cannot be undone\n\nYou can apply again if the position is still available.`;

        if (!confirm(confirmMessage)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/applications/${applicationId}/withdraw/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Successfully withdrawn from event', 'success');
                // Reload bookings to reflect the change
                await loadStaffBookings();
            } else {
                showToast(data.error || 'Failed to withdraw from event', 'error');
            }
        } catch (error) {
            console.error('Error withdrawing from event:', error);
            showToast('Error withdrawing from event', 'error');
        }
    };

    window.closeQRModal = function () {
        const modal = document.getElementById('qr-modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    window.addEventListener('click', function (event) {
        const qrModal = document.getElementById('qr-modal');
        if (event.target === qrModal) {
            closeQRModal();
        }

        const bookingDetailsModal = document.getElementById('booking-details-modal');
        if (event.target === bookingDetailsModal) {
            closeBookingDetailsModal();
        }

        const contactOrganizerModal = document.getElementById('contact-organizer-modal');
        if (event.target === contactOrganizerModal) {
            closeContactOrganizerModal();
        }
    });

    window.showWithdrawModal = async function () {
        const modal = document.getElementById('withdraw-modal');
        const balanceInput = document.getElementById('withdraw-balance');
        const availableBalance = document.getElementById('available-balance');

        if (availableBalance) {
            balanceInput.value = availableBalance.textContent;
        }

        // Check if user has bank details
        try {
            const response = await fetch(`${API_BASE}/wallet/bank-details/`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();

                const bankDetailsDisplay = document.getElementById('bank-details-display');
                const addBankBtn = document.getElementById('add-bank-btn');
                const confirmWithdrawBtn = document.getElementById('confirm-withdraw-btn');
                const bankAccountInput = document.getElementById('withdraw-bank-account');
                const bankNameText = document.getElementById('withdraw-bank-name');

                if (data.has_bank_details) {
                    // Show bank details
                    bankDetailsDisplay.style.display = 'block';
                    addBankBtn.style.display = 'none';
                    confirmWithdrawBtn.style.display = 'inline-block';

                    bankAccountInput.value = data.bank_account_number || '****';
                    bankNameText.textContent = data.bank_name ? `${data.bank_name} - ${data.bank_ifsc_code}` : data.bank_ifsc_code;
                } else {
                    // No bank details - prompt to add
                    bankDetailsDisplay.style.display = 'none';
                    addBankBtn.style.display = 'inline-block';
                    confirmWithdrawBtn.style.display = 'none';
                    showToast('Please add your bank details to withdraw funds', 'info');
                }
            }
        } catch (error) {
            console.error('Error checking bank details:', error);
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    window.closeWithdrawModal = function () {
        const modal = document.getElementById('withdraw-modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    window.openBankDetailsFromWithdraw = function () {
        closeWithdrawModal();
        showBankDetailsModal();
    };

    window.showBankDetailsModal = function () {
        const modal = document.getElementById('bank-details-modal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    window.closeBankDetailsModal = function () {
        const modal = document.getElementById('bank-details-modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    window.handleSaveBankDetails = async function (event) {
        event.preventDefault();

        const accountHolder = document.getElementById('bank-account-holder').value;
        const accountNumber = document.getElementById('bank-account-number').value;
        const accountNumberConfirm = document.getElementById('bank-account-number-confirm').value;
        const ifscCode = document.getElementById('bank-ifsc-code').value;
        const bankName = document.getElementById('bank-name').value;
        const bankBranch = document.getElementById('bank-branch').value;

        // Validate account numbers match
        if (accountNumber !== accountNumberConfirm) {
            showToast('Account numbers do not match', 'error');
            return;
        }

        // Validate IFSC code format (11 characters)
        if (ifscCode.length !== 11) {
            showToast('IFSC code must be 11 characters', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/wallet/bank-details/update/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    bank_account_holder: accountHolder,
                    bank_account_number: accountNumber,
                    bank_ifsc_code: ifscCode.toUpperCase(),
                    bank_name: bankName,
                    bank_branch: bankBranch
                })
            });

            const data = await response.json();

            if (response.ok) {
                showToast(data.message || 'Bank details saved successfully!', 'success');
                closeBankDetailsModal();

                // Clear form
                document.getElementById('bank-account-holder').value = '';
                document.getElementById('bank-account-number').value = '';
                document.getElementById('bank-account-number-confirm').value = '';
                document.getElementById('bank-ifsc-code').value = '';
                document.getElementById('bank-name').value = '';
                document.getElementById('bank-branch').value = '';
            } else {
                showToast(data.error || 'Failed to save bank details', 'error');
            }
        } catch (error) {
            console.error('Error saving bank details:', error);
            showToast('Failed to save bank details', 'error');
        }
    };

    window.handleWithdraw = async function (event) {
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
                if (typeof loadWalletData === 'function') {
                    await loadWalletData();
                }
                if (typeof loadTransactions === 'function') {
                    await loadTransactions();
                }
            } else {
                // Check if bank details are required
                if (data.requires_bank_details) {
                    showToast(data.message || 'Please add your bank details first', 'error');
                    setTimeout(() => {
                        closeWithdrawModal();
                        showBankDetailsModal();
                    }, 1500);
                } else {
                    showToast(data.error || 'Withdrawal failed', 'error');
                }
            }
        } catch (err) {
            console.error('Withdrawal error:', err);
            showToast('Failed to process withdrawal', 'error');
        }
    };

    window.showPhotoModal = function () {
        const modal = document.getElementById('photo-modal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    window.closePhotoModal = function () {
        const modal = document.getElementById('photo-modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    window.handlePhotoUpload = async function (event) {
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

    window.showVideoModal = function () {
        const modal = document.getElementById('video-modal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    window.closeVideoModal = function () {
        const modal = document.getElementById('video-modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    window.handleVideoUpload = async function (event) {
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

    window.handleProfileSave = async function (event) {
        event.preventDefault();

        const form = document.getElementById('profile-form');
        const formData = new FormData(form);

        const data = {
            username: formData.get('username') || '',
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
                // Update currentUser with the new profile data
                if (result.profile) {
                    saveCurrentUser(result.profile);

                    // Reload the profile data to update all UI elements
                    await loadProfileData();
                }

                showToast(result.message, 'success');
            } else {
                showToast(result.error || 'Failed to save profile', 'error');
            }
        } catch (err) {
            console.error('Profile save error:', err);
            showToast('Failed to save profile', 'error');
        }
    };
    let currentApplicationId = null;

    window.viewApplicationDetail = async function (applicationId) {
        currentApplicationId = applicationId;

        try {
            const res = await fetch(`${API_BASE}/applications/${applicationId}/`, {
                credentials: 'include'
            });

            if (!res.ok) {
                showToast('Failed to load application details', 'error');
                return;
            }

            const app = await res.json();

            document.getElementById('applicant-name').textContent = app.full_name || app.applicant.username;
            document.getElementById('application-job-title').textContent = `${app.job.role} - ${app.job.title}`;
            document.getElementById('applicant-email').textContent = app.email || app.applicant.email || 'Not provided';
            document.getElementById('applicant-phone').textContent = app.phone || app.applicant.phone || 'Not provided';
            document.getElementById('application-date').textContent = formatDate(app.created_at);

            const statusBadge = document.getElementById('application-status-badge');
            statusBadge.textContent = app.status.toUpperCase();
            statusBadge.className = `badge badge-${app.status}`;

            document.getElementById('applicant-experience').textContent = app.experience_years || '0';
            document.getElementById('applicant-compensation').textContent = app.expected_compensation
                ? `₹${app.expected_compensation}`
                : 'Not specified';

            document.getElementById('applicant-skills').textContent = app.relevant_skills || 'Not provided';
            document.getElementById('applicant-availability').textContent = app.availability || 'Not provided';
            document.getElementById('applicant-previous-events').textContent = app.previous_events || 'Not provided';
            document.getElementById('applicant-why-interested').textContent = app.why_interested || 'Not provided';

            const portfolioSection = document.getElementById('portfolio-section');
            if (app.portfolio_link) {
                portfolioSection.style.display = 'block';
                const portfolioLink = document.getElementById('applicant-portfolio');
                portfolioLink.href = app.portfolio_link;
                portfolioLink.textContent = app.portfolio_link;
            } else {
                portfolioSection.style.display = 'none';
            }

            const resumeSection = document.getElementById('resume-section');
            if (app.resume) {
                resumeSection.style.display = 'block';
                const resumeLink = document.getElementById('applicant-resume');
                resumeLink.href = app.resume;

                const filename = app.resume.split('/').pop();
                document.getElementById('resume-filename').textContent = filename || 'Download Resume';
            } else {
                resumeSection.style.display = 'none';
            }

            const coverMessageSection = document.getElementById('cover-message-section');
            if (app.cover_message) {
                coverMessageSection.style.display = 'block';
                document.getElementById('applicant-cover-message').textContent = app.cover_message;
            } else {
                coverMessageSection.style.display = 'none';
            }

            const aiRatingSection = document.getElementById('ai-rating-section');
            if (app.ai_rating !== null && app.ai_rating !== undefined) {
                aiRatingSection.style.display = 'block';

                const ratingScore = document.getElementById('ai-rating-score');
                ratingScore.textContent = app.ai_rating.toFixed(1) + '/5.0';

                const starsContainer = document.getElementById('ai-rating-stars');
                const fullStars = Math.floor(app.ai_rating);
                const hasHalfStar = (app.ai_rating % 1) >= 0.5;
                const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

                let starsHTML = '';
                for (let i = 0; i < fullStars; i++) {
                    starsHTML += '<i class="fas fa-star"></i>';
                }
                if (hasHalfStar) {
                    starsHTML += '<i class="fas fa-star-half-alt"></i>';
                }
                for (let i = 0; i < emptyStars; i++) {
                    starsHTML += '<i class="far fa-star"></i>';
                }
                starsContainer.innerHTML = starsHTML;

                const ratingDetails = document.getElementById('ai-rating-details');
                ratingDetails.textContent = app.ai_rating_details || 'No detailed feedback available.';
            } else {
                aiRatingSection.style.display = 'none';
            }

            const actionsDiv = document.getElementById('application-actions');
            if (app.status === 'pending') {
                actionsDiv.style.display = 'flex';
            } else {
                actionsDiv.style.display = 'none';
            }

            const modal = document.getElementById('application-detail-modal');
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';

        } catch (err) {
            console.error('Error loading application details:', err);
            showToast('Error loading application details', 'error');
        }
    };

    window.closeApplicationDetailModal = function () {
        const modal = document.getElementById('application-detail-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        currentApplicationId = null;
    };

    window.handleAcceptApplication = async function () {
        if (!currentApplicationId) return;

        if (!confirm('Are you sure you want to accept this application? Funds will be committed for payment.')) {
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/applications/${currentApplicationId}/accept/`, {
                method: 'POST',
                credentials: 'include'
            });

            const data = await res.json();

            if (res.ok) {
                let message = `Application accepted! ${data.applicant_name} has been notified.`;
                if (data.payment_committed) {
                    message += ` Payment of ₹${data.payment_committed} committed.`;
                }
                showToast(message, 'success');
                closeApplicationDetailModal();
                if (typeof loadRecentApplications === 'function') {
                    await loadRecentApplications();
                }
                if (typeof loadDashboardStats === 'function') {
                    await loadDashboardStats();
                }
                if (typeof loadWalletStats === 'function') {
                    await loadWalletStats();
                }
            } else {
                // Show detailed error for insufficient balance
                if (data.required && data.available) {
                    showToast(`Insufficient balance! Required: ₹${data.required}, Available: ₹${data.available}. Please add funds first.`, 'error');
                } else {
                    showToast(data.error || 'Failed to accept application', 'error');
                }
            }
        } catch (err) {
            console.error('Error accepting application:', err);
            showToast('Error accepting application', 'error');
        }
    };

    window.handleRejectApplication = async function () {
        if (!currentApplicationId) return;

        if (!confirm('Are you sure you want to reject this application?')) {
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/applications/${currentApplicationId}/reject/`, {
                method: 'POST',
                credentials: 'include'
            });

            const data = await res.json();

            if (res.ok) {
                showToast('Application rejected', 'success');
                closeApplicationDetailModal();
                if (typeof loadRecentApplications === 'function') {
                    await loadRecentApplications();
                }
                if (typeof loadDashboardStats === 'function') {
                    await loadDashboardStats();
                }
            } else {
                showToast(data.error || 'Failed to reject application', 'error');
            }
        } catch (err) {
            console.error('Error rejecting application:', err);
            showToast('Error rejecting application', 'error');
        }
    };

    window.quickAcceptApplication = async function (appId) {
        if (!confirm('Accept this application? Funds will be committed for payment.')) return;

        try {
            const res = await fetch(`${API_BASE}/applications/${appId}/accept/`, {
                method: 'POST',
                credentials: 'include'
            });

            const data = await res.json();

            if (res.ok) {
                let message = 'Application accepted!';
                if (data.payment_committed) {
                    message += ` Payment of ₹${data.payment_committed} committed.`;
                }
                showToast(message, 'success');
                if (typeof loadRecentApplications === 'function') {
                    await loadRecentApplications();
                }
                if (typeof loadDashboardStats === 'function') {
                    await loadDashboardStats();
                }
                if (typeof loadWalletStats === 'function') {
                    await loadWalletStats();
                }
            } else {
                // Show detailed error for insufficient balance
                if (data.required && data.available) {
                    showToast(`Insufficient balance! Required: ₹${data.required}, Available: ₹${data.available}. Please add funds first.`, 'error');
                } else {
                    showToast(data.error || 'Failed to accept application', 'error');
                }
            }
        } catch (err) {
            console.error('Error accepting application:', err);
            showToast('Error accepting application', 'error');
        }
    };

    window.quickRejectApplication = async function (appId) {
        if (!confirm('Reject this application?')) return;

        try {
            const res = await fetch(`${API_BASE}/applications/${appId}/reject/`, {
                method: 'POST',
                credentials: 'include'
            });

            if (res.ok) {
                showToast('Application rejected', 'success');
                if (typeof loadRecentApplications === 'function') {
                    await loadRecentApplications();
                }
                if (typeof loadDashboardStats === 'function') {
                    await loadDashboardStats();
                }
            } else {
                showToast('Failed to reject application', 'error');
            }
        } catch (err) {
            console.error('Error rejecting application:', err);
            showToast('Error rejecting application', 'error');
        }
    };
})();


// ==========================================
// ==========================================
(function () {
    const API_BASE = '/api';

    const autocompleteFields = {
        'event_type': 'event_type',
        'role': 'role',
        'location': 'location',
        'skillInput': 'skills',

        'apply-role': 'role',
        'apply-skills': 'skills',
        'apply-previous-events': 'previous_events'
    };

    async function loadSuggestions(fieldId, fieldType) {
        try {
            const response = await fetch(`${API_BASE}/autocomplete/suggestions/?field_type=${fieldType}`);
            if (!response.ok) return;

            const data = await response.json();
            const datalistId = fieldId.includes('apply-')
                ? `${fieldId}-suggestions`
                : `${fieldId.replace('Input', '')}-suggestions`;

            const datalist = document.getElementById(datalistId);
            if (!datalist) return;

            datalist.innerHTML = '';

            data.suggestions.forEach(suggestion => {
                const option = document.createElement('option');
                option.value = suggestion.value;
                datalist.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading autocomplete suggestions:', error);
        }
    }

    async function saveSuggestion(fieldType, value) {
        if (!value || value.trim().length < 2) return;

        try {
            await fetch(`${API_BASE}/autocomplete/save/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    field_type: fieldType,
                    value: value.trim()
                })
            });
        } catch (error) {
            console.error('Error saving autocomplete suggestion:', error);
        }
    }

    function initializeAutocomplete() {
        Object.keys(autocompleteFields).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const inputField = document.querySelector(`input[name="${fieldId}"], textarea[name="${fieldId}"]`);
            const targetField = field || inputField;

            if (targetField) {
                const fieldType = autocompleteFields[fieldId];

                loadSuggestions(fieldId, fieldType);

                targetField.addEventListener('blur', function () {
                    if (this.value) {
                        saveSuggestion(fieldType, this.value);
                        setTimeout(() => loadSuggestions(fieldId, fieldType), 500);
                    }
                });
            }
        });

        const jobPostForm = document.getElementById('jobPostForm');
        if (jobPostForm) {
            jobPostForm.addEventListener('submit', function (e) {
                const eventType = document.querySelector('[name="event_type"]');
                const role = document.querySelector('[name="role"]');
                const location = document.querySelector('[name="location"]');
                const skills = document.querySelector('[name="skills"]');

                if (eventType && eventType.value) saveSuggestion('event_type', eventType.value);
                if (role && role.value) saveSuggestion('role', role.value);
                if (location && location.value) saveSuggestion('location', location.value);
                if (skills && skills.value) saveSuggestion('skills', skills.value);
            });
        }

        const applicationForm = document.getElementById('application-form');
        if (applicationForm) {
            applicationForm.addEventListener('submit', function (e) {
                const role = document.getElementById('apply-role');
                const skills = document.getElementById('apply-skills');
                const previousEvents = document.getElementById('apply-previous-events');

                if (role && role.value) saveSuggestion('role', role.value);
                if (skills && skills.value) saveSuggestion('skills', skills.value);
                if (previousEvents && previousEvents.value) saveSuggestion('previous_events', previousEvents.value);
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAutocomplete);
    } else {
        initializeAutocomplete();
    }

    window.addEventListener('modalShown', initializeAutocomplete);
})();


// ==========================================
// ==========================================
(function () {
    const getCurrentLocationBtn = document.getElementById('get-current-location-btn');
    const locationInput = document.getElementById('job-location-input');

    if (!getCurrentLocationBtn || !locationInput) return;

    async function reverseGeocode(latitude, longitude) {
        try {

            try {
                const bdcResponse = await fetch(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                );

                if (bdcResponse.ok) {
                    const bdcData = await bdcResponse.json();

                    let formattedAddress = '';

                    if (bdcData.locality) {
                        formattedAddress += bdcData.locality;
                    }
                    if (bdcData.city && bdcData.city !== bdcData.locality) {
                        formattedAddress += (formattedAddress ? ', ' : '') + bdcData.city;
                    }
                    if (bdcData.principalSubdivision) {
                        formattedAddress += (formattedAddress ? ', ' : '') + bdcData.principalSubdivision;
                    }
                    if (bdcData.countryName) {
                        formattedAddress += (formattedAddress ? ', ' : '') + bdcData.countryName;
                    }

                    if (formattedAddress) {
                        console.log('BigDataCloud address:', formattedAddress);
                        return formattedAddress;
                    }
                }
            } catch (bdcError) {
                console.log('BigDataCloud failed, trying OpenStreetMap...');
            }

            const osmResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'EventFlex-App/1.0'
                    }
                }
            );

            if (!osmResponse.ok) {
                throw new Error('Geocoding service unavailable');
            }

            const osmData = await osmResponse.json();
            const address = osmData.address;

            let formattedAddress = '';

            if (address.amenity || address.building) {
                formattedAddress += (address.amenity || address.building) + ', ';
            }

            if (address.suburb || address.neighbourhood) {
                formattedAddress += (address.suburb || address.neighbourhood) + ', ';
            }

            const cityName = address.city || address.town || address.village || address.municipality;
            if (cityName) {
                formattedAddress += cityName + ', ';
            }

            if (address.state || address.province) {
                formattedAddress += (address.state || address.province) + ', ';
            }

            if (address.country) {
                formattedAddress += address.country;
            }

            formattedAddress = formattedAddress.replace(/,\s*$/, '').replace(/,\s*,/g, ',').trim();

            if (formattedAddress) {
                console.log('OpenStreetMap address:', formattedAddress);
                return formattedAddress;
            }

            return osmData.display_name;

        } catch (error) {
            console.error('Reverse geocoding error:', error);

            try {
                const geoResponse = await fetch(
                    `https://geocode.xyz/${latitude},${longitude}?json=1`
                );

                if (geoResponse.ok) {
                    const geoData = await geoResponse.json();
                    if (geoData.city && geoData.country) {
                        const fallbackAddress = `${geoData.city}, ${geoData.state || geoData.region || ''}, ${geoData.country}`.replace(/,\s*,/g, ',').trim();
                        console.log('Geocode.xyz address:', fallbackAddress);
                        return fallbackAddress;
                    }
                }
            } catch (fallbackError) {
                console.log('All geocoding services failed');
            }

            return `Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`;
        }
    }

    getCurrentLocationBtn.addEventListener('click', async function () {
        if (!navigator.geolocation) {
            showToast('Geolocation is not supported by your browser', 'error');
            return;
        }

        getCurrentLocationBtn.disabled = true;
        getCurrentLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting Location...';

        try {
            console.log('🔍 Requesting GPS location...');

            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,  // Use GPS if available
                    timeout: 20000,            // Wait up to 20 seconds
                    maximumAge: 0              // Don't use cached position
                });
            });

            const { latitude, longitude, accuracy } = position.coords;
            console.log(`📍 Location: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);

            getCurrentLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finding Address...';

            const address = await reverseGeocode(latitude, longitude);
            console.log(`✅ Address: ${address}`);

            locationInput.value = address;
            locationInput.focus();

            locationInput.dispatchEvent(new Event('input', { bubbles: true }));

            setTimeout(() => {
                if (address && address.length > 3) {
                    fetch('/api/autocomplete/save/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            field_type: 'location',
                            value: address
                        })
                    }).catch(err => console.error('Failed to save location suggestion:', err));
                }
            }, 500);

            if (accuracy <= 100) {
                showToast('📍 Location detected successfully!', 'success');
            } else {
                showToast(`📍 Location detected (${Math.round(accuracy)}m accuracy)`, 'success');
            }

        } catch (error) {
            console.error('❌ Location error:', error);

            let errorMessage = 'Unable to get location';

            if (error.code) {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied. Please allow location in browser settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location unavailable. Please enable GPS/Location services.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out. Please try again.';
                        break;
                    default:
                        errorMessage = 'Error getting location. Please try again.';
                }
            }

            showToast(errorMessage, 'error');

        } finally {
            getCurrentLocationBtn.disabled = false;
            getCurrentLocationBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Current Location';
        }
    });
})();


// =========================================
// =========================================
(function () {
    const photoInput = document.getElementById('organizer-photo-input');
    const profileImage = document.getElementById('organizer-profile-image');
    const userAvatar = document.getElementById('user-avatar');

    if (!photoInput) return;

    photoInput.addEventListener('change', async function (event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast('Image size should be less than 5MB', 'error');
            return;
        }

        if (profileImage) {
            profileImage.style.opacity = '0.5';
        }

        const formData = new FormData();
        formData.append('photo', file);

        try {
            const response = await fetch('/api/upload/photo/', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                if (data.photo_url) {
                    if (profileImage) profileImage.src = data.photo_url;
                    if (userAvatar) userAvatar.src = data.photo_url;
                }
                showToast('Profile photo updated successfully!', 'success');
            } else {
                showToast(data.error || 'Failed to upload photo', 'error');
            }
        } catch (error) {
            console.error('Photo upload error:', error);
            showToast('Error uploading photo. Please try again.', 'error');
        } finally {
            if (profileImage) {
                profileImage.style.opacity = '1';
            }
            photoInput.value = '';
        }
    });
})();


// =========================================
// EVENT MANAGEMENT FUNCTIONS
// =========================================
window.cancelEvent = async function (jobId) {
    if (!confirm('Are you sure you want to cancel this event? This action cannot be undone and will remove the event from the database.')) {
        return;
    }

    try {
        const response = await fetch(`/api/jobs/${jobId}/delete/`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert('Event cancelled and removed successfully');
            await loadMyJobs();
            await loadDashboardStats();
        } else {
            alert(data.error || 'Failed to cancel event');
        }
    } catch (error) {
        console.error('Error cancelling event:', error);
        alert('Error cancelling event');
    }
};

// Draft management functions
window.editDraft = async function (jobId) {
    try {
        const response = await fetch(`/api/jobs/${jobId}/details/`, {
            credentials: 'include'
        });

        if (!response.ok) {
            showToast('Failed to load draft details', 'error');
            return;
        }

        const job = await response.json();

        // Populate the form with draft data
        const form = document.getElementById('jobPostForm');
        if (!form) return;

        form.querySelector('[name="title"]').value = job.title || '';
        form.querySelector('[name="event_type"]').value = job.event_type || '';
        form.querySelector('[name="role"]').value = job.role || '';
        form.querySelector('[name="number_of_staff"]').value = job.number_of_staff || '';
        form.querySelector('[name="date"]').value = job.date || '';
        form.querySelector('[name="start_time"]').value = job.start_time || '';
        form.querySelector('[name="end_time"]').value = job.end_time || '';
        form.querySelector('[name="location"]').value = job.location || '';
        form.querySelector('[name="pay_rate"]').value = job.pay_rate || '';
        form.querySelector('[name="payment_type"]').value = job.payment_type || 'daily';
        form.querySelector('[name="description"]').value = job.description || '';

        // Handle skills
        if (job.skills) {
            const skillTags = form.querySelector('.skill-tags');
            const skills = job.skills.split(',').map(s => s.trim()).filter(s => s);
            skills.forEach(skill => {
                const tag = document.createElement('span');
                tag.className = 'skill-tag';
                tag.dataset.value = skill;
                tag.innerHTML = `${skill} <i class="fas fa-times"></i>`;
                skillTags.insertBefore(tag, skillTags.querySelector('#skillInput'));
            });
        }

        // Handle requirements checkboxes
        if (job.requirements) {
            const requirements = job.requirements.split(',').map(r => r.trim());
            requirements.forEach(req => {
                const checkbox = form.querySelector(`input[name="requirements"][value="${req}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }

        // Store the draft ID for updating
        form.dataset.draftId = jobId;

        // Delete the old draft after loading data
        await deleteDraft(jobId, true);

        // Navigate to post job section
        window.location.hash = 'post-job';
        showToast('Draft loaded. Edit and save or post the job.', 'success');
    } catch (error) {
        console.error('Error loading draft:', error);
        showToast('Error loading draft', 'error');
    }
};

window.deleteDraft = async function (jobId, silent = false) {
    if (!silent && !confirm('Are you sure you want to delete this draft?')) {
        return;
    }

    try {
        const response = await fetch(`/api/jobs/${jobId}/delete/`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            if (!silent) {
                showToast('Draft deleted successfully', 'success');
                await loadMyJobs('draft');
            }
        } else {
            if (!silent) showToast(data.error || 'Failed to delete draft', 'error');
        }
    } catch (error) {
        console.error('Error deleting draft:', error);
        if (!silent) showToast('Error deleting draft', 'error');
    }
};

window.openEventDetailsModal = async function (jobId) {
    try {
        const response = await fetch(`/api/jobs/${jobId}/details/`, {
            credentials: 'include'
        });

        if (!response.ok) {
            alert('Failed to load event details');
            return;
        }

        const job = await response.json();
        console.log('Job details received:', job);
        console.log('Hired staff:', job.hired_staff);

        // Store job ID for finish event function
        const modal = document.getElementById('event-details-modal');
        modal.dataset.jobId = jobId;

        document.getElementById('event-detail-title').textContent = job.title;
        document.getElementById('event-detail-type').textContent = job.event_type;
        document.getElementById('event-detail-role').textContent = job.role;
        document.getElementById('event-detail-date').textContent = formatDate(job.date);
        document.getElementById('event-detail-time').textContent = `${job.start_time} - ${job.end_time}`;
        document.getElementById('event-detail-location').textContent = job.location;
        document.getElementById('event-detail-pay').textContent = `₹${job.pay_rate}/${job.payment_type}`;
        document.getElementById('event-detail-staff-needed').textContent = job.number_of_staff;
        document.getElementById('event-detail-description').textContent = job.description;
        document.getElementById('event-detail-requirements').textContent = job.requirements || 'None specified';
        document.getElementById('event-detail-skills').textContent = job.skills || 'None specified';

        // Use hired_staff data from job details response (no separate API call needed)
        if (job.hired_staff && job.hired_staff.length > 0) {
            renderHiredStaff(job.hired_staff, jobId);
        } else {
            document.getElementById('hired-staff-list').innerHTML = '<p class="empty-state">No staff hired yet</p>';
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error('Error loading event details:', error);
        alert('Error loading event details');
    }
};

function renderHiredStaff(staff, jobId) {
    console.log('renderHiredStaff called with:', staff, 'jobId:', jobId);
    const container = document.getElementById('hired-staff-list');

    if (!staff || staff.length === 0) {
        console.log('No staff to display');
        container.innerHTML = '<p class="empty-state">No staff hired yet</p>';
        return;
    }

    console.log('Rendering', staff.length, 'staff members');
    container.innerHTML = staff.map(person => {
        // hired_staff from get_job_details has simple structure: {id, name, email, phone, user_id}
        const fullName = person.name || 'Unknown';
        const email = person.email || 'Not provided';
        const phone = person.phone || 'Not provided';

        return `
            <div class="staff-card">
                <div class="staff-header">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=6366f1&color=fff" alt="${escapeHtml(fullName)}">
                    <div class="staff-info">
                        <h4>${escapeHtml(fullName)}</h4>
                        <p><i class="fas fa-envelope"></i> ${escapeHtml(email)}</p>
                        <p><i class="fas fa-phone"></i> ${escapeHtml(phone)}</p>
                    </div>
                </div>
                <button class="btn-outline" onclick="fireStaff(${person.id}, ${jobId})" style="background: #dc3545; border-color: #dc3545; color: white; width: 100%; margin-top: 0.5rem;">
                    <i class="fas fa-user-times"></i> Fire Staff
                </button>
            </div>
        `;
    }).join('');
}

window.fireStaff = async function (applicationId, jobId) {
    if (!confirm('Are you sure you want to fire this staff member? This will change their application status to rejected.')) {
        return;
    }

    try {
        const response = await fetch(`/api/applications/${applicationId}/reject/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert('Staff member removed successfully');
            openEventDetailsModal(jobId);
        } else {
            alert('Failed to remove staff member');
        }
    } catch (error) {
        console.error('Error removing staff:', error);
        alert('Error removing staff member');
    }
};

window.closeEventDetailsModal = function () {
    const modal = document.getElementById('event-details-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

window.handleFinishEvent = async function () {
    const modal = document.getElementById('event-details-modal');
    const jobId = modal.dataset.jobId;
    const jobTitle = document.getElementById('event-detail-title').textContent;

    if (!jobId) {
        showToast('Event ID not found', 'error');
        return;
    }

    if (!confirm(`Are you sure you want to mark "${jobTitle}" as finished? This will close the event and release payments to all hired staff.`)) {
        return;
    }

    try {
        const response = await fetch(`/api/jobs/${jobId}/finish/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            let message = 'Event marked as finished successfully!';
            if (data.payments_released > 0) {
                message = `Event finished! ₹${data.total_amount} released to ${data.payments_released} staff members.`;
            }
            showToast(message, 'success');
            closeEventDetailsModal();

            // Refresh the jobs list and wallet stats
            if (typeof loadMyJobs === 'function') {
                await loadMyJobs();
            }
            if (typeof loadDashboardStats === 'function') {
                await loadDashboardStats();
            }
            if (typeof loadWalletStats === 'function') {
                await loadWalletStats();
            }
        } else {
            // Show detailed error message if it's a balance issue
            if (data.required && data.available) {
                showToast(`Insufficient funds! Required: ₹${data.required}, Available: ₹${data.available}. Please add funds first.`, 'error');
            } else {
                showToast(data.error || 'Failed to finish event', 'error');
            }
        }
    } catch (error) {
        console.error('Error finishing event:', error);
        showToast('Error finishing event. Please try again.', 'error');
    }
};