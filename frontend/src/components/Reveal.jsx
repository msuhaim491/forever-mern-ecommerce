import { useEffect, useRef } from 'react';

/** Lightweight progressive-enhancement reveal. No animation library or network dependency. */
export default function Reveal({ children, className = '', delay = 0, as: Element = 'div' }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.classList.add('is-visible');
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        node.classList.add('is-visible');
        observer.unobserve(node);
      }
    }, { threshold: 0.08, rootMargin: '0px 0px 35px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <Element ref={ref} className={`reveal ${className}`} style={{ '--reveal-delay': `${delay}ms` }}>{children}</Element>;
}
