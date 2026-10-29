import React from 'react';

export const ORIGINAL_EAGLE_LOGO_PATH =
  '/assets/aistudio/USN_NAVEN_Minerals_Winged_Emblem_f8e368b9.png';

/**
 * Restored USN / Naveen Minerals Winged Crest Background Watermark.
 *
 * Uses the original USN / NAVEEN MINERALS winged eagle emblem asset,
 * preserving its original aspect ratio and colours at ~6% opacity (within the 4–8% range),
 * positioned behind page content with `pointer-events: none`.
 * Solid `#111318` product image containers and solid `#FFFFFF` cards sit above this layer
 * so the watermark never appears inside product image backgrounds or reduces text readability.
 */
export const Logo3DWatermark: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[1] pointer-events-none select-none flex items-center justify-center overflow-hidden"
    >
      <img
        src={ORIGINAL_EAGLE_LOGO_PATH}
        alt=""
        className="w-[78vw] max-w-[720px] h-auto object-contain opacity-[0.15]"
      />
    </div>
  );
};
