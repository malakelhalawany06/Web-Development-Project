     // Set current user
    window.currentUser = {
      id: '<%= user ? user._id : "" %>',
      name: '<%= user ? user.name : "" %>',
      username: '<%= user ? user.username : "" %>',
      major: '<%= user ? user.major : "" %>',
      academic_year: '<%= user ? user.academic_year : "" %>',
      role: 'student'
    };
    // Load recent notes
    async function loadRecentNotes() {
      try {
        const response = await fetch('/api/files/shared');
        if (response.ok) {
          const files = await response.json();
          const recentNotes = files.slice(0, 4);
          const container = document.getElementById('recentNotesContainer');
          
          if (recentNotes.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text3); grid-column: 1/-1;">No notes yet. Share your first note!</div>';
            return;
          }
          
          container.innerHTML = recentNotes.map(file => `
            <div class="note-card" onclick="window.location.href='/notes-files'">
              <div class="note-icon">${file.fileIcon || '📄'}</div>
              <div class="note-name">${escapeHtml(file.title || file.fileName)}</div>
              <div class="note-meta">${escapeHtml(file.course || 'General')}</div>
            </div>
          `).join('');
        }
      } catch (error) {
        console.error('Error loading recent notes:', error);
      }
    }

    // Load recent study groups
    async function loadRecentGroups() {
      try {
        const response = await fetch('/api/groups');
        if (response.ok) {
          const groups = await response.json();
          const myGroups = groups.filter(g => g.status === 'joined');
          const recentGroups = myGroups.slice(0, 4);
          const container = document.getElementById('recentGroupsContainer');
          
          if (recentGroups.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text3);">No study groups yet. Create or join your first group!</div>';
            return;
          }
          
          const majorEmojis = {
            'Computer Science': '💻',
            'Business Informatics': '📊',
            'Applied Arts': '🎨',
            'Law': '⚖️',
            'Pharmacy': '💊',
            'Dentistry': '🦷',
            'Networks': '🌐',
            'System Admin': '🖥️'
          };
          
          container.innerHTML = recentGroups.map(group => `
            <div class="group-item" style="cursor: pointer;" onclick="window.location.href='/group-details?id=${group._id}'">
              <div class="group-icon gi-blue">${majorEmojis[group.major] || '📚'}</div>
              <div class="group-info">
                <div class="name">${escapeHtml(group.name)}</div>
                <div class="members">${group.memberCount || group.members?.length || 0} members · ${escapeHtml(group.course)}</div>
              </div>
              <button class="join-btn joined">✓ Joined</button>
            </div>
          `).join('');
          
          // Update the stats card with joined groups count
          document.getElementById('joinedGroupsCount').textContent = myGroups.length;
        }
      } catch (error) {
        console.error('Error loading recent groups:', error);
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
      loadRecentGroups();
    });