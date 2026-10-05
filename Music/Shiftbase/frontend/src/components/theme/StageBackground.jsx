import React from 'react';

/**
 * StageBackground Component
 * Renders the wide (desktop) and narrow (mobile) ambient motion backgrounds
 * with hardware-accelerated poster fallbacks and overlay gradients.
 */
export default function StageBackground() {
  const widePoster = "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/5c3ec08f-2dbf-4c0a-8588-f6106a789443.webp";
  const wideVideo = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_125226_45cb4f38-aa7e-47e1-885d-ae0b69745369.mp4";

  const narrowPoster = "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/0f4926a4-e660-4df2-9195-2bfb3e341bdd.webp";
  const narrowVideo = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_125242_daae1570-386d-4bd5-8896-80499e2371e0.mp4";

  return (
    <>
      {/* Desktop / Wide Screen Video Background */}
      <video
        className="stage-motion stage-motion--wide"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={widePoster}
        aria-hidden="true"
      >
        <source src={wideVideo} type="video/mp4" />
      </video>

      {/* Mobile / Narrow Screen Video Background */}
      <video
        className="stage-motion stage-motion--narrow"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster={narrowPoster}
        aria-hidden="true"
      >
        <source src={narrowVideo} type="video/mp4" />
      </video>

      {/* Stage Color Blend Gradient Overlay */}
      <div className="stage-overlay" aria-hidden="true" />
    </>
  );
}
