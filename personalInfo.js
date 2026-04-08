document.addEventListener('DOMContentLoaded', function() {
    
    const nameElement = document.querySelector('.sidebar-profile .name');
    const roleElement = document.querySelector('.sidebar-profile .role');
    
    if (nameElement && roleElement) {
      const fullName = nameElement.textContent;     
      const roleText = roleElement.textContent;  
      
      // Split full name into first and last name
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Extract major and year from role text (format: "Major · Yr X")
      let major = '';
      let year = '';
      if (roleText.includes('·')) {
        const parts = roleText.split('·').map(p => p.trim());
        major = parts[0] || '';
        const yearPart = parts[1] || '';
        const yearMatch = yearPart.match(/\d+/);
        year = yearMatch ? yearMatch[0] : '';
      }
      
      
      document.getElementById('fname').value = firstName;
      document.getElementById('lname').value = lastName;
      document.getElementById('major').value = major;
      document.getElementById('year').value = year;
      
      
    }
  });