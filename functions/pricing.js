export async function onRequest({ request }) {
  const c = (request.cf?.country || '').toUpperCase();

  let data = {                                       // 預設 US
    disprice: '限時66折優惠：US$249',
    oriprice: '<s>$380</s>',
    link: '/checkout/fbo_us.html'
  };

  switch (c) {
    case 'TW':
      data = { disprice:'限時66折優惠：NT$6,988',
               oriprice:'<s>$10,600</s>',
               link:'/checkout/fbo_tw.html' }; break;
    case 'HK':
    case 'MO':
      data = { disprice:'限時66折優惠：HK$1,988',
               oriprice:'<s>$3,000</s>',
               link:`/checkout/fbo_${c.toLowerCase()}.html` }; break;
    case 'MY':
      data = { disprice:'限時66折優惠：MYR$998',
               oriprice:'<s>$1,515</s>',
               link:'/checkout/fbo_my.html' }; break;
    case 'SG':
      data = { disprice:'限時66折優惠：SGD$329',
               oriprice:'<s>$500</s>',
               link:'/checkout/fbo_sg.html' }; break;
  }

  return new Response(JSON.stringify(data), {
    headers: { 'content-type':'application/json;charset=utf-8' }
  });
}
