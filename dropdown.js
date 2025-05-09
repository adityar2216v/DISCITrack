document.addEventListener('DOMContentLoaded', function() {
    const settingsDropdown = document.getElementById('settingsDropdown');
    const dropdownContent = document.querySelector('.dropdown-content');

    // Function to update dropdown theme
    function updateDropdownTheme() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        if (isDarkMode) {
            dropdownContent.style.backgroundColor = '#1a1a1a';
            dropdownContent.style.color = '#ffffff';
            dropdownContent.querySelectorAll('button').forEach(button => {
                button.classList.remove('hover:bg-gray-100');
                button.classList.add('hover:bg-gray-700');
                button.style.color = '#ffffff';
            });
        } else {
            dropdownContent.style.backgroundColor = '#ffffff';
            dropdownContent.style.color = '#000000';
            dropdownContent.querySelectorAll('button').forEach(button => {
                button.classList.remove('hover:bg-gray-700');
                button.classList.add('hover:bg-gray-100');
                button.style.color = '#000000';
            });
        }
    }

    // Initial theme setup
    updateDropdownTheme();

    // Listen for theme changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                updateDropdownTheme();
            }
        });
    });

    observer.observe(document.body, {
        attributes: true
    });

    // Toggle dropdown on button click
    settingsDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownContent.classList.toggle('hidden');
        if (!dropdownContent.classList.contains('hidden')) {
            dropdownContent.classList.add('animate__fadeIn');
            updateDropdownTheme();
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!dropdownContent.contains(e.target) && !settingsDropdown.contains(e.target)) {
            dropdownContent.classList.add('hidden');
        }
    });

    // Close dropdown when clicking a menu item
    dropdownContent.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function() {
            dropdownContent.classList.add('hidden');
        });
    });
});