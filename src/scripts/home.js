import { initContactForm } from './form.js';
import { initOffer } from './offer.js';

export function initHomePage() {
  const offer = initOffer();
  initContactForm(offer);
}
