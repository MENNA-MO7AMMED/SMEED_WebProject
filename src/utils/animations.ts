// Animation utility functions for the application

export const fadeIn = (element: HTMLElement, duration = 300): void => {
  element.style.opacity = '0';
  element.style.transition = `opacity ${duration}ms ease-in-out`;
  
  // Trigger reflow to make the transition work
  void element.offsetWidth;
  
  element.style.opacity = '1';
};

export const fadeOut = (
  element: HTMLElement, 
  duration = 300, 
  callback?: () => void
): void => {
  element.style.opacity = '1';
  element.style.transition = `opacity ${duration}ms ease-in-out`;
  
  // Trigger reflow to make the transition work
  void element.offsetWidth;
  
  element.style.opacity = '0';
  
  if (callback) {
    setTimeout(callback, duration);
  }
};

export const slideIn = (
  element: HTMLElement, 
  direction: 'left' | 'right' | 'top' | 'bottom' = 'right', 
  duration = 300
): void => {
  const directionMap = {
    left: 'translateX(-20px)',
    right: 'translateX(20px)',
    top: 'translateY(-20px)',
    bottom: 'translateY(20px)',
  };
  
  element.style.opacity = '0';
  element.style.transform = directionMap[direction];
  element.style.transition = `opacity ${duration}ms ease-in-out, transform ${duration}ms ease-in-out`;
  
  // Trigger reflow to make the transition work
  void element.offsetWidth;
  
  element.style.opacity = '1';
  element.style.transform = 'translate(0, 0)';
};

export const pulseAnimation = (element: HTMLElement, scale = 1.05, duration = 300): void => {
  element.style.transition = `transform ${duration}ms ease-in-out`;
  element.style.transform = `scale(${scale})`;
  
  setTimeout(() => {
    element.style.transform = 'scale(1)';
  }, duration);
};

export const rippleEffect = (event: React.MouseEvent<HTMLElement>): void => {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.className = 'ripple';
  
  button.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
};

export const shimmerEffect = (element: HTMLElement): void => {
  // Create a shimmer element
  const shimmer = document.createElement('div');
  shimmer.className = 'shimmer-effect';
  
  // Append it to the element
  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(shimmer);
  
  // Remove it after animation completes
  setTimeout(() => {
    shimmer.remove();
  }, 2000);
};

export const parallaxScroll = (): void => {
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    
    parallaxElements.forEach((element) => {
      const elementEl = element as HTMLElement;
      const speed = parseFloat(elementEl.dataset.parallax || '0.5');
      const offset = scrollTop * speed;
      
      elementEl.style.transform = `translateY(${offset}px)`;
    });
  });
};

export const initParticleEffect = (canvasId: string): void => {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Set canvas size
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Particle class
  class Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;
    
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 1;
      this.speedX = Math.random() * 3 - 1.5;
      this.speedY = Math.random() * 3 - 1.5;
      this.color = `hsla(${Math.random() * 360}, 80%, 60%, 0.8)`;
    }
    
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    
    draw() {
      if (!ctx) return;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Create particles
  const particles: Particle[] = [];
  for (let i = 0; i < 50; i++) {
    particles.push(new Particle());
  }
  
  // Animation loop
  const animate = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });
    
    requestAnimationFrame(animate);
  };
  
  animate();
};