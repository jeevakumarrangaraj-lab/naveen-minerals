import React from 'react';

export const SEOStructuredData: React.FC = () => {
  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://naveenminerals.in/#organization',
        name: 'Naveen Minerals',
        url: 'https://naveenminerals.in',
        logo: 'https://naveenminerals.in/assets/aistudio/USN_NAVEN_Minerals_Winged_Emblem_f8e368b9.png',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+91-8884852888',
          contactType: 'sales and customer service',
          email: 'usnnaveen@gmail.com',
          areaServed: 'IN',
          availableLanguage: ['English', 'Tamil', 'Hindi']
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: '4/47, Kadakalpudar, Veeasanam',
          addressLocality: 'Namakkal',
          addressRegion: 'Tamil Nadu',
          postalCode: '637405',
          addressCountry: 'IN'
        }
      },
      {
        '@type': 'LocalBusiness',
        '@id': 'https://naveenminerals.in/#localbusiness',
        name: 'Naveen Minerals',
        url: 'https://naveenminerals.in',
        image: 'https://naveenminerals.in/assets/aistudio/USN_NAVEN_Minerals_Winged_Emblem_f8e368b9.png',
        telephone: '+91-8884852888',
        email: 'usnnaveen@gmail.com',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '4/47, Kadakalpudar, Veeasanam',
          addressLocality: 'Namakkal',
          addressRegion: 'Tamil Nadu',
          postalCode: '637405',
          addressCountry: 'IN'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: '11.2223',
          longitude: '78.1678'
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
          ],
          opens: '09:00',
          closes: '19:00'
        },
        priceRange: '$$'
      },
      {
        '@type': 'WebSite',
        '@id': 'https://naveenminerals.in/#website',
        url: 'https://naveenminerals.in',
        name: 'Naveen Minerals',
        publisher: {
          '@id': 'https://naveenminerals.in/#organization'
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};
