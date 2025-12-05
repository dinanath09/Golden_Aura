// // src/components/SmartImage.jsx
// import React, { useState } from "react";

// /**
//  * props:
//  * - src: image url
//  * - alt: alt text
//  * - className: applied to <img> (use "fade-img" typically)
//  * - containerClass: applied to wrapper (use "img-figure", "product-thumb", etc)
//  * - placeholder: optional small image or color (data-uri or url)
//  * - style, width, height, loading, decoding
//  */
// export default function SmartImage({
//   src,
//   alt = "",
//   className = "fade-img",
//   containerClass = "img-figure",
//   placeholder = null,
//   style = {},
//   loading = "lazy",
//   decoding = "async",
//   ...rest
// }) {
//   const [loaded, setLoaded] = useState(false);
//   const [failed, setFailed] = useState(false);

//   // choose fallback placeholder background (if provided) else keep background-color from CSS
//   const placeholderStyle = placeholder ? { backgroundImage: `url(${placeholder})` } : {};

//   return (
//     <div className={`${containerClass} ${loaded ? "loaded" : ""}`} style={{ position: "relative", ...style }}>
//       {/* optional background placeholder element */}
//       <span className="img-placeholder" style={placeholderStyle} aria-hidden="true" />

//       <img
//         src={failed ? "/placeholder.png" : src}
//         alt={alt}
//         className={`${className} ${loaded ? "loaded" : ""}`}
//         loading={loading}
//         decoding={decoding}
//         onLoad={() => setLoaded(true)}
//         onError={(e) => { setFailed(true); setLoaded(true); /* ensure placeholder hides */ }}
//         {...rest}
//       />
//     </div>
//   );
// }
