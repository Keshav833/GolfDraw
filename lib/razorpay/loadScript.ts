/**
 * Dynamically loads the Razorpay checkout.js script and resolves when ready.
 * Safe to call multiple times — resolves immediately if already loaded.
 */
export function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('loadRazorpayScript must be called in the browser'));
      return;
    }

    // Already loaded
    if (window.Razorpay) {
      resolve();
      return;
    }

    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () =>
        reject(new Error('Razorpay script failed to load'))
      );
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Razorpay script failed to load'));
    document.head.appendChild(script);
  });
}
