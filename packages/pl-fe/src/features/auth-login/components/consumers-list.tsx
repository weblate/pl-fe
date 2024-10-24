import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Card, HStack, Stack, Text } from 'pl-fe/components/ui';
import { useInstance } from 'pl-fe/hooks';

import ConsumerButton from './consumer-button';

interface IConsumersList {
}

/** Displays OAuth consumers to log in with. */
const ConsumersList: React.FC<IConsumersList> = () => {
  const instance = useInstance();
  const providers = instance.pleroma.oauth_consumer_strategies;

  if (providers.length > 0) {
    return (
      <Card className='bg-gray-50 p-2 black:bg-black black:p-0 sm:rounded-xl dark:bg-primary-800'>
        <Stack space={2}>
          <Text size='xs' theme='muted'>
            <FormattedMessage id='oauth_consumers.title' defaultMessage='Other ways to sign in' />
          </Text>
          <HStack space={2}>
            {providers.map(provider => (
              <ConsumerButton provider={provider} />
            ))}
          </HStack>
        </Stack>
      </Card>
    );
  } else {
    return null;
  }
};

export { ConsumersList as default };
