import { gsap } from 'gsap';

// Dynamic hover animation based on mouse position (ultra subtle scale)
export const animateCardHoverDynamic = (element: HTMLElement, mouseX: number, mouseY: number) => {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  // Calculate mouse position relative to card center (-1 to 1)
  const relativeX = (mouseX - centerX) / (rect.width / 2);
  const relativeY = (mouseY - centerY) / (rect.height / 2);
  
  // Calculate rotation based on mouse position
  const rotateX = -relativeY * 7; // Subtle tilt
  const rotateY = relativeX * 7;
  
  // Calculate lift based on distance from center
  const distanceFromCenter = Math.sqrt(relativeX * relativeX + relativeY * relativeY);
  const lift = 8 + distanceFromCenter * 4; // Subtle lift
  
  gsap.to(element, {
    duration: 0.18,
    scale: 1.01,
    y: -lift,
    z: 10,
    rotationX: rotateX,
    rotationY: rotateY,
    ease: "power2.out",
    boxShadow: `0 ${lift}px ${lift * 1.2}px rgba(0,0,0,0.13)`,
    transformPerspective: 1000,
    transformOrigin: "center center",
    force3D: true,
    clearProps: "transform,boxShadow"
  });
};

// Card hover animation - ultra subtle scale
export const animateCardHover = (element: HTMLElement) => {
  gsap.to(element, {
    duration: 0.18,
    scale: 1.01,
    y: -10,
    z: 10,
    rotationX: 3,
    rotationY: 3,
    ease: "power2.out",
    boxShadow: "0 8px 14px rgba(0,0,0,0.13)",
    transformPerspective: 1000,
    transformOrigin: "center center",
    force3D: true,
    clearProps: "transform,boxShadow"
  });
};

// Card unhover animation - Smooth return to original state
export const animateCardUnhover = (element: HTMLElement) => {
  gsap.to(element, {
    duration: 0.22,
    scale: 1,
    y: 0,
    z: 0,
    rotationX: 0,
    rotationY: 0,
    ease: "power2.out",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    transformPerspective: 1000,
    transformOrigin: "center center",
    force3D: true,
    clearProps: "transform,boxShadow"
  });
};

// Drag start animation - Balatro style lift and rotation
export const animateDragStart = (element: HTMLElement) => {
  gsap.to(element, {
    duration: 0.15,
    scale: 1.1,
    y: -20,
    z: 40,
    rotationX: 8,
    rotationY: 8,
    ease: "power2.out",
    boxShadow: "0 16px 32px rgba(0,0,0,0.2)",
    transformPerspective: 1000,
    transformOrigin: "center center"
  });
};

// Drag end animation - Balatro style snap back
export const animateDragEnd = (element: HTMLElement) => {
  gsap.to(element, {
    duration: 0.4,
    scale: 1,
    y: 0,
    z: 0,
    rotationX: 0,
    rotationY: 0,
    ease: "elastic.out(1, 0.5)",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    transformPerspective: 1000,
    transformOrigin: "center center"
  });
};

// Draw card animation - Balatro style with more dramatic entrance
export const animateDrawCard = (element: HTMLElement, index: number) => {
  gsap.fromTo(element,
    {
      scale: 0.8,
      opacity: 0,
      y: 50,
      rotationX: -20,
      rotationY: -20,
      z: -50
    },
    {
      duration: 0.5,
      scale: 1,
      opacity: 1,
      y: 0,
      rotationX: 0,
      rotationY: 0,
      z: 0,
      delay: index * 0.1,
      ease: "back.out(1.7)",
      transformPerspective: 1000,
      transformOrigin: "center center"
    }
  );
};

// Play card animation - Balatro style with more dramatic placement
export const animatePlayCard = (element: HTMLElement) => {
  gsap.fromTo(element,
    {
      scale: 1.2,
      rotationX: 15,
      rotationY: 15,
      y: -30,
      z: 50
    },
    {
      duration: 0.6,
      scale: 1,
      rotationX: 0,
      rotationY: 0,
      y: 0,
      z: 0,
      ease: "elastic.out(1, 0.5)",
      transformPerspective: 1000,
      transformOrigin: "center center"
    }
  );
};

// Attack animation - Balatro style with more dramatic impact
export const animateAttack = (element: HTMLElement) => {
  gsap.timeline()
    .to(element, {
      duration: 0.2,
      scale: 1.15,
      rotationX: 10,
      rotationY: 10,
      z: 30,
      ease: "power2.out",
      transformPerspective: 1000,
      transformOrigin: "center center"
    })
    .to(element, {
      duration: 0.4,
      scale: 1,
      rotationX: 0,
      rotationY: 0,
      z: 0,
      ease: "elastic.out(1, 0.5)",
      transformPerspective: 1000,
      transformOrigin: "center center"
    });
};

// Card flip animation - Balatro style with more dramatic flip
export const animateCardFlip = (element: HTMLElement) => {
  gsap.to(element, {
    duration: 0.5,
    rotationY: 180,
    ease: "power2.inOut",
    transformOrigin: "center center",
    transformPerspective: 1000
  });
};

// Staggered card reveal animation - Balatro style with more dramatic reveal
export const animateStaggeredReveal = (elements: HTMLElement[]) => {
  gsap.fromTo(elements,
    {
      scale: 0.8,
      opacity: 0,
      y: 30,
      rotationX: -15,
      rotationY: -15,
      z: -30
    },
    {
      duration: 0.5,
      scale: 1,
      opacity: 1,
      y: 0,
      rotationX: 0,
      rotationY: 0,
      z: 0,
      stagger: 0.1,
      ease: "back.out(1.7)",
      transformPerspective: 1000,
      transformOrigin: "center center"
    }
  );
}; 