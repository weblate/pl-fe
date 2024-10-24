import React from 'react';

import { render, screen, rootState } from 'pl-fe/jest/test-helpers';
import { normalizeStatus, normalizeAccount } from 'pl-fe/normalizers';

import QuotedStatus from './quoted-status';

import type { ReducerStatus } from 'pl-fe/reducers/statuses';

describe('<QuotedStatus />', () => {
  it('renders content', () => {
    const account = normalizeAccount({
      id: '1',
      acct: 'alex',
      url: 'https://soapbox.test/users/alex',
    });

    const status = normalizeStatus({
      id: '1',
      account,
      content: 'hello world',
      contentHtml: 'hello world',
    }) as ReducerStatus;

    const state = rootState.setIn(['accounts', '1'], account);

    render(<QuotedStatus status={status} />, undefined, state);
    screen.getByText(/hello world/i);
    expect(screen.getByTestId('quoted-status')).toHaveTextContent(/hello world/i);
  });
});
