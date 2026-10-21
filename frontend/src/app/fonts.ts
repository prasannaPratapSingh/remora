import localFont from 'next/font/local';

export const cooperBt = localFont({
  src: [
    {
      path: '../../public/fonts/CooperLtBT_Regular-s.p.6c756b87.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/CooperLtBT_Italic-s.p.7832886f.ttf',
      weight: '400',
      style: 'italic',
    },
  ],
  variable: '--font-cooper-local',
  display: 'swap',
});
