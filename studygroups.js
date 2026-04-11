  // Search functionality
        const searchInput = document.getElementById('groupSearchInput');
        const groupCards = document.querySelectorAll('.group-card');

        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            
            groupCards.forEach(card => {
                const title = card.querySelector('h3')?.innerText.toLowerCase() || '';
                const course = card.querySelector('.group-info p')?.innerText.toLowerCase() || '';
                
                if (title.includes(searchTerm) || course.includes(searchTerm)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });

        // Filter functionality
        const filterChips = document.querySelectorAll('.filter-chip');
        
        filterChips.forEach(chip => {
            chip.addEventListener('click', function() {
                filterChips.forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                
                const filterValue = this.dataset.filter;
                
                groupCards.forEach(card => {
                    if (filterValue === 'all') {
                        card.style.display = '';
                    } else if (filterValue === 'available') {
                        if (card.dataset.status === 'available') {
                            card.style.display = '';
                        } else {
                            card.style.display = 'none';
                        }
                    } else if (filterValue === 'cs') {
                        if (card.dataset.category === 'cs') {
                            card.style.display = '';
                        } else {
                            card.style.display = 'none';
                        }
                    } else if (filterValue === 'math') {
                        if (card.dataset.category === 'math') {
                            card.style.display = '';
                        } else {
                            card.style.display = 'none';
                        }
                    } else if (filterValue === 'engineering') {
                        if (card.dataset.category === 'engineering') {
                            card.style.display = '';
                        } else {
                            card.style.display = 'none';
                        }
                    }
                });
            });
        });
