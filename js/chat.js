/**
 * Chat System JavaScript
 * Handles the messaging UI, real-time updates, and message management
 */

class ChatSystem {
    constructor() {
        this.currentGroupId = null;
        this.groups = [];
        this.messages = {};
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
    
    async init() {
        if (this.isInitialized) return;
        
        // Skip initialization on index.html
        if (window.location.pathname.includes('index.html')) {
            return;
        }
        
        this.isInitialized = true;
        this.createChatUI();
        this.attachEventListeners();
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
                    <span id="chatMemberCount">0 members</span>
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
        
        // Delegate group selection
        chatGroupList.addEventListener('click', (e) => {
            const groupItem = e.target.closest('.chat-group-item');
            if (groupItem) {
                this.selectGroup(parseInt(groupItem.dataset.groupId));
            }
        });

        // Back button (returns to group list)
        const chatBackBtn = document.getElementById('chatBackBtn');
        if (chatBackBtn) {
            chatBackBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.currentGroupId = null;
                const messagesContainer = document.getElementById('chatMessagesContainer');
                messagesContainer.classList.remove('active');
                document.getElementById('chatTitle').textContent = 'Messages';
                document.getElementById('chatMemberCount').textContent = '0 members';
                chatBackBtn.style.display = 'none';
                if (this.messageRefreshInterval) {
                    clearInterval(this.messageRefreshInterval);
                    this.messageRefreshInterval = null;
                }
            });
        }
    }
    
    async loadChatGroups() {
        try {
            const response = await fetch('../settings/get_chat_groups.php');
            
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
        
        groupList.innerHTML = this.groups.map(group => {
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
        
        // Find group info
        const group = this.groups.find(g => g.id === groupId);
        if (group) {
            document.getElementById('chatTitle').textContent = group.team_name || group.name;
            document.getElementById('chatMemberCount').textContent = `${group.member_count} members`;
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
            const response = await fetch(`../settings/get_messages.php?group_id=${groupId}&limit=50&offset=0`);
            
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
        
        if (!message || !this.currentGroupId) {
            return;
        }
        
        const sendBtn = document.getElementById('chatSendBtn');
        sendBtn.disabled = true;
        
        try {
            const formData = new FormData();
            formData.append('group_id', this.currentGroupId);
            formData.append('message', message);
            
            const response = await fetch('../settings/send_message.php', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                inputField.value = '';
                inputField.focus();
                
                // Reload messages
                await this.loadMessages(this.currentGroupId);
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
