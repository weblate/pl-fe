import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchPublicTimeline } from 'soapbox/actions/timelines';
import { useCommunityStream } from 'soapbox/api/hooks';
import PullToRefresh from 'soapbox/components/pull-to-refresh';
import { Column } from 'soapbox/components/ui';
import { useAppDispatch, useInstance, useTheme } from 'soapbox/hooks';
import { useIsMobile } from 'soapbox/hooks/useIsMobile';

import AboutPage from '../about';
import Timeline from '../ui/components/timeline';

import { SiteBanner } from './components/site-banner';

const LandingTimeline = () => {
  const dispatch = useAppDispatch();
  const instance = useInstance();
  const theme = useTheme();
  const isMobile = useIsMobile();

  const timelineEnabled = !instance.pleroma.metadata.restrict_unauthenticated.timelines.local;

  const timelineId = 'public:local';

  const handleLoadMore = () => {
    dispatch(fetchPublicTimeline({ local: true }, true));
  };

  const handleRefresh = () => {
    return dispatch(fetchPublicTimeline({ local: true }));
  };

  useCommunityStream({ enabled: timelineEnabled });

  useEffect(() => {
    if (timelineEnabled) {
      dispatch(fetchPublicTimeline({ local: true }));
    }
  }, []);

  return (
    <Column transparent={!isMobile} withHeader={false}>
      <div className='my-12 mb-16 px-4 sm:mb-20'>
        <SiteBanner />
      </div>

      {timelineEnabled ? (
        <PullToRefresh onRefresh={handleRefresh}>
          <Timeline
            className='black:p-0 black:sm:p-4'
            loadMoreClassName='black:sm:mx-4'
            scrollKey={`${timelineId}_timeline`}
            timelineId={timelineId}
            prefix='home'
            onLoadMore={handleLoadMore}
            emptyMessage={<FormattedMessage id='empty_column.community' defaultMessage='The local timeline is empty. Write something publicly to get the ball rolling!' />}
            divideType={(theme === 'black' || isMobile) ? 'border' : 'space'}
          />
        </PullToRefresh>
      ) : (
        <AboutPage />
      )}
    </Column>
  );
};

export { LandingTimeline as default };
