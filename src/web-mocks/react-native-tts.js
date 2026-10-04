/* eslint-env browser */
module.exports = {
  __esModule: true,
  default: {
    speak: (text) => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
      }
    },
    stop: () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    setDefaultRate: () => {},
    setDefaultPitch: () => {},
  },
  speak: (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  },
  stop: () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  setDefaultRate: () => {},
  setDefaultPitch: () => {},
};
