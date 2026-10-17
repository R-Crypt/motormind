/**
 * MotorMind brand + contact configuration.
 *
 * Every fact here was verified against MotorMind's own published website
 * (archived copies of motormind.in, 2016–2024). Keep contact details here
 * so components never hard-code them.
 *
 * NOTE: At the time this prototype was built (Oct 2026) the live
 * motormind.in domain was serving unrelated gambling-spam content to
 * crawlers and a blank page to browsers. Facts were therefore taken from
 * the Internet Archive. MotorMind should confirm before launch.
 */
export const brand = {
  name: 'MotorMind',
  legalName: 'Motormind Automotive Designs',
  tagline: 'Industrial design and prototyping company based out of Bangalore, India',
  founded: 2008,
  founder: 'Shahid Haq',
  city: 'Bengaluru',
  website: 'https://www.motormind.in',
  facebook: 'https://facebook.com/motormindindia',
  /** Verified: listed on motormind.in/contact */
  phoneDisplay: '+91 96 32 23 32 22',
  phoneE164: '+919632233222',
  email: 'info@motormind.in',
  address:
    '6/1A, 6/2 Byrathi Village, Bidarahalli Hobli, Off Hennur-Bagalur Main Road (Near Legacy School), Kothanur, Bengaluru, Karnataka 560077',
  /**
   * WhatsApp uses the published phone number. MotorMind has not confirmed
   * that this number is WhatsApp-enabled — replace if they use another line.
   */
  whatsappNumber: '919632233222',
  whatsappVerified: false,
} as const

/** Service lines exactly as named on MotorMind's services page. */
export const serviceLines = {
  bodyWrap: {
    name: 'Body Wrap',
    copy: 'Vinyl wraps change the appearance of your car without repainting it. They protect the surface and are removable if you want to restore the original look.',
  },
  bodykits: {
    name: 'Bodykits',
    copy: 'MotorMind designs and manufactures styling kits for production vehicles to enhance visual performance and add character.',
  },
  bodyshop: { name: 'Bodyshop', copy: 'Paint and body work carried out in-house.' },
  interior: {
    name: 'Interior',
    copy: 'Synthetic and pure leather, with panels wrapped in fabric or leather, or painted to complement the exterior.',
  },
  prototypes: {
    name: 'Prototypes',
    copy: 'A facility capable of building vehicle prototypes — from static-only models to performance-realistic versions.',
  },
  recreational: { name: 'Recreational Vehicle', copy: 'Recreational vehicle builds.' },
} as const

export type ServiceLineKey = keyof typeof serviceLines

export const disclaimers = {
  pricing:
    'All prices are illustrative demo figures in INR, not quotations. Final fitment, pricing and installation require confirmation from MotorMind after inspecting your vehicle.',
  visual:
    'Visualisation is an image-based approximation. Modifications shown do not guarantee mechanical compatibility, availability or road legality.',
  concept:
    'This configurator is a proposed concept for MotorMind. Individual parts shown are conceptual demo options unless marked otherwise.',
} as const
