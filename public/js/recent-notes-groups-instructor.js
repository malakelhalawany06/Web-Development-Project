// Set current user
        window.currentUser = {
            id: '<%= user ? user._id : "" %>',
            name: '<%= user ? user.name : "" %>',
            major: '<%= user ? user.major : "" %>',
            role: 'instructor',
            username: '<%= user ? user.username : "" %>'
        };

        // Load recent notes from API
        async function loadRecentNotes() {
            try {
                const response = await fetch('/api/files/instructor');
                if (!response.ok) throw new Error('Failed to load notes');
                
                const files = await response.json();
                const recentNotes = files.slice(0, 4);
                const container = document.getElementById('recentNotesContainer');
                
                if (!container) return;
                
                if (recentNotes.length === 0) {
                    container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text3); grid-column: 1/-1;">No notes shared yet.</div>';
                    return;
                }
                
                container.innerHTML = recentNotes.map(file => `
                    <div class="note-card" onclick="window.location.href='/instructor-notes-files'">
                        <div class="note-icon">${file.fileIcon || '📄'}</div>
                        <div class="note-name">${escapeHtml(file.title || file.fileName)}</div>
                        <div class="note-meta">${escapeHtml(file.course || 'General')}</div>
                    </div>
                `).join('');
                
            } catch (error) {
                console.error('Error loading recent notes:', error);
                const container = document.getElementById('recentNotesContainer');
                if (container) {
                    container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--danger); grid-column: 1/-1;">Failed to load notes</div>';
                }
            }
        }

        function escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Load data when page loads
        document.addEventListener('DOMContentLoaded', function() {
            loadRecentNotes();
        });