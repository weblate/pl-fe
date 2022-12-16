import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Avatar, HStack, Icon, Stack, Text } from './ui';

import type { Group as GroupEntity } from 'soapbox/types/entities';

const messages = defineMessages({
  groupHeader: { id: 'group.header.alt', defaultMessage: 'Group header' },
});

interface IGroupCard {
  group: GroupEntity
}

const GroupCard: React.FC<IGroupCard> = ({ group }) => {
  const intl = useIntl();

  return (
    <div className='overflow-hidden'>
      <Stack className='bg-white dark:bg-primary-900 border border-solid border-gray-300 dark:border-primary-800 rounded-lg sm:rounded-xl'>
        <div className='bg-primary-100 dark:bg-gray-800 h-[120px] relative -m-[1px] mb-0 rounded-t-lg sm:rounded-t-xl'>
          {group.header && <img className='h-full w-full object-cover rounded-t-lg sm:rounded-t-xl' src={group.header} alt={intl.formatMessage(messages.groupHeader)} />}
          <div className='absolute left-1/2 -translate-x-1/2 -translate-y-1/2'>
            <Avatar className='ring-2 ring-white dark:ring-primary-900' src={group.avatar} size={64} />
          </div>
        </div>
        <Stack className='p-3 pt-9' alignItems='center' space={3}>
          <Text size='lg' weight='bold' dangerouslySetInnerHTML={{ __html: group.display_name_html }} />
          <HStack className='text-gray-700 dark:text-gray-600' space={3} wrap>
            {group.relationship?.role === 'admin' ? (
              <HStack space={1} alignItems='center'>
                <Icon className='h-4 w-4' src={require('@tabler/icons/users.svg')} />
                <span>Owner</span>
              </HStack>
            ) : group.relationship?.role === 'moderator' && (
              <HStack space={1} alignItems='center'>
                <Icon className='h-4 w-4' src={require('@tabler/icons/gavel.svg')} />
                <span>Moderator</span>
              </HStack>
            )}
            {group.locked ? (
              <HStack space={1} alignItems='center'>
                <Icon className='h-4 w-4' src={require('@tabler/icons/lock.svg')} />
                <span>Private</span>
              </HStack>
            ) : (
              <HStack space={1} alignItems='center'>
                <Icon className='h-4 w-4' src={require('@tabler/icons/world.svg')} />
                <span>Public</span>
              </HStack>
            )}
          </HStack>
        </Stack>
      </Stack>
    </div>
  );
};

export default GroupCard;
