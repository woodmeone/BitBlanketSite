import gsap from 'gsap';

export function initCollageAnimations() {
  const cards = document.querySelectorAll('.collage-card');
  
  if (!cards.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const card = entry.target as HTMLElement;
          const rotation = card.style.getPropertyValue('--rotation') || '0deg';
          
          gsap.fromTo(
            card,
            {
              opacity: 0,
              y: 30,
              rotate: rotation,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              delay: index * 0.1,
              ease: 'power2.out',
            }
          );
          
          observer.unobserve(card);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  cards.forEach((card) => observer.observe(card));
}

export function initPageTransition() {
  const content = document.querySelector('main');
  
  if (!content) return;

  gsap.fromTo(
    content,
    {
      opacity: 0,
      y: 20,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
    }
  );
}

export function initHoverEffects() {
  const cards = document.querySelectorAll('.collage-card');
  
  cards.forEach((card) => {
    const el = card as HTMLElement;
    
    el.addEventListener('mouseenter', () => {
      gsap.to(el, {
        y: -4,
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out',
      });
    });
    
    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    });
  });
}

export function initScrollAnimations() {
  const sections = document.querySelectorAll('section');
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  sections.forEach((section) => observer.observe(section));
}

export function initAllAnimations() {
  initPageTransition();
  initCollageAnimations();
  initHoverEffects();
  initScrollAnimations();
}

export default {
  initCollageAnimations,
  initPageTransition,
  initHoverEffects,
  initScrollAnimations,
  initAllAnimations,
};
