import { instanceSchema } from 'pl-api';
import React from 'react';

import { render, screen } from 'pl-fe/jest/test-helpers';

import LoginPage from './login-page';

describe('<LoginPage />', () => {
  it('renders correctly on load', () => {
    const store = {
      instance: instanceSchema.parse({
        version: '2.7.2 (compatible; Pleroma 2.3.0)',
      }),
    };

    render(<LoginPage />, undefined, store);

    expect(screen.getByRole('heading')).toHaveTextContent('Sign In');
  });

  // it('renders the OTP form when logIn returns with mfa_required', () => {
  //
  //   stubApi(mock => {
  //     mock.onPost('/api/v1/apps').reply(200, {
  //       data: {
  //         client_id:'12345', client_secret:'12345', id:'111', name:'SoapboxFE', redirect_uri:'urn:ietf:wg:oauth:2.0:oob', website:null, vapid_key:'12345',
  //       },
  //     });
  //     mock.onPost('/oauth/token').reply(403, {
  //       error:'mfa_required', mfa_token:'12345', supported_challenge_types:'totp',
  //     });
  //   });
  //
  //   const app = new Map();
  //   app.set('app', { client_id: '12345', client_secret:'12345' });
  //   const store = mockStore(ImmutableMap({
  //     auth: { app },
  //   }));
  //   const loginPage = createComponent(<LoginPage />, { store });
  //
  //   return loginPage.handleSubmit().then(() => {
  //     const wrapper = loginPage.toJSON();
  //     expect(wrapper.children[0].children[0].children[0].children[0]).toEqual(expect.objectContaining({
  //       type: 'h1',
  //       props: { className: 'otp-login' },
  //       children: [ 'OTP Login' ],
  //     }));
  //   });
  //
  // });
});
