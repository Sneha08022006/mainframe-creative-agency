/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// Custom typewriter hook
function useTypewriter(text: string, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let timeoutId: number;
    let intervalId: number;
    let currentIndex = 0;

    timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        if (currentIndex < text.length) {
          currentIndex++;
          setDisplayed(text.slice(0, currentIndex));
        } else {
          window.clearInterval(intervalId);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const prevXRef = useRef<number | null>(null);
  const targetTimeRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);
  const durationRef = useRef<number>(0);

  // UI state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pillsVisible, setPillsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Typewriter hook
  const introPrompt = "Glad you stopped in. Good taste tends to find us. Now, what are we building?";
  const { displayed: typewriterText, done: typewriterDone } = useTypewriter(introPrompt, 38, 600);

  // Video mouse scrubbing
  const handleSeeked = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.04) {
      video.currentTime = targetTimeRef.current;
    } else {
      isSeekingRef.current = false;
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      durationRef.current = videoRef.current.duration || 0;
      targetTimeRef.current = videoRef.current.currentTime || 0;
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const video = videoRef.current;
      if (!video) return;

      const duration = durationRef.current || video.duration;
      if (!duration || isNaN(duration)) return;

      const currentX = e.clientX;
      if (prevXRef.current === null) {
        prevXRef.current = currentX;
        return;
      }

      const delta = currentX - prevXRef.current;
      prevXRef.current = currentX;

      const SENSITIVITY = 0.8;
      const timeOffset = (delta / window.innerWidth) * SENSITIVITY * duration;
      const newTarget = Math.max(0, Math.min(duration, targetTimeRef.current + timeOffset));
      targetTimeRef.current = newTarget;

      if (!isSeekingRef.current) {
        isSeekingRef.current = true;
        video.currentTime = newTarget;
      }
    };

    const handleMouseLeave = () => {
      prevXRef.current = null;
    };

    // Touch scrubbing support for mobile devices
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        prevXRef.current = e.touches[0].clientX;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const currentX = e.touches[0].clientX;
        const video = videoRef.current;
        if (!video) return;

        const duration = durationRef.current || video.duration;
        if (!duration || isNaN(duration)) return;

        if (prevXRef.current === null) {
          prevXRef.current = currentX;
          return;
        }

        const delta = currentX - prevXRef.current;
        prevXRef.current = currentX;

        const SENSITIVITY = 0.8;
        const timeOffset = (delta / window.innerWidth) * SENSITIVITY * duration;
        const newTarget = Math.max(0, Math.min(duration, targetTimeRef.current + timeOffset));
        targetTimeRef.current = newTarget;

        if (!isSeekingRef.current) {
          isSeekingRef.current = true;
          video.currentTime = newTarget;
        }
      }
    };

    const handleTouchEnd = () => {
      prevXRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Action pills animation: triggers 400ms after page load
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPillsVisible(true);
    }, 400);

    return () => window.clearTimeout(timer);
  }, []);

  // Copy email handler
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('hello@mainframe.co');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const navLinks = [
    { label: 'Labs', href: '#labs' },
    { label: 'Studio', href: '#studio' },
    { label: 'Openings', href: '#openings' },
    { label: 'Shop', href: '#shop' },
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-black text-white font-body">
      {/* BACKGROUND VIDEO (mouse-scrub controlled) */}
      <video
        ref={videoRef}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_041744_63efcd78-bf7d-4039-99e2-2461e8a61903.mp4"
        muted
        playsInline
        preload="auto"
        onSeeked={handleSeeked}
        onLoadedMetadata={handleLoadedMetadata}
        className="fixed inset-0 z-0 w-full h-full object-cover pointer-events-none"
        style={{ objectPosition: '70% center' }}
      />

      {/* NAVBAR (fixed, z-index: 10) */}
      <header className="fixed top-0 left-0 right-0 z-10 px-5 sm:px-8 py-4 sm:py-5 flex justify-between items-center w-full">
        {/* Logo (left) */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-[21px] sm:text-[26px] tracking-tight text-white hover:opacity-90 transition-opacity"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Mainframe®
          </a>
          <span
            className="text-[25px] sm:text-[30px] text-white select-none tracking-[-0.02em] leading-none"
            aria-hidden="true"
          >
            ✳︎
          </span>
        </div>

        {/* Desktop nav links (center, hidden below md) */}
        <nav
          className="hidden md:flex items-center text-[23px] text-white"
          aria-label="Primary navigation"
        >
          {navLinks.map((link, idx) => (
            <React.Fragment key={link.label}>
              <a
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveModal(link.label);
                }}
                className="hover:opacity-60 transition-opacity"
              >
                {link.label}
              </a>
              {idx < navLinks.length - 1 && <span>,&nbsp;</span>}
            </React.Fragment>
          ))}
        </nav>

        {/* Desktop CTA (right, hidden below md) */}
        <div className="hidden md:block">
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              setActiveModal('Get in touch');
            }}
            className="text-[23px] text-white underline underline-offset-2 hover:opacity-60 transition-opacity cursor-pointer"
          >
            Get in touch
          </a>
        </div>

        {/* Mobile hamburger (visible below md) */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] focus:outline-none focus-visible:ring-1 focus-visible:ring-white z-20 cursor-pointer"
        >
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 ${
              isMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white transition-opacity duration-300 ${
              isMenuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 ${
              isMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </header>

      {/* MOBILE OVERLAY (z-index: 9) */}
      <div
        className={`fixed inset-0 z-[9] bg-black/90 backdrop-blur-md flex flex-col justify-center px-8 gap-8 md:hidden transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(false);
                setActiveModal(link.label);
              }}
              className="text-[32px] font-medium text-white hover:opacity-70 transition-opacity"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              setIsMenuOpen(false);
              setActiveModal('Get in touch');
            }}
            className="text-[32px] font-medium text-white underline underline-offset-4 hover:opacity-70 transition-opacity pt-4"
          >
            Get in touch
          </a>
        </div>
      </div>

      {/* HERO SECTION (z-index: 1) */}
      <main className="relative z-[1] h-screen w-full flex flex-col justify-end pb-12 md:justify-center md:pb-0 px-5 sm:px-8 md:px-10 overflow-hidden">
        <div className="max-w-xl relative z-10">
          {/* 1. Blurred intro label */}
          <div
            className="pointer-events-none select-none mb-5 sm:mb-6"
            style={{
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.3,
              fontWeight: 400,
              color: '#fff',
              filter: 'blur(4px)',
            }}
          >
            Hey there, meet A.R.I.A,
            <br />
            Mainframe's Adaptive Response Interface Agent
          </div>

          {/* 2. Typewriter text */}
          <p
            className="text-white mb-5 sm:mb-6 select-text"
            style={{
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.35,
              fontWeight: 400,
              minHeight: '54px',
            }}
          >
            {typewriterText}
            {!typewriterDone && (
              <span
                className="inline-block w-[2px] h-[1.1em] bg-white align-middle ml-[2px] animate-blink"
                aria-hidden="true"
              />
            )}
          </p>

          {/* 3. Action pill buttons */}
          <div
            className={`flex flex-wrap gap-y-1 transition-all duration-400 ease-out ${
              pillsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[8px]'
            }`}
            style={{
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}
          >
            {/* 4 White pill buttons */}
            <button
              type="button"
              onClick={() => setActiveModal('Pitch us an idea')}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap cursor-pointer hover:bg-black hover:text-white transition-colors duration-200"
            >
              Pitch us an idea
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('Come work here')}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap cursor-pointer hover:bg-black hover:text-white transition-colors duration-200"
            >
              Come work here
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('Send a brief hello')}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap cursor-pointer hover:bg-black hover:text-white transition-colors duration-200"
            >
              Send a brief hello
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('See how we operate')}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap cursor-pointer hover:bg-black hover:text-white transition-colors duration-200"
            >
              See how we operate
            </button>

            {/* 1 Outline pill button */}
            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center justify-center text-white bg-transparent border border-white rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap cursor-pointer gap-2 sm:gap-3 hover:bg-white hover:text-black transition-colors duration-200 group"
              title="Click to copy email address"
            >
              <span>
                Reach us:{' '}
                <span className="underline underline-offset-1">
                  hello@mainframe.co
                </span>
              </span>
              {copied ? (
                <span className="text-[11px] font-medium tracking-wide">
                  Copied!
                </span>
              ) : (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="shrink-0 stroke-current"
                >
                  <rect
                    x="3.5"
                    y="3.5"
                    width="7"
                    height="7"
                    rx="1"
                    strokeWidth="1"
                  />
                  <path
                    d="M8.5 2V1.5C8.5 1.22386 8.27614 1 8 1H1.5C1.22386 1 1 1.22386 1 1.5V8C1 8.27614 1.22386 8.5 1.5 8.5H2"
                    strokeWidth="1"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Interactive Information Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-4">
              <h3
                className="text-xl font-medium tracking-tight text-white"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {activeModal}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors"
                aria-label="Close dialog"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {activeModal === 'Pitch us an idea' && (
              <div className="space-y-4 text-sm text-neutral-300">
                <p>
                  We collaborate with ambitious teams shaping generative spatial interfaces, autonomous brand systems, and physical-digital installations.
                </p>
                <div className="p-3 bg-neutral-800/60 rounded-xl border border-neutral-700/50">
                  <span className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">Direct Inquiries</span>
                  <a
                    href="mailto:pitches@mainframe.co"
                    className="text-white hover:underline font-mono"
                  >
                    pitches@mainframe.co
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleCopyEmail();
                    setActiveModal(null);
                  }}
                  className="w-full py-2.5 px-4 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors"
                >
                  Copy Contact &amp; Reach Out
                </button>
              </div>
            )}

            {activeModal === 'Come work here' && (
              <div className="space-y-3 text-sm text-neutral-300">
                <p>Open studio positions for Spring 2026:</p>
                <div className="space-y-2">
                  <div className="p-3 bg-neutral-800/60 rounded-xl border border-neutral-700/40 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-white">Creative Technologist / GLSL</div>
                      <div className="text-xs text-neutral-400">Remote / Tokyo / San Francisco</div>
                    </div>
                    <span className="text-xs text-neutral-400">Full-time</span>
                  </div>
                  <div className="p-3 bg-neutral-800/60 rounded-xl border border-neutral-700/40 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-white">Interface Architect</div>
                      <div className="text-xs text-neutral-400">London / Hybrid</div>
                    </div>
                    <span className="text-xs text-neutral-400">Full-time</span>
                  </div>
                </div>
                <div className="pt-2">
                  <a
                    href="mailto:careers@mainframe.co"
                    className="block text-center py-2 px-4 border border-neutral-700 rounded-lg text-white hover:bg-neutral-800 transition-colors"
                  >
                    Inquire at careers@mainframe.co
                  </a>
                </div>
              </div>
            )}

            {activeModal === 'Send a brief hello' && (
              <div className="space-y-4 text-sm text-neutral-300">
                <p>
                  Whether it&apos;s a quick question, potential collaboration, or just shared curiosity about where design meets adaptive systems.
                </p>
                <div className="flex items-center gap-3 p-3 bg-neutral-800/60 rounded-xl border border-neutral-700/50">
                  <span className="text-xl">👋</span>
                  <div>
                    <div className="text-xs text-neutral-400">Studio Mailbox</div>
                    <div className="text-white font-mono">hello@mainframe.co</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleCopyEmail();
                    setActiveModal(null);
                  }}
                  className="w-full py-2.5 px-4 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors"
                >
                  Copy hello@mainframe.co
                </button>
              </div>
            )}

            {activeModal === 'See how we operate' && (
              <div className="space-y-3 text-sm text-neutral-300">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-neutral-800/50 rounded-lg border border-neutral-700/30">
                    <span className="font-medium text-white block mb-0.5">01. Direct R&amp;D</span>
                    Rapid functional prototyping over static decks.
                  </div>
                  <div className="p-2.5 bg-neutral-800/50 rounded-lg border border-neutral-700/30">
                    <span className="font-medium text-white block mb-0.5">02. Micro-Teams</span>
                    Senior craft practitioners only on core delivery.
                  </div>
                  <div className="p-2.5 bg-neutral-800/50 rounded-lg border border-neutral-700/30">
                    <span className="font-medium text-white block mb-0.5">03. Spatial Native</span>
                    Interactive shaders and responsive fluid canvases.
                  </div>
                  <div className="p-2.5 bg-neutral-800/50 rounded-lg border border-neutral-700/30">
                    <span className="font-medium text-white block mb-0.5">04. Scaled Impact</span>
                    Engineered for high-throughput global platforms.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-full mt-3 py-2 px-4 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                >
                  Close Overview
                </button>
              </div>
            )}

            {(activeModal === 'Labs' || activeModal === 'Studio' || activeModal === 'Openings' || activeModal === 'Shop' || activeModal === 'Get in touch') && (
              <div className="space-y-4 text-sm text-neutral-300">
                <p>
                  {activeModal === 'Labs' && 'Experimental software artifacts, WebGL experiments, and hardware interfaces in active development.'}
                  {activeModal === 'Studio' && 'Commercial commissions, identity architectures, and digital flagships built with international clients.'}
                  {activeModal === 'Openings' && 'We are currently reviewing applications for design engineers, technical directors, and brand researchers.'}
                  {activeModal === 'Shop' && 'Limited-edition physical prints, custom hardware monographs, and software design tokens.'}
                  {activeModal === 'Get in touch' && 'We are currently booking selective client commissions. Let us know what you are building.'}
                </p>
                <div className="p-3 bg-neutral-800/60 rounded-xl border border-neutral-700/50 flex justify-between items-center">
                  <span className="text-white font-mono">hello@mainframe.co</span>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="text-xs bg-white text-black px-2.5 py-1 rounded hover:bg-neutral-200 transition-colors"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
