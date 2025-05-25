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
                <div class="stat-number">${stats.recent_registrations}</div>
                <div class="stat-label">New Users (30 days)</div>
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
    // async executeConfirmedAction(){
    //     if(!this.pendingAction){
    //         return;
    //     } 
        
    //     try{
    //         let resp;
            
    //         if(this.pendingAction.type === 'status_change'){
    //             resp = await fetch('api.php',{

    //                 method: 'POST',
    //                 headers:{
    //                     'Content-Type': 'application/json',
    //                 },

    //                 body: JSON.stringify({
    //                     type: 'UpdateUserStatus',
    //                     user_id: this.pendingAction.userId,
    //                     is_active: this.pendingAction.newStatus
    //                 })
    //             });
    //         } 
            
    //         else if(this.pendingAction.type === 'delete_user'){
    //             resp = await fetch('api.php',{

    //                 method: 'POST',
    //                 headers:{
    //                     'Content-Type': 'application/json',
    //                 },

    //                 body: JSON.stringify({
    //                     type: 'DeleteUser',
    //                     user_id: this.pendingAction.userId
    //                 })
    //             });
    //         }
            
    //         const res = await resp.json();
            
    //         if(res.status === 'success'){
    //             this.showNotification(res.data.message || 'Action completed successfully', 'success');
    //             this.loadUsers();
    //             this.loadStats();
    //         } 
            
    //         else{
    //             this.showNotification(res.data || 'Action failed', 'error');

    //             // if status change has failed - revert toggle back
    //             if (this.pendingAction.type === 'status_change') {
    //                 const toggle = document.getElementById(`toggle-${this.pendingAction.userId}`);
    //                 if (toggle) {
    //                     toggle.checked = !this.pendingAction.newStatus;
    //                 }
    //             }
    //         }
    //     } 
        
    //     catch(err){
    //         console.error('Error executing action:', err);
    //         this.showNotification('Network error occurred', 'error');
    //     } 
    //     finally{
    //         this.closeModal('confirmation-modal');
    //         this.pendingAction = null;
            
    //         // reset confrim btn
    //         document.getElementById('modal-confirm').className = 'btn btn-primary';
    //         document.getElementById('modal-confirm').textContent = 'Confirm';
    //     }
    // }

    async executeConfirmedAction(){
    if(!this.pendingAction){
        return;
    } 
    
    try{
        // Handle bulk actions first
        if(this.pendingAction.type === 'bulk_status_change'){
            // Handle bulk status changes
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
                    
                    // Check if response is ok
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
            
            // Close modal and reset
            this.closeModal('confirmation-modal');
            this.pendingAction = null;
            document.getElementById('modal-confirm').className = 'btn btn-primary';
            document.getElementById('modal-confirm').textContent = 'Confirm';
            return; // Exit early for bulk actions
        }
        
        // Handle single actions
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
        else {
            // Unknown action type
            console.error('Unknown action type:', this.pendingAction.type);
            this.showNotification('Unknown action type', 'error');
            return;
        }
        
        // Check if response is ok for single actions
        if (!resp.ok) {
            throw new Error(`HTTP error! status: ${resp.status}`);
        }
        
        const res = await resp.json();
        
        if(res.status === 'success'){
            this.showNotification(res.data.message || 'Action completed successfully', 'success');

            // Update the toggle switch if it was a status change
            if (this.pendingAction.type === 'status_change') {
                const toggle = document.getElementById(`toggle-${this.pendingAction.userId}`);
                if (toggle) {
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
    catch(err){
        console.error('Error executing action:', err);
        this.showNotification('Network error occurred', 'error');
    } 
    finally{
        this.closeModal('confirmation-modal');
        this.pendingAction = null;
        
        // reset confirm btn
        document.getElementById('modal-confirm').className = 'btn btn-primary';
        document.getElementById('modal-confirm').textContent = 'Confirm';
    }
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
        // notif elem
        const notif = document.createElement('div');

        notif.className = `notification notification-${type}`;
        notif.innerHTML =`
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // add to the page
        document.body.appendChild(notif);
        
        // get rid of after 5 sec
        setTimeout(()=>{
            if (notif.parentNode) {
                notif.parentNode.removeChild(notif);
            }
        }, 5000);
        
        // close it manually with btn
        notif.querySelector('.notification-close').addEventListener('click', ()=>{
            if(notif.parentNode){
                notif.parentNode.removeChild(notif);
            }
        });
    }

    loadDetailedStats() {
        // detailed analytics placeholder
        console.log('Loading detailed statistics...');
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