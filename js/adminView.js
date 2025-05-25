// adminView.js

class AdminDashboard{
    constructor(){
        this.currentUsers = [];
        this.selectedUsers = new Set();
        this.pendingAction = null;
        
        this.init();
    }

    init(){
        this.setupEventListeners();
        this.loadUsers();
        this.loadStats();
        
    }

    setupEventListeners(){
        // for switching tabs
        document.querySelectorAll('.tab-btn').forEach(btn=>{
            btn.addEventListener('click', (e)=>this.switchTab(e.target.dataset.tab));
            
        })

        // searching
        document.getElementById('search-users').addEventListener('input', this.debounce(()=>this.loadUsers(), 300));

        // changing filters
        document.getElementById('role-filter').addEventListener('change', ()=>this.loadUsers());
        document.getElementById('status-filter').addEventListener('change', ()=>this.loadUsers());

        // refresh page
        document.getElementById('refresh-users').addEventListener('click', ()=>{
            this.loadUsers();
            this.loadStats();
        });

        // bulk actions - select all, activate, deactivate
        document.getElementById('select-all-users').addEventListener('click', ()=>this.toggleSelectAll());

        document.getElementById('activate-selected').addEventListener('click', ()=>this.bulkUpdateStatus(true));
        document.getElementById('deactivate-selected').addEventListener('click', ()=>this.bulkUpdateStatus(false));

        // modals
        this.setupModalListeners();

        // review management events
        document.getElementById('search-reviews').addEventListener('input', this.debounce(()=>this.loadReviews(), 300));
        document.getElementById('rating-filter').addEventListener('change', ()=>this.loadReviews());
        document.getElementById('refresh-reviews').addEventListener('click', ()=>{
            this.loadReviews();
            this.loadStats(); // refresh stats too
        });

    }

    setupModalListeners(){
        // click the x to close the modal
        document.querySelectorAll('.modal .close').forEach(closeBtn=>{
            closeBtn.addEventListener('click', (e)=>{
                const modal = e.target.closest('.modal');
                this.closeModal(modal.id);
            });
        });

        window.addEventListener('click', (e)=>{

            if(e.target.classList.contains('modal')){
                this.closeModal(e.target.id);
            }
        });

        // adding modal buttins
        // cancel button
        document.getElementById('modal-cancel').addEventListener('click', ()=>{
            this.closeModal('confirmation-modal');
        });
        
        // confirm button
        document.getElementById('modal-confirm').addEventListener('click', ()=>{
            this.executeConfirmedAction();
        });
    }

    switchTab(tabName){
        // tab bttns update
        document.querySelectorAll('.tab-btn').forEach(btn=>{
            btn.classList.remove('active');
        });

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // tab content upd
        document.querySelectorAll('.tab-content').forEach(content=>{
            content.classList.remove('active');
        });

        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // specfic data load
        if (tabName === 'stats') {
            this.loadDetailedStats();
        }

        else if (tabName === 'system') {
            this.loadReviews(); // loading reviews
        }
    }

    // loading in the stats asynchronously
    async loadStats(){
        try{
            const resp = await fetch('api.php', { // getting response

                method: 'POST',
                headers:{
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({
                    type: 'GetAdminStats'
                })
            });
            
            const res = await resp.json(); // getting result
            
            if(res.status === 'success'){
                this.displayStats(res.data);
            } 
            
            else{
                console.error('Error loading stats:', res.data);
            }
        } 
        
        catch(error){
            console.error('Error loading stats:', error);
        }
    }

    displayStats(stats){
        const statsContainer = document.getElementById('stats-overview');
        
        const custStats = (stats.role_stats.customer) || {count: 0, active_count: 0};
        const retStats = (stats.role_stats.retailer) || {count: 0, active_count: 0};
        
        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${custStats.count}</div>
                <div class="stat-label">Total Customers</div>
                <div class="stat-sublabel">${custStats.active_count} active</div>
            </div>

            <div class="stat-card">
                <div class="stat-number">${retStats.count}</div>
                <div class="stat-label">Total Retailers</div>
                <div class="stat-sublabel">${retStats.active_count} active</div>
            </div>

            <div class="stat-card">
                <div class="stat-number">${stats.total_products}</div>
                <div class="stat-label">Total Products</div>
                <div class="stat-sublabel">${stats.total_listings} listings</div>
            </div>

            <div class="stat-card">
                <div class="stat-number">${stats.total_reviews}</div>
                <div class="stat-label">Total Reviews</div>
                <div class="stat-sublabel">Avg: ${stats.avg_rating}/5</div>
            </div>
        `;
    }

    // loading in the users asynchronously
    async loadUsers(){
        const search = document.getElementById('search-users').value;
        const role = document.getElementById('role-filter').value;
        const status = document.getElementById('status-filter').value;
        
        try{
            const resp = await fetch('api.php',{

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({
                    type: 'GetAllUsers',
                    search: search,
                    role: role,
                    status: status
                })
            });
            
            const res = await resp.json();
            
            if(res.status === 'success'){
                this.currentUsers = res.data.users;
                this.displayUsers(res.data.users);
            } 
            
            else{
                console.error('Error loading users:', res.data);
                this.showNotification('Error loading users', 'error');
            }
        } 
        
        catch(err){
            console.error('Error loading users:', err);
            this.showNotification('Network error', 'error');
        }

    }

    // load reviews asyncronously
    // async loadReviews(){
    //     const search = document.getElementById('search-reviews').value;
    //     const rating = document.getElementById('rating-filter').value;
        
    //     try{
    //         const resp = await fetch('api.php',{
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 type: 'GetAllReviewsForAdmin',
    //                 search: search,
    //                 rating: rating
    //             })
    //         });
            
    //         const res = await resp.json();
            
    //         if(res.status === 'success'){
    //             this.displayReviews(res.data.reviews);
    //         } 
    //         else{
    //             console.error('Error loading reviews:', res.data);
    //             this.showNotification('Error loading reviews', 'error');
    //         }
    //     } 
    //     catch(err){
    //         console.error('Error loading reviews:', err);
    //         this.showNotification('Network error', 'error');
    //     }
    // }

    async loadReviews(){
        const search = document.getElementById('search-reviews').value;
        const rating = document.getElementById('rating-filter').value;
        
        console.log('Loading reviews with:', { search, rating });
        
        try{
            const resp = await fetch('api.php',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'GetAllReviewsForAdmin',
                    search: search,
                    rating: rating
                })
            });
            
            console.log('Response status:', resp.status);
            console.log('Response headers:', resp.headers);
            
            // get raw resp text
            const responseText = await resp.text();
            console.log('Raw response:', responseText);
            
            //check if html
            if(responseText.trim().startsWith('<')){
                console.error('Received HTML instead of JSON:', responseText.substring(0, 200));
                this.showNotification('Server returned HTML instead of JSON. Check server logs.', 'error');
                return;
            }
            
            // parse to json
            let res;
            try{
                res = JSON.parse(responseText);
            }
            catch(parseError){
                console.error('JSON parse error:', parseError);
                console.error('Response that failed to parse:', responseText);
                this.showNotification('Invalid JSON response from server', 'error');
                return;
            }
            
            if(res.status === 'success'){
                console.log('Successfully loaded reviews:', res.data);
                this.displayReviews(res.data.reviews);
            } 
            else{
                console.error('API error loading reviews:', res.data);
                this.showNotification('Error loading reviews: ' + res.data, 'error');
            }
        } 
        catch(err){
            console.error('Network error loading reviews:', err);
            this.showNotification('Network error: ' + err.message, 'error');
        }
    }

    // display reviews asynchronously
    displayReviews(reviews){
        const container = document.getElementById('reviews-container');
        
        if(reviews.length === 0){
            container.innerHTML = '<div class="no-results">No reviews found matching your criteria.</div>';
            return;
        }
        
        container.innerHTML = reviews.map(review => `
            <div class="review-item" data-review-id="${review.review_id}">
                <div class="review-header">
                    <div class="review-rating">
                        ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                        <span class="rating-number">${review.rating}/5</span>
                    </div>
                    <div class="review-date">${new Date(review.review_date).toLocaleDateString()}</div>
                </div>
                
                <div class="review-content">
                    <div class="review-product">
                        <strong>Product:</strong> ${review.product_name}
                    </div>
                    <div class="review-user">
                        <strong>Reviewer:</strong> ${review.username}
                    </div>
                    <div class="review-comment">
                        <strong>Comment:</strong> ${review.comment || 'No comment provided'}
                    </div>
                </div>
                
                <div class="review-actions">
                    <button class="action-btn delete-btn" onclick="adminDashboard.confirmDeleteReview('${review.review_id}')" title="Delete Review">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    // confirm deleting review
    confirmDeleteReview(reviewId){
        this.pendingAction = {
            type: 'delete_review',
            reviewId: reviewId
        };
        
        document.getElementById('modal-title').textContent = 'Confirm Delete Review';
        document.getElementById('modal-message').textContent = 'Are you sure you want to permanently delete this review? This action cannot be undone.';
        
        document.getElementById('modal-user-info').innerHTML = `
            <div class="user-preview delete-warning">
                <div class="warning-text">
                    <i class="fas fa-exclamation-triangle"></i>
                    This will permanently delete the review and cannot be undone.
                </div>
            </div>
        `;
        
        document.getElementById('modal-confirm').className = 'btn btn-danger';
        document.getElementById('modal-confirm').textContent = 'Delete Review';
        
        this.showModal('confirmation-modal');
    }

    displayUsers(users) {
        const container = document.getElementById('users-container');
        
        if(users.length === 0){
            container.innerHTML = '<div class="no-results">No users found matching your criteria.</div>';

            return;
        }
        
        container.innerHTML = users.map(user=>`
            <div class="user-item" data-user-id="${user.user_id}">
                <div class="user-checkbox">
                    <input type="checkbox" id="user-${user.user_id}" class="user-select" 
                           value="${user.user_id}" ${this.selectedUsers.has(user.user_id)? 'checked': ''}>
                </div>

                <div class="user-avatar">
                    <i class="fas fa-user"></i>
                </div>

                <div class="user-info">
                    <div class="user-name">
                        <span class="status-indicator status-${user.is_active? 'active': 'inactive'}"></span>
                        ${user.username}
                        ${user.company_name? `<span class="company-name">(${user.company_name})</span>`: ''}
                    </div>

                    <div class="user-meta">
                        <span><i class="fas fa-envelope"></i> ${user.email}</span>
                        <span><i class="fas fa-user-tag"></i> ${user.role}</span>
                        <span><i class="fas fa-calendar-alt"></i> Joined: ${new Date(user.created_at).toLocaleDateString()}</span>
                        ${user.activity_count? `<span><i class="fas fa-chart-line"></i> Activity: ${user.activity_count}</span>`: ''}
                    </div>
                </div>

                <div class="user-actions">
                    <button class="action-btn info-btn" onclick="adminDashboard.showUserDetails(${user.user_id})" title="View Details">
                        <i class="fas fa-info-circle"></i>
                    </button>

                    <div class="toggle-container">
                        <input type="checkbox" id="toggle-${user.user_id}" class="toggle" 
                            ${user.is_active? 'checked': ''} 
                            onclick="event.preventDefault(); adminDashboard.confirmStatusChange(${user.user_id}, !this.checked)">

                        <label class="toggle-label" for="toggle-${user.user_id}" onclick="event.preventDefault(); adminDashboard.confirmStatusChange(${user.user_id}, !document.getElementById('toggle-${user.user_id}').checked)">
                            <span class="toggle-inner"></span>
                            <span class="toggle-switch"></span>
                        </label>
                    </div>

                    <button class="action-btn delete-btn" onclick="adminDashboard.confirmDeleteUser(${user.user_id})" title="Delete User">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `
        ).join('');
        
        // eventListeners for the checkboxes
        document.querySelectorAll('.user-select').forEach(checkbox=>{

            checkbox.addEventListener('change', (e)=>{
                const userId = parseInt(e.target.value);

                if(e.target.checked){
                    this.selectedUsers.add(userId);
                } 
                
                else{
                    this.selectedUsers.delete(userId);
                }

                this.updateBulkActionButtons();
            });
        });
    }

    // to confirm after trying to change someones status - extra precautions
    confirmStatusChange(userId, newStatus){
        const user = this.currentUsers.find(u=>u.user_id === userId);
        const toggle = document.getElementById(`toggle-${userId}`);

        if(!user){
            return;
        } 

        toggle.checked = user.is_active;
        
        const action = newStatus? 'activate': 'deactivate';
        const statusTxt = newStatus? 'active': 'inactive';
        
        this.pendingAction ={
            type: 'status_change',
            userId: userId,
            newStatus: newStatus
        };
        
        document.getElementById('modal-title').textContent = `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`;
        document.getElementById('modal-message').textContent = `Are you sure you want to ${action} this user account?`;
        
        document.getElementById('modal-user-info').innerHTML =`
            <div class="user-preview">
                <strong>User:</strong> ${user.username}<br>
                <strong>Email:</strong> ${user.email}<br>
                <strong>Role:</strong> ${user.role}<br>

                <strong>New Status:</strong> <span class="status-${statusTxt}">${statusTxt.toUpperCase()}</span>
            </div>
        `;
        
        this.showModal('confirmation-modal');
    }

    // to confirm after deleting a user, extra precaution
    confirmDeleteUser(userId){
        const user = this.currentUsers.find(u=>u.user_id === userId);

        if(!user){
            return;
        } 
        
        this.pendingAction ={
            type: 'delete_user',
            userId: userId
        };
        
        document.getElementById('modal-title').textContent = 'Confirm Delete User';
        document.getElementById('modal-message').textContent = 'Are you sure you want to permanently delete this user? This action cannot be undone.';
        
        document.getElementById('modal-user-info').innerHTML =`
            <div class="user-preview delete-warning">
                <strong>User:</strong> ${user.username}<br>
                <strong>Email:</strong> ${user.email}<br>
                <strong>Role:</strong> ${user.role}<br>

                <div class="warning-text">
                    <i class="fas fa-exclamation-triangle"></i>
                    This will permanently delete all user data including reviews, listings, and account information.
                </div>
            </div>
        `;
        
        document.getElementById('modal-confirm').className = 'btn btn-danger';
        document.getElementById('modal-confirm').textContent = 'Delete User';
        
        this.showModal('confirmation-modal');
    }

    // confirm the action asyncronously
    async executeConfirmedAction(){
        if(!this.pendingAction){
            return;
        } 
        
        // Disable the confirm button to prevent double-clicks
        const confirmBtn = document.getElementById('modal-confirm');
        const cancelBtn = document.getElementById('modal-cancel');
        confirmBtn.disabled = true;
        cancelBtn.disabled = true;
        confirmBtn.textContent = 'Processing...';
        
        try{
            // Handle bulk actions first
            if(this.pendingAction.type === 'bulk_status_change'){
                console.log('Starting bulk status change...');
                
                const userIds = this.pendingAction.userIds;
                const newStatus = this.pendingAction.newStatus;
                let successCount = 0;
                let failCount = 0;
                
                // Process each user individually
                for(const userId of userIds) {
                    try {
                        const bulkResp = await fetch('api.php', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                type: 'UpdateUserStatus',
                                user_id: userId,
                                is_active: newStatus
                            })
                        });
                        
                        if (!bulkResp.ok) {
                            throw new Error(`HTTP error! status: ${bulkResp.status}`);
                        }
                        
                        const bulkRes = await bulkResp.json();
                        
                        if(bulkRes.status === 'success') {
                            successCount++;
                        } else {
                            failCount++;
                            console.error(`Failed to update user ${userId}:`, bulkRes.data);
                        }
                    } catch (error) {
                        failCount++;
                        console.error(`Error updating user ${userId}:`, error);
                    }
                }
                
                // Show results
                if(successCount > 0) {
                    this.showNotification(`Successfully updated ${successCount} user(s)`, 'success');
                }
                if(failCount > 0) {
                    this.showNotification(`Failed to update ${failCount} user(s)`, 'error');
                }
                
                // Clear selected users and reload
                this.selectedUsers.clear();
                this.updateBulkActionButtons();
                this.loadUsers();
                this.loadStats();
            } 
            // handling single actions
            else {
                let resp;
                
                if(this.pendingAction.type === 'status_change'){
                    resp = await fetch('api.php',{
                        method: 'POST',
                        headers:{
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            type: 'UpdateUserStatus',
                            user_id: this.pendingAction.userId,
                            is_active: this.pendingAction.newStatus
                        })
                    });
                } 

                else if(this.pendingAction.type === 'delete_user'){
                    resp = await fetch('api.php',{
                        method: 'POST',
                        headers:{
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            type: 'DeleteUser',
                            user_id: this.pendingAction.userId
                        })
                    });
                }

                else if(this.pendingAction.type === 'delete_review'){
                resp = await fetch('api.php',{
                    method: 'POST',
                    headers:{
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: 'DeleteReviewAdmin',
                        review_id: this.pendingAction.reviewId
                    })
                });
            }

                else{
                    console.error('Unknown action type:', this.pendingAction.type);
                    this.showNotification('Unknown action type', 'error');
                    return;
                }
                
                if (!resp.ok) {
                    throw new Error(`HTTP error! status: ${resp.status}`);
                }
                
                const res = await resp.json();
                
                if(res.status === 'success'){
                    this.showNotification(res.data.message || 'Action completed successfully', 'success');

                    // reload reviews if it was a review deletion
                    if(this.pendingAction.type === 'delete_review'){
                        this.loadReviews();
                    }

                    // update toggle for status change
                    if(this.pendingAction.type === 'status_change'){
                        const toggle = document.getElementById(`toggle-${this.pendingAction.userId}`);

                        if(toggle){
                            toggle.checked = this.pendingAction.newStatus;
                        }
                    }

                    this.loadUsers();
                    this.loadStats();
                }
                else{
                    this.showNotification(res.data || 'Action failed', 'error');

                    // if status change has failed - revert toggle back
                    if (this.pendingAction.type === 'status_change') {
                        const toggle = document.getElementById(`toggle-${this.pendingAction.userId}`);
                        if (toggle) {
                            toggle.checked = !this.pendingAction.newStatus;
                        }
                    }
                }
            }
        } 
        catch(err){
            console.error('Error executing action:', err);
            this.showNotification('Network error occurred', 'error');
        }
        
        console.log('Cleaning up modal...');
        
        // reset bttns
        confirmBtn.disabled = false;
        cancelBtn.disabled = false;
        
        // modal close
        this.closeModal('confirmation-modal');
        
        // force close for incase
        const modal = document.getElementById('confirmation-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        
        // state reset
        this.pendingAction = null;
        
        //  confirm button
        confirmBtn.className = 'btn btn-primary';
        confirmBtn.textContent = 'Confirm';
    }

    // show user details asyncronously
    async showUserDetails(userId){
        try{
            const resp = await fetch('api.php',{
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({
                    type: 'GetUserDetails',
                    user_id: userId
                })
            });
            
            const res = await resp.json();
            
            if(res.status === 'success'){
                this.displayUserDetails(res.data);
                this.showModal('user-details-modal');
            } 
            
            else{
                this.showNotification('Error loading user details', 'error');
            }
        } 
        
        catch(err){
            console.error('Error loading user details:', err);
            this.showNotification('Network error', 'error');
        }
    }

    displayUserDetails(data){
        const user = data.user;
        const extraData = data.additional_data;
        let ExtraInfo = '';

        if(user.role === 'retailer'){
            ExtraInfo =`
                <div class="detail-section">
                    <h4>Retailer Information</h4>
                    <p><strong>Company:</strong> ${user.company_name || 'Not specified'}</p>
                    <p><strong>Products Listed:</strong> ${extraData.product_count || 0}</p>
                    <p><strong>In Stock Items:</strong> ${extraData.in_stock_count || 0}</p>
                </div>
            `;
        } 
        
        else if(user.role === 'customer'){
            ExtraInfo =`
                <div class="detail-section">
                    <h4>Customer Activity</h4>
                    <p><strong>Reviews Written:</strong> ${extraData.review_count || 0}</p>
                    <p><strong>Wishlist Items:</strong> ${extraData.wishlist_count || 0}</p>
                </div>
            `;
        }
        
        document.getElementById('user-details-content').innerHTML =`
            <div class="user-details">
                <div class="detail-section">
                    <h4>Basic Information</h4>
                    <p><strong>Username:</strong> ${user.username}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Role:</strong> ${user.role}</p>
                    <p><strong>Status:</strong> <span class="status-${user.is_active? 'active': 'inactive'}">${user.is_active? 'Active': 'Inactive'}</span></p>
                    <p><strong>Registered:</strong> ${new Date(user.created_at).toLocaleString()}</p>
                </div>
                ${ExtraInfo}
            </div>
        `;
    }

    toggleSelectAll(){
        const allCheckboxes = document.querySelectorAll('.user-select');
        const allSelected = this.selectedUsers.size === allCheckboxes.length;
        
        allCheckboxes.forEach(checkbox=>{
            checkbox.checked = !allSelected;

            const userId = parseInt(checkbox.value);

            if(!allSelected){
                this.selectedUsers.add(userId);
            } 
            
            else{
                this.selectedUsers.delete(userId);
            }
        });
        
        this.updateBulkActionButtons();
    }

    bulkUpdateStatus(activate){
        if(this.selectedUsers.size === 0){
            this.showNotification('Please first select users', 'warning');
            return;
        }
        
        const action = activate? 'activate': 'deactivate';
        const count = this.selectedUsers.size;
        
        this.pendingAction ={
            type: 'bulk_status_change',
            userIds: Array.from(this.selectedUsers),
            newStatus: activate
        };
        
        document.getElementById('modal-title').textContent = `Confirm Bulk ${action.charAt(0).toUpperCase() + action.slice(1)}`;
        document.getElementById('modal-message').textContent = `Are you sure you want to ${action} ${count} selected user${count > 1? 's': ''}?`;
        
        document.getElementById('modal-user-info').innerHTML =`
            <div class="bulk-preview">
                <p><strong>Selected Users:</strong> ${count}</p>
                <p><strong>Action:</strong> ${action.toUpperCase()}</p>
            </div>
        `;
        
        this.showModal('confirmation-modal');
    }

    updateBulkActionButtons(){
        const selected = this.selectedUsers.size > 0;

        document.getElementById('activate-selected').disabled = !selected;
        document.getElementById('deactivate-selected').disabled = !selected;
    }

    showModal(modalId){
        document.getElementById(modalId).style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    closeModal(modalId){
        document.getElementById(modalId).style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    showNotification(message, type = 'info'){
        // create or get notif container
        let container = document.querySelector('.notification-container');
        
        if(!container){
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        // create notif elem
        const notif = document.createElement('div');
        notif.className = `notification notification-${type}`;
        notif.innerHTML =`
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // add to container - stacks vertically
        container.appendChild(notif);
        
        // func to remove notif and cleanup container
        const removeNotif = () => {
            if(notif && notif.parentNode){
                notif.parentNode.removeChild(notif);
                
                // remove container if empty
                if(container && container.children.length === 0){
                    container.remove();
                }
            }
        };
        
        // auto remove after 5 sec
        const autoRemoveTimer = setTimeout(()=>{
            removeNotif();
        }, 5000);
        
        // manual close with btn
        notif.querySelector('.notification-close').addEventListener('click', ()=>{
            clearTimeout(autoRemoveTimer); // clear auto timer
            removeNotif();
        });
    }

    async loadDetailedStats(){
        try{
            const resp = await fetch('api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'GetDetailedAnalytics'
                })
            });
            
            const res = await resp.json();
            
            if(res.status === 'success'){
                this.displayDetailedStats(res.data);
            } 
            else{
                console.error('Error loading detailed stats:', res.data);
            }
        } 
        catch(error){
            console.error('Error loading detailed stats:', error);
        }
    }

    displayDetailedStats(data){
        // user status breakdown with visual bars
        const userStatusHtml = `
            <div class="analytics-card">
                <h3>User Status by Role</h3>
                <table class="analytics-table">
                    <thead>
                        <tr>
                            <th>Role</th>
                            <th>Active vs Inactive</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.user_status.map(role=>{
                            const activePercentage = role.total_count > 0? (role.active_count / role.total_count) * 100: 0;
                            const inactivePercentage = role.total_count > 0? (role.inactive_count / role.total_count) * 100: 0;
                            
                            return `
                                <tr>
                                    <td><strong>${role.role.charAt(0).toUpperCase() + role.role.slice(1)}s</strong></td>
                                    <td>
                                        <div class="status-bar-container">
                                            <div class="status-bar">
                                                <div class="status-bar-active" style="width: ${activePercentage}%" title="Active: ${activePercentage.toFixed(1)}%"></div>
                                                <div class="status-bar-inactive" style="width: ${inactivePercentage}%" title="Inactive: ${inactivePercentage.toFixed(1)}%"></div>
                                            </div>
                                            <div class="status-legend">
                                                <span class="legend-item">
                                                    <span class="legend-color active"></span>Active
                                                </span>
                                                <span class="legend-item">
                                                    <span class="legend-color inactive"></span>Inactive
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td><strong>${role.total_count}</strong></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                <div style="margin-top: 15px; font-size: 14px; color: #666;">
                    <p><strong>Visual Proportion of active vs inactive users</strong></p>
                    <p><strong>Active:</strong> Users who can log in and use the website</p>
                    <p><strong>Inactive:</strong> Users who are suspended/ blocked from using the website</p>
                </div>
            </div>
        `;

        // users per role table
        const userRolesHtml = `
            <div class="analytics-card">
                <h3>Users by Role</h3>
                <table class="analytics-table">
                    <thead>
                        <tr>
                            <th>Role</th>
                            <th>Count</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.user_roles.map(role=>{
                            const total = data.user_roles.reduce((sum, r)=> sum + parseInt(r.count), 0);
                            const percentage = total > 0? ((parseInt(role.count) / total) * 100).toFixed(1): 0;
                            return `
                                <tr>
                                    <td>${role.role.charAt(0).toUpperCase() + role.role.slice(1)}s</td>
                                    <td><strong>${role.count}</strong></td>
                                    <td>${percentage}%</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // review distribution
        const reviewDistHtml = `
            <div class="analytics-card">
                <h3>Review Distribution</h3>
                <table class="analytics-table">
                    <thead>
                        <tr>
                            <th>Rating</th>
                            <th>Count</th>
                            <th>Bar</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${[5,4,3,2,1].map(rating=>{
                            const count = data.review_distribution[rating] || 0;
                            const total = Object.values(data.review_distribution).reduce((sum, c)=> sum + parseInt(c), 0);
                            const actualPercentage = total > 0 && count > 0? (count / total) * 100: 0;
                            return `
                                <tr>
                                    <td>${'★'.repeat(rating)}${rating < 5? '☆'.repeat(5 - rating): ''}</td>
                                    <td><strong>${count}</strong></td>
                                    <td>
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: ${actualPercentage}%"></div>
                                        </div>
                                        <span style="font-size: 12px; color: #666; margin-left: 5px;">${Math.round(actualPercentage)}%</span>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // customer engagement
        const engagementHtml = `
            <div class="analytics-card">
                <h3>Customer Engagement</h3>
                <div class="engagement-stats">
                    <div class="engagement-metric">
                        <div class="engagement-number">${data.customer_engagement.engagement_percentage}%</div>
                        <div class="engagement-label">Customer Engagement</div>
                        <div class="engagement-detail">
                            ${data.customer_engagement.customers_with_reviews} of ${data.customer_engagement.total_customers} customers have written reviews
                        </div>
                    </div>
                </div>
            </div>
        `;

        // update the analytics grid
        const analyticsGrid = document.querySelector('.analytics-grid');
        if(analyticsGrid){
            analyticsGrid.innerHTML = userStatusHtml + userRolesHtml + reviewDistHtml + engagementHtml;
        }
    }

    debounce(func, wait){
        let timeout;

        return function executedFunction(...args){

            const later = ()=>{
                clearTimeout(timeout);
                func(...args);
            };

            clearTimeout(timeout);

            timeout = setTimeout(later, wait);
        };
    }
}

// global onclick handlers
window.closeModal = function(modalId){
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
};

// intialise dashboard on load
let adminDashboard;

document.addEventListener('DOMContentLoaded', function() {
    adminDashboard = new AdminDashboard();
});