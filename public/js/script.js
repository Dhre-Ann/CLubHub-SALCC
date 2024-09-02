document.addEventListener("DOMContentLoaded", () => {
    
    // Filter by club name
    const clubNameInput = document.getElementById('search-club-name');
    const clubs = document.querySelectorAll('[data-tags]');

    clubNameInput.addEventListener('input', () => {
        const filter = clubNameInput.value.toLowerCase();
        clubs.forEach(club => {
            const clubName = club.querySelector('h3').textContent.toLowerCase();
            console.log("clubname: ", clubName);
            if (clubName.includes(filter)) {
                club.style.display = '';
            } else {
                club.style.display = 'none';
            }
        });
    });

    
    // const clubNameInput = document.getElementById('search-club-name');
    // const clubs = document.querySelectorAll('#club-container');

    // // Search and filter by typing club name
    // if (clubNameInput){
    //     clubNameInput.addEventListener('input', () => {
    //         const filter = clubNameInput.value.toLowerCase(); // This monitors key strokes as you type
    //         clubs.forEach(club => {
    //             let clubName = club.querySelector('h3');
    //             clubName = clubName.textContent.toLowerCase();
    //             // if the clubs name includes characters user types in...
    //             if (clubName.includes(filter)) {
    //                 console.log("clubName: ",clubName);
    //                 console.log("filter: ", filter);
    //                 club.style.display = '';
    //             } else {
    //                 club.style.display = 'none';
    //             }
    //         });
    //     });
    // }
    

    // Filter by tags
    const tagInput = document.getElementById('tag-search');
    const tagsContainer = document.getElementById('tag-dropdown');

    // Get unique tags from clubs
    const tags = new Set();
    clubs.forEach(club => {
        const clubTags = club.getAttribute('data-tags').split(' ');
        clubTags.forEach(tag => tags.add(tag));
    });

    // Create tag elements
    tags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.classList.add('p-1', 'text-gray-700', 'font-medium', 'cursor-pointer', 'hover:bg-gray-200', 'rounded');
        tagElement.textContent = tag;
        tagElement.addEventListener('click', () => {
            filterClubsByTag(tag.toLowerCase());
        });
        tagsContainer.appendChild(tagElement);
    });

    // Show tags container on input focus
    tagInput.addEventListener('focus', () => {
        tagsContainer.classList.remove('hidden');
    });

    function filterClubsByTag(selectedTag) {
        clubs.forEach(club => {
            const clubTags = club.getAttribute('data-tags').toLowerCase().split(' ');
            if (clubTags.includes(selectedTag)) {
                club.style.display = '';
            } else {
                club.style.display = 'none';
            }
        });
    }

    // Hide tag dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!tagInput.contains(e.target) && !tagsContainer.contains(e.target)) {
            tagsContainer.classList.add('hidden');
        }
    });
});
