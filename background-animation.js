class ParticleBackground {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mousePosition = { x: 0, y: 0 };
        this.isDarkMode = document.body.classList.contains('dark-mode');
        
        this.init();
    }

    init() {
        // Set up canvas
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';
        document.body.prepend(this.canvas);

        // Resize handler
        window.addEventListener('resize', () => this.resize());
        this.resize();

        // Mouse move handler
        document.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
        });

        // Theme change handler
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.isDarkMode = document.body.classList.contains('dark-mode');
        });

        // Initialize particles
        this.createParticles();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createParticles();
    }

    createParticles() {
        this.particles = [];
        const particleCount = Math.min(Math.floor((this.canvas.width * this.canvas.height) / 15000), 100);

        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            const distanceToMouse = Math.hypot(
                particle.x - this.mousePosition.x,
                particle.y - this.mousePosition.y
            );

            const interactionRadius = 100;
            let opacity = particle.opacity;

            if (distanceToMouse < interactionRadius) {
                opacity += (1 - distanceToMouse / interactionRadius) * 0.5;
            }

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = this.isDarkMode 
                ? `rgba(255, 255, 255, ${opacity})` 
                : `rgba(110, 142, 251, ${opacity})`;
            this.ctx.fill();

            // Update particle position
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Bounce off edges
            if (particle.x < 0 || particle.x > this.canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.speedY *= -1;
        });

        // Draw connecting lines
        this.drawConnections();
    }

    drawConnections() {
        const maxDistance = 150;

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.hypot(dx, dy);

                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = this.isDarkMode 
                        ? `rgba(255, 255, 255, ${opacity})` 
                        : `rgba(110, 142, 251, ${opacity})`;
                    this.ctx.stroke();
                }
            }
        }
    }

    animate() {
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize the background when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ParticleBackground();
});