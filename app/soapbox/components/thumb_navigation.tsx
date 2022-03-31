import React from 'react';
import { FormattedMessage } from 'react-intl';

import ThumbNavigationLink from 'soapbox/components/thumb_navigation-link';
import { useAppSelector, useOwnAccount } from 'soapbox/hooks';
import { getFeatures } from 'soapbox/utils/features';

const ThumbNavigation: React.FC = (): JSX.Element => {
  const account = useOwnAccount();
  const notificationCount = useAppSelector((state) => state.notifications.unread);
  const chatsCount = useAppSelector((state) => state.chats.get('items').reduce((acc: number, curr: any) => acc + Math.min(curr.get('unread', 0), 1), 0));
  // const dashboardCount = useAppSelector((state) => state.admin.openReports.count() + state.admin.awaitingApproval.count());
  const features = getFeatures(useAppSelector((state) => state.instance));

  return (
    <div className='thumb-navigation'>
      <ThumbNavigationLink
        src={require('icons/feed.svg')}
        text={<FormattedMessage id='navigation.home' defaultMessage='Home' />}
        to='/'
        exact
      />

      <ThumbNavigationLink
        src={require('@tabler/icons/icons/search.svg')}
        text={<FormattedMessage id='navigation.search' defaultMessage='Search' />}
        to='/search'
        exact
      />

      {account && (
        <ThumbNavigationLink
          src={require('@tabler/icons/icons/bell.svg')}
          text={<FormattedMessage id='navigation.notifications' defaultMessage='Alerts' />}
          to='/notifications'
          exact
          count={notificationCount}
        />
      )}

      {account && (
        features.chats ? (
          <ThumbNavigationLink
            src={require('@tabler/icons/icons/messages.svg')}
            text={<FormattedMessage id='navigation.chats' defaultMessage='Chats' />}
            to='/chats'
            exact
            count={chatsCount}
          />
        ) : (
          <ThumbNavigationLink
            src={require('@tabler/icons/icons/mail.svg')}
            text={<FormattedMessage id='navigation.direct_messages' defaultMessage='Messages' />}
            to='/messages'
            paths={['/messages', '/conversations']}
          />
        )
      )} 

      {/* (account && isStaff(account)) && (
        <ThumbNavigationLink
          src={require('@tabler/icons/icons/dashboard.svg')}
          text={<FormattedMessage id='navigation.dashboard' defaultMessage='Dashboard' />}
          to='/admin'
          count={dashboardCount}
        />
      ) */}
    </div>
  );
};

export default ThumbNavigation;
