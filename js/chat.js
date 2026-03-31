/**
 * Chat System JavaScript
 * Handles the messaging UI, real-time updates, and message management
 */

class ChatSystem {
    constructor() {
        this.currentGroupId = null;
        this.currentDirectUserId = null;
        this.groups = [];
        this.messages = {};
        this.activeDirectChats = []; // {id, username, full_name, avatar_url}
        this.autoRefreshInterval = null;
        this.messageRefreshInterval = null;
        this.isInitialized = false;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    // Mini DM bubbles: persistence in sessionStorage
    loadMiniBubblesFromSession() {
        try {
            const raw = sessionStorage.getItem('activeDirectChats');
            if (!raw) return;
            const list = JSON.parse(raw);
            if (!Array.isArray(list)) return;
            this.activeDirectChats = list;
            this.renderMiniBubbles();
        } catch (e) {
            console.error('Failed to load mini bubbles:', e);
        }
    }

    saveMiniBubblesToSession() {
        try {
            sessionStorage.setItem('activeDirectChats', JSON.stringify(this.activeDirectChats));
        } catch (e) { console.error(e); }
    }

    addMiniBubble(user) {
        if (!user || !user.id) return;
        // avoid duplicates
        if (this.activeDirectChats.some(u => u.id === user.id)) return;
        const item = { id: user.id, username: user.username || '', full_name: user.full_name || '', avatar_url: user.avatar_url || '' };
        this.activeDirectChats.unshift(item);
        // keep max 6
        if (this.activeDirectChats.length > 6) this.activeDirectChats.pop();
        this.saveMiniBubblesToSession();
        this.renderMiniBubbles();
    }

    removeMiniBubble(userId) {
        this.activeDirectChats = this.activeDirectChats.filter(u => u.id !== userId);
        this.saveMiniBubblesToSession();
        this.renderMiniBubbles();
    }

    renderMiniBubbles() {
        try {
            let container = document.getElementById('miniChatBubbles');
            if (!container) {
                container = document.createElement('div');
                container.id = 'miniChatBubbles';
                container.style.position = 'fixed';
                container.style.bottom = '100px';
                container.style.right = '30px';
                container.style.display = 'flex';
                container.style.flexDirection = 'column-reverse';
                container.style.gap = '10px';
                container.style.zIndex = '1002';
                document.body.appendChild(container);
            }

            container.innerHTML = '';

            this.activeDirectChats.forEach(u => {
                const wrap = document.createElement('div');
                wrap.className = 'mini-bubble-wrap';
                wrap.style.position = 'relative';

                const el = document.createElement('button');
                el.className = 'mini-bubble';
                el.title = u.full_name || u.username || 'Direct message';
                el.dataset.userid = u.id;
                el.type = 'button';

                // avatar or initials
                if (u.avatar_url) {
                    el.style.backgroundImage = `url(${u.avatar_url})`;
                    el.style.backgroundSize = 'cover';
                    el.style.backgroundPosition = 'center';
                } else {
                    const initials = (u.full_name || u.username || '?').split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase();
                    el.textContent = initials;
                    el.style.color = 'white';
                    el.style.fontWeight = '600';
                }

                el.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    // open direct chat
                    this.currentGroupId = null;
                    this.currentDirectUserId = parseInt(u.id);
                    const titleEl = document.getElementById('chatTitle'); if (titleEl) titleEl.textContent = u.full_name || u.username;
                    const chatModal = document.getElementById('chatModal'); if (chatModal) chatModal.classList.add('show');
                    const messagesContainer = document.getElementById('chatMessagesContainer'); if (messagesContainer) messagesContainer.classList.add('active');
                    const chatBackBtn = document.getElementById('chatBackBtn'); if (chatBackBtn) chatBackBtn.style.display = 'inline-block';
                    await this.loadDirectMessages(u.id);
                });

                // close button
                const closeBtn = document.createElement('button');
                closeBtn.className = 'mini-bubble-close';
                closeBtn.type = 'button';
                closeBtn.title = 'Close';
                closeBtn.innerHTML = '&times;';
                closeBtn.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    this.removeMiniBubble(u.id);
                });

                // right-click to remove as well
                el.addEventListener('contextmenu', (ev) => {
                    ev.preventDefault();
                    this.removeMiniBubble(u.id);
                });

                wrap.appendChild(el);
                wrap.appendChild(closeBtn);
                container.appendChild(wrap);
            });
        } catch (e) { console.error('renderMiniBubbles error', e); }
    }
    
    async init() {
        if (this.isInitialized) return;
        
        // Skip initialization on index.html
        if (window.location.pathname.includes('index.html')) {
            return;
        }
        
        this.isInitialized = true;
        this.createChatUI();
        this.attachEventListeners();
        this.loadMiniBubblesFromSession();
        await this.loadChatGroups();
        
        // Set up auto-refresh for groups
        this.autoRefreshInterval = setInterval(() => this.loadChatGroups(), 30000);
    }
    
    createChatUI() {
        // Check if chat bubble already exists
        if (document.getElementById('chatBubble')) {
            return;
        }
        
        // Create chat bubble
        const chatBubble = document.createElement('div');
        chatBubble.id = 'chatBubble';
        chatBubble.className = 'chat-bubble';
        chatBubble.innerHTML = '<span class="unread-badge" id="chatUnreadBadge" style="display:none;">0</span>';
        
        // Create chat modal
        const chatModal = document.createElement('div');
        chatModal.id = 'chatModal';
        chatModal.className = 'chat-modal';
        chatModal.innerHTML = `
            <div class="chat-header">
                <div style="display:flex;align-items:center;gap:8px;">
                    <button class="chat-back-btn" id="chatBackBtn" title="Back" style="display:none;">←</button>
                    <h3 id="chatTitle">Messages</h3>
                </div>
                <div class="chat-header-right">
                    <div id="chatMemberWrapper" style="display:flex;align-items:center;gap:8px;">
                        <span id="chatMemberCount" style="font-size:12px;color:rgba(255,255,255,0.9);"></span>
                        <button id="chatAddBtn" class="chat-add-btn" style="display:inline-block;background:rgba(255,255,255,0.12);color:white;border:none;padding:6px 8px;border-radius:8px;cursor:pointer;font-size:12px;">+</button>
                    </div>
                    <button class="chat-close-btn" id="chatCloseBtn">&times;</button>
                </div>
            </div>
            
            <div class="chat-group-list" id="chatGroupList" style="display:flex;">
                <div class="chat-empty-state">
                    <p>Loading chats...</p>
                </div>
            </div>
            
            <div class="chat-messages-container" id="chatMessagesContainer">
                <div class="chat-messages-list" id="chatMessagesList">
                    <div class="chat-empty-state">
                        <p>Select a chat to view messages</p>
                    </div>
                </div>
                
                <div class="chat-input-area">
                    <input 
                        type="text" 
                        class="chat-input-field" 
                        id="chatInputField" 
                        placeholder="Type a message..."
                        maxlength="2000"
                    >
                    <button class="chat-send-btn" id="chatSendBtn"></button>
                </div>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(chatBubble);
        document.body.appendChild(chatModal);
        
        // Add CSS if not already loaded
        if (!document.querySelector('link[href*="chat.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '../css/chat.css';
            document.head.appendChild(link);
        }
    }
    
    attachEventListeners() {
        const chatBubble = document.getElementById('chatBubble');
        const chatModal = document.getElementById('chatModal');
        const chatCloseBtn = document.getElementById('chatCloseBtn');
        const chatGroupList = document.getElementById('chatGroupList');
        const chatSendBtn = document.getElementById('chatSendBtn');
        const chatInputField = document.getElementById('chatInputField');
        const chatModal_elem = document.getElementById('chatModal');
        
        // Toggle chat modal
        chatBubble.addEventListener('click', (e) => {
            e.stopPropagation();
            chatModal.classList.toggle('show');
        });
        
        // Close chat modal
        chatCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            chatModal.classList.remove('show');
        });
        
        // Close modal when clicking outside
        chatModal.addEventListener('click', (e) => {
            if (e.target === chatModal) {
                chatModal.classList.remove('show');
            }
        });
        
        // Send message on button click
        chatSendBtn.addEventListener('click', () => this.sendMessage());
        
        // Send message on Enter key
        chatInputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Delegate group / direct-chat selection
        chatGroupList.addEventListener('click', (e) => {
            const groupItem = e.target.closest('.chat-group-item');
            if (groupItem) {
                // Direct chat items use data-userid
                if (groupItem.dataset.userid) {
                    const userId = parseInt(groupItem.dataset.userid);
                    this.openDirectChat(userId);
                    return;
                }

                if (groupItem.dataset.groupId) {
                    this.selectGroup(parseInt(groupItem.dataset.groupId));
                }
            }
        });

        // Back button (returns to group list)
        const chatBackBtn = document.getElementById('chatBackBtn');
        if (chatBackBtn) {
            chatBackBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.currentGroupId = null;
                this.currentDirectUserId = null;
                const messagesContainer = document.getElementById('chatMessagesContainer');
                messagesContainer.classList.remove('active');
                document.getElementById('chatTitle').textContent = 'Messages';
                // reset member UI
                const memberCountEl = document.getElementById('chatMemberCount');
                if (memberCountEl) memberCountEl.textContent = '';
                try { const addBtn = document.getElementById('chatAddBtn'); if (addBtn) addBtn.style.display = 'inline-block'; } catch(e){}
                chatBackBtn.style.display = 'none';
                if (this.messageRefreshInterval) {
                    clearInterval(this.messageRefreshInterval);
                    this.messageRefreshInterval = null;
                }
            });
        }

        // Repurpose + button to start a private/direct message conversation
        const chatAddBtn = document.getElementById('chatAddBtn');
        if (chatAddBtn) {
            chatAddBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const query = prompt('Start a private message — enter user email or username:');
                if (!query) return;

                LoadingState && LoadingState.start ? LoadingState.start(chatAddBtn, 'Searching...') : (chatAddBtn.disabled = true);

                try {
                    const res = await fetch('../settings/get_all_users.php');
                    const data = await res.json();
                    if (!data || !Array.isArray(data.users)) throw new Error('Failed to fetch users');

                    const users = data.users;
                    const found = users.find(u => (u.email && u.email.toLowerCase() === query.toLowerCase()) || (u.username && u.username.toLowerCase() === query.toLowerCase()));
                    if (!found) throw new Error('User not found');

                    // Enter direct-message mode
                    this.currentGroupId = null;
                    this.currentDirectUserId = found.id;
                    document.getElementById('chatTitle').textContent = found.full_name || found.username;

                    // Show messages container and load direct messages
                    const messagesContainer = document.getElementById('chatMessagesContainer');
                    messagesContainer.classList.add('active');
                    await this.loadDirectMessages(found.id);

                    // Start auto-refresh for direct messages
                    if (this.messageRefreshInterval) clearInterval(this.messageRefreshInterval);
                    this.messageRefreshInterval = setInterval(() => this.loadDirectMessages(found.id), 5000);

                    document.getElementById('chatInputField').value = '';
                    document.getElementById('chatInputField').focus();

                    // Add a mini bubble for this direct chat (session)
                    try { this.addMiniBubble(found); } catch (e) { console.error(e); }
                } catch (err) {
                    Toast.error(err.message || 'Error starting private message');
                    console.error('Private message error:', err);
                } finally {
                    LoadingState && LoadingState.end ? LoadingState.end(chatAddBtn) : (chatAddBtn.disabled = false);
                }
            });
        }
    }

    async openDirectChat(userId) {
        try {
            this.currentGroupId = null;
            this.currentDirectUserId = parseInt(userId);

            // try to find user info from activeDirectChats
            const user = (this.activeDirectChats || []).find(u => parseInt(u.id) === parseInt(userId)) || { id: userId, username: 'User', full_name: 'User' };

            document.getElementById('chatTitle').textContent = user.full_name || user.username || 'Direct Chat';
            const messagesContainer = document.getElementById('chatMessagesContainer');
            messagesContainer.classList.add('active');
            const chatBackBtn = document.getElementById('chatBackBtn'); if (chatBackBtn) chatBackBtn.style.display = 'inline-block';

            // load messages for this direct chat
            await this.loadDirectMessages(userId);

            // Start auto-refresh for direct messages
            if (this.messageRefreshInterval) clearInterval(this.messageRefreshInterval);
            this.messageRefreshInterval = setInterval(() => this.loadDirectMessages(userId), 5000);

            document.getElementById('chatInputField').value = '';
            document.getElementById('chatInputField').focus();
        } catch (err) {
            console.error('openDirectChat error', err);
        }
    }
    
    async loadChatGroups() {
        try {
            const response = await fetch('../settings/get_chat_groups.php', { credentials: 'same-origin', headers: { 'Accept': 'application/json' } });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && Array.isArray(data.groups)) {
                this.groups = data.groups;
                this.renderGroupList();
                this.updateUnreadBadge();
            }
        } catch (error) {
            console.error('Error loading chat groups:', error);
        }
    }
    
    renderGroupList() {
        const groupList = document.getElementById('chatGroupList');
        
        if (this.groups.length === 0) {
            groupList.innerHTML = `
                <div class="chat-empty-state">
                    <p>No chats yet</p>
                    <p style="font-size: 12px; margin-top: 8px;">Create a team to start chatting</p>
                </div>
            `;
            return;
        }
        
        // Render direct (one-to-one) chats first
        const directHtml = (this.activeDirectChats || []).map(u => {
            const uid = parseInt(u.id);
            const messages = (this.directMessages && this.directMessages[uid]) || [];
            const lastMessage = messages.length ? messages[messages.length - 1].message : 'No messages yet';
            const isActiveDirect = this.currentDirectUserId && parseInt(this.currentDirectUserId) === uid;

            return `
                <div class="chat-group-item direct ${isActiveDirect ? 'active' : ''}" data-userid="${uid}">
                    <div class="chat-group-info" style="flex:1;">
                        <div class="chat-group-name">${this.escapeHtml(u.full_name || u.username || 'Direct')}</div>
                        <div class="chat-group-preview">${this.escapeHtml(lastMessage)}</div>
                    </div>
                </div>
            `;
        }).join('');

        groupList.innerHTML = directHtml + this.groups.map(group => {
            const isActive = this.currentGroupId === group.id;
            const hasUnread = group.unread_count > 0;
            const lastMessage = this.messages[group.id]?.[this.messages[group.id].length - 1]?.message || 'No messages yet';
            
            return `
                <div class="chat-group-item ${isActive ? 'active' : ''} ${hasUnread ? 'unread' : ''}" 
                     data-group-id="${group.id}">
                    <div class="chat-group-info" style="flex:1;">
                        <div class="chat-group-name">${this.escapeHtml(group.team_name || group.name)}</div>
                        <div class="chat-group-preview">${this.escapeHtml(lastMessage)}</div>
                    </div>
                    ${hasUnread ? `<div class="unread-dot"></div>` : ''}
                </div>
            `;
        }).join('');
        // Ensure the + button is visible after rendering the list
        try {
            const addBtn = document.getElementById('chatAddBtn');
            if (addBtn) addBtn.style.display = 'inline-block';
        } catch (e) {
            // ignore
        }
    }
    
    async selectGroup(groupId) {
        this.currentGroupId = groupId;

        // Ensure groups are loaded so the group list contains the target
        if (!Array.isArray(this.groups) || !this.groups.some(g => g.id === groupId)) {
            await this.loadChatGroups();
            this.renderGroupList();
        }
        
        // Update UI
        const groupItems = document.querySelectorAll('.chat-group-item');
        groupItems.forEach(item => {
            item.classList.toggle('active', parseInt(item.dataset.groupId) === groupId);
        });
        
        // Show messages container and the chat modal
        const messagesContainer = document.getElementById('chatMessagesContainer');
        messagesContainer.classList.add('active');
        const chatModal = document.getElementById('chatModal');
        if (chatModal) chatModal.classList.add('show');

        // Show back button
        const chatBackBtn = document.getElementById('chatBackBtn');
        if (chatBackBtn) chatBackBtn.style.display = 'inline-block';
        // Ensure + button remains visible when a chat is selected
        try {
            const addBtn = document.getElementById('chatAddBtn');
            if (addBtn) addBtn.style.display = 'inline-block';
        } catch (e) {}
        
        // Find group info
        const group = this.groups.find(g => g.id === groupId);
        if (group) {
            document.getElementById('chatTitle').textContent = group.team_name || group.name;
            // Update member count
            const memberCountEl = document.getElementById('chatMemberCount');
            if (memberCountEl) memberCountEl.textContent = group.member_count && Number(group.member_count) > 0 ? `${group.member_count} member${group.member_count>1? 's':''}` : '';
        }

        // Highlight and scroll the group item into view in the group list
        try {
            const groupListElem = document.getElementById('chatGroupList');
            const item = groupListElem && groupListElem.querySelector(`.chat-group-item[data-group-id="${groupId}"]`);
            if (item) {
                // add active class on the element (renderGroupList also toggles classes)
                item.classList.add('active');
                // ensure it's visible
                item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } catch (err) {
            // ignore scroll errors
        }
        
        // Load messages
        await this.loadMessages(groupId);
        
        // Start auto-refresh for messages
        if (this.messageRefreshInterval) {
            clearInterval(this.messageRefreshInterval);
        }
        this.messageRefreshInterval = setInterval(() => {
            this.loadMessages(groupId);
        }, 5000);
        
        // Clear input
        document.getElementById('chatInputField').value = '';
        document.getElementById('chatInputField').focus();
    }
    
    async loadMessages(groupId) {
        try {
            const response = await fetch(`../settings/get_messages.php?group_id=${groupId}&limit=50&offset=0`, { credentials: 'same-origin', headers: { 'Accept': 'application/json' } });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && Array.isArray(data.messages)) {
                this.messages[groupId] = data.messages;
                this.renderMessages(groupId);
                
                // Update group list to show latest message
                this.renderGroupList();
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    // Direct messages
    async loadDirectMessages(otherUserId) {
        try {
            const response = await fetch(`../settings/get_direct_messages.php?other_user_id=${otherUserId}&limit=200&offset=0`, { credentials: 'same-origin', headers: { 'Accept': 'application/json' } });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            if (data.success && Array.isArray(data.messages)) {
                this.directMessages = this.directMessages || {};
                this.directMessages[otherUserId] = data.messages;
                this.renderDirectMessages(otherUserId);
            }
        } catch (error) {
            console.error('Error loading direct messages:', error);
        }
    }

    renderDirectMessages(otherUserId) {
        const messagesList = document.getElementById('chatMessagesList');
        const messages = (this.directMessages && this.directMessages[otherUserId]) || [];
        if (messages.length === 0) {
            messagesList.innerHTML = `
                <div class="chat-empty-state" style="margin:auto;">
                    <p>No messages yet</p>
                    <p style="font-size: 12px; margin-top: 8px;">Say hello!</p>
                </div>
            `;
            return;
        }

        const currentUserId = window.currentUserId || null;

        messagesList.innerHTML = messages.map(msg => {
            const isOwn = currentUserId && msg.sender_id === currentUserId;
            const timeStr = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const avatar = msg.full_name?.charAt(0).toUpperCase() || msg.username?.charAt(0).toUpperCase() || '?';

            return `
                <div class="chat-message ${isOwn ? 'own' : ''}">
                    <div class="chat-message-avatar">${this.escapeHtml(avatar)}</div>
                    <div class="chat-message-content">
                        ${!isOwn ? `<div class="chat-message-author">${this.escapeHtml(msg.full_name || msg.username)}</div>` : ''}
                        <div class="chat-message-text">${this.escapeHtml(msg.message)}</div>
                        <div class="chat-message-time">${timeStr}</div>
                    </div>
                </div>
            `;
        }).join('');

        setTimeout(() => {
            messagesList.scrollTop = messagesList.scrollHeight;
        }, 50);
    }
    
    renderMessages(groupId) {
        const messagesList = document.getElementById('chatMessagesList');
        const messages = this.messages[groupId] || [];
        
        if (messages.length === 0) {
            messagesList.innerHTML = `
                <div class="chat-empty-state" style="margin:auto;">
                    <p>No messages yet</p>
                    <p style="font-size: 12px; margin-top: 8px;">Start the conversation!</p>
                </div>
            `;
            return;
        }
        
        // Get current user ID from session (should be available globally)
        const currentUserId = window.currentUserId || null;
        
        messagesList.innerHTML = messages.map(msg => {
            const isOwn = currentUserId && msg.user_id === currentUserId;
            const timeStr = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const avatar = msg.full_name?.charAt(0).toUpperCase() || msg.username?.charAt(0).toUpperCase() || '?';
            
            return `
                <div class="chat-message ${isOwn ? 'own' : ''}">
                    <div class="chat-message-avatar">${this.escapeHtml(avatar)}</div>
                    <div class="chat-message-content">
                        ${!isOwn ? `<div class="chat-message-author">${this.escapeHtml(msg.full_name || msg.username)}</div>` : ''}
                        <div class="chat-message-text">${this.escapeHtml(msg.message)}</div>
                        <div class="chat-message-time">${timeStr}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Scroll to bottom after render (allow layout to settle)
        setTimeout(() => {
            messagesList.scrollTop = messagesList.scrollHeight;
        }, 50);
    }
    
    async sendMessage() {
        const inputField = document.getElementById('chatInputField');
        const message = inputField.value.trim();
        
        if (!message || (!this.currentGroupId && !this.currentDirectUserId)) {
            return;
        }
        
        const sendBtn = document.getElementById('chatSendBtn');
        sendBtn.disabled = true;
        
        try {
            let response, data;

            if (this.currentDirectUserId) {
                const fd = new FormData();
                fd.append('receiver_id', this.currentDirectUserId);
                fd.append('message', message);
                response = await fetch('../settings/send_direct_message.php', {
                    method: 'POST',
                    credentials: 'same-origin',
                    body: fd
                });
            } else {
                const formData = new FormData();
                formData.append('group_id', this.currentGroupId);
                formData.append('message', message);
                response = await fetch('../settings/send_message.php', {
                    method: 'POST',
                    credentials: 'same-origin',
                    body: formData
                });
            }

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            data = await response.json();

            if (data.success) {
                inputField.value = '';
                inputField.focus();
                if (this.currentDirectUserId) {
                    await this.loadDirectMessages(this.currentDirectUserId);
                } else {
                    await this.loadMessages(this.currentGroupId);
                }
            } else {
                alert(data.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Error sending message');
        } finally {
            sendBtn.disabled = false;
        }
    }
    
    updateUnreadBadge() {
        const totalUnread = this.groups.reduce((sum, g) => sum + g.unread_count, 0);
        const badge = document.getElementById('chatUnreadBadge');
        
        if (totalUnread > 0) {
            badge.textContent = totalUnread;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }
    
    // Public methods to manage group members
    async addUserToGroup(groupId, userId) {
        try {
            const formData = new FormData();
            formData.append('action', 'add');
            formData.append('group_id', groupId);
            formData.append('user_id', userId);
            
            const response = await fetch('../settings/manage_group_members.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Error adding user to group:', error);
            return false;
        }
    }
    
    async removeUserFromGroup(groupId, userId) {
        try {
            const formData = new FormData();
            formData.append('action', 'remove');
            formData.append('group_id', groupId);
            formData.append('user_id', userId);
            
            const response = await fetch('../settings/manage_group_members.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Error removing user from group:', error);
            return false;
        }
    }
}

// Initialize chat system and expose globally for other modules
window.chatSystem = new ChatSystem();
