document.addEventListener('DOMContentLoaded', function() {
    const voteButtons = document.querySelectorAll('.vote-button');
    const fetchDinosaursButton = document.getElementById('fetch-dinosaurs');
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    themeToggle.addEventListener('click', () => {
        document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
        icon.className = document.body.dataset.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        localStorage.setItem('theme', document.body.dataset.theme);
    });
    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.dataset.theme = savedTheme;
    icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    // Image loading
    document.querySelectorAll('.dino-card img').forEach(img => {
        img.classList.add('loading');
        img.onload = () => {
            img.classList.remove('loading');
        };
        img.onerror = () => {
            img.classList.remove('loading');
            img.src = '/img/fallback.png'; // Add a fallback image
        };
    });
    document.getElementById('fetch-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const button = e.target.querySelector('button');
        const originalText = button.innerHTML;
        
        try {
            // Show loading state
            button.disabled = true;
            button.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                Fetching...
            `;
            
            const response = await fetch('/dinosaurs/fetch-images', {
                method: 'POST',
            });
            
            if (response.ok) {
                window.location.reload();
            } else {
                console.error('Failed to fetch new images');
                // Restore button state
                button.disabled = false;
                button.innerHTML = originalText;
            }
        } catch (error) {
            console.error('Error:', error);
            // Restore button state
            button.disabled = false;
            button.innerHTML = originalText;
        }
    });
    // Handle all vote forms
    document.querySelectorAll('.vote-form').forEach(form => {
            form.addEventListener('submit', handleVote);
        });
    async function handleVote(e) {
        e.preventDefault();
        
        const form = e.currentTarget;
        const dinoId = form.dataset.dinoId;
        const button = form.querySelector('.vote-button');
        const voteCount = form.querySelector('.vote-count');
        
        // Disable button during vote
        button.disabled = true;
        
        try {
            const response = await fetch(`/dinosaurs/vote/${dinoId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: dinoId })
                

            });
            
            if (!response.ok) {
                openErrorModal('Vote failed');
            }
    
            const data = await response.json();
            
            if (data.success) {
                // Update vote count with animation
                animateVoteCount(voteCount, data.data.votes);
                
                // Optional: Add success feedback
                button.classList.add('voted');
                setTimeout(() => button.classList.remove('voted'), 1000);
            } else {
                console.log(data.error || 'Vote failed');
                showErrorToast(data.error || 'Vote failed');
            }
        } catch (error) {
            console.error('Error:', error);
            // Show error feedback
            showErrorToast('Failed to vote. Please try again.');
        } finally {
            // Re-enable button
            button.disabled = false;
        }
    }
    
    function animateVoteCount(element, newValue) {
        const currentValue = parseInt(element.textContent);
        const startValue = currentValue;
        const change = newValue - currentValue;
        const duration = 500; // Animation duration in ms
        const startTime = performance.now();
    
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
    
            // Easing function for smooth animation
            const easeOutQuad = 1 - (1 - progress) * (1 - progress);
            
            const currentCount = Math.round(startValue + (change * easeOutQuad));
            element.textContent = currentCount;
    
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
    
        requestAnimationFrame(update);
    }
    
    function showErrorToast(message) {
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
    
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
    
        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

});