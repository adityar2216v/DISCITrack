document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const submitMessage = document.getElementById('formSubmitMessage');

    if (form) {
        form.addEventListener('submit', function(e) {
            // Don't prevent default as we want the form to submit to Google Forms
            
            // Show success message
            submitMessage.textContent = 'Thank you for your message! We will get back to you soon.';
            submitMessage.classList.remove('hidden');
            submitMessage.classList.add('text-green-600');

            // Reset form after successful submission (after a delay)
            setTimeout(() => {
                form.reset();
                submitMessage.classList.add('hidden');
            }, 5000);
        });
    }
});