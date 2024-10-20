import React from 'react';

import { render, screen } from 'pl-fe/jest/test-helpers';

import Badge from './badge';

describe('<Badge />', () => {
  it('renders correctly', () => {
    render(<Badge slug='patron' title='Patron' />);

    expect(screen.getByTestId('badge')).toHaveTextContent('Patron');
  });
});
