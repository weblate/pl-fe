import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { usePopper } from 'react-popper';
import { useHistory } from 'react-router-dom';

import { fetchRelationships } from 'pl-fe/actions/accounts';
import { closeProfileHoverCard, updateProfileHoverCard } from 'pl-fe/actions/profile-hover-card';
import { useAccount } from 'pl-fe/api/hooks';
import Badge from 'pl-fe/components/badge';
import ActionButton from 'pl-fe/features/ui/components/action-button';
import { UserPanel } from 'pl-fe/features/ui/util/async-components';
import { useAppSelector, useAppDispatch } from 'pl-fe/hooks';

import { showProfileHoverCard } from './hover-ref-wrapper';
import { dateFormatOptions } from './relative-timestamp';
import Scrobble from './scrobble';
import { Card, CardBody, HStack, Icon, Stack, Text } from './ui';

import type { Account } from 'pl-fe/normalizers';
import type { AppDispatch } from 'pl-fe/store';

const getBadges = (
  account?: Pick<Account, 'is_admin' | 'is_moderator'>,
): JSX.Element[] => {
  const badges = [];

  if (account?.is_admin) {
    badges.push(<Badge key='admin' slug='admin' title={<FormattedMessage id='account_moderation_modal.roles.admin' defaultMessage='Admin' />} />);
  } else if (account?.is_moderator) {
    badges.push(<Badge key='moderator' slug='moderator' title={<FormattedMessage id='account_moderation_modal.roles.moderator' defaultMessage='Moderator' />} />);
  }

  return badges;
};

const handleMouseEnter = (dispatch: AppDispatch): React.MouseEventHandler => () => {
  dispatch(updateProfileHoverCard());
};

const handleMouseLeave = (dispatch: AppDispatch): React.MouseEventHandler => () => {
  dispatch(closeProfileHoverCard(true));
};

interface IProfileHoverCard {
  visible?: boolean;
}

/** Popup profile preview that appears when hovering avatars and display names. */
const ProfileHoverCard: React.FC<IProfileHoverCard> = ({ visible = true }) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const intl = useIntl();

  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);

  const me = useAppSelector(state => state.me);
  const accountId: string | undefined = useAppSelector(state => state.profile_hover_card.accountId || undefined);
  const { account } = useAccount(accountId, { withRelationship: true, withScrobble: true });
  const targetRef = useAppSelector(state => state.profile_hover_card.ref?.current);
  const badges = getBadges(account);

  useEffect(() => {
    if (accountId) dispatch(fetchRelationships([accountId]));
  }, [dispatch, accountId]);

  useEffect(() => {
    const unlisten = history.listen(() => {
      showProfileHoverCard.cancel();
      dispatch(closeProfileHoverCard());
    });

    return () => {
      unlisten();
    };
  }, []);

  const { styles, attributes } = usePopper(targetRef, popperElement);

  if (!account) return null;
  const accountBio = { __html: account.note_emojified };
  const memberSinceDate = intl.formatDate(account.created_at, { month: 'long', year: 'numeric' });
  const followedBy = me !== account.id && account.relationship?.followed_by === true;

  return (
    <div
      className={clsx({
        'absolute transition-opacity w-[320px] z-[101] top-0 left-0': true,
        'opacity-100': visible,
        'opacity-0 pointer-events-none': !visible,
      })}
      ref={setPopperElement}
      style={styles.popper}
      {...attributes.popper}
      onMouseEnter={handleMouseEnter(dispatch)}
      onMouseLeave={handleMouseLeave(dispatch)}
    >
      <Card variant='rounded' className='relative isolate overflow-hidden black:rounded-xl black:border black:border-gray-800'>
        <CardBody>
          <Stack space={2}>
            <UserPanel
              accountId={account.id}
              action={<ActionButton account={account} small />}
              badges={badges}
            />

            {account.local ? (
              <HStack alignItems='center' space={0.5}>
                <Icon
                  src={require('@tabler/icons/outline/calendar.svg')}
                  className='h-4 w-4 text-gray-800 dark:text-gray-200'
                />

                <Text size='sm' title={intl.formatDate(account.created_at, dateFormatOptions)}>
                  <FormattedMessage
                    id='account.member_since' defaultMessage='Joined {date}' values={{
                      date: memberSinceDate,
                    }}
                  />
                </Text>
              </HStack>
            ) : null}

            {!!account.scrobble && (
              <Scrobble scrobble={account.scrobble} />
            )}

            {account.note.length > 0 && (
              <Text
                truncate
                size='sm'
                dangerouslySetInnerHTML={accountBio}
                className='mr-2 rtl:ml-2 rtl:mr-0 [&_br]:hidden [&_p:first-child]:inline [&_p:first-child]:truncate [&_p]:hidden'
              />
            )}
          </Stack>

          {followedBy && (
            <div className='absolute left-2 top-2'>
              <Badge
                slug='opaque'
                title={<FormattedMessage id='account.follows_you' defaultMessage='Follows you' />}
              />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export { ProfileHoverCard as default };
