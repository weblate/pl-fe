import React from 'react';

import { useAppSelector } from 'pl-fe/hooks';

import { HStack, Icon, Stack, Text } from './ui';

const buildingCommunityIcon = require('@tabler/icons/outline/building-community.svg');
const homeIcon = require('@tabler/icons/outline/home-2.svg');
const mapPinIcon = require('@tabler/icons/outline/map-pin.svg');
const roadIcon = require('@tabler/icons/outline/road.svg');

const ADDRESS_ICONS: Record<string, string> = {
  house: homeIcon,
  street: roadIcon,
  secondary: roadIcon,
  zone: buildingCommunityIcon,
  city: buildingCommunityIcon,
  administrative: buildingCommunityIcon,
};

interface IAutosuggestLocation {
  id: string;
}

const AutosuggestLocation: React.FC<IAutosuggestLocation> = ({ id }) => {
  const location = useAppSelector((state) => state.locations.get(id));

  if (!location) return null;

  return (
    <HStack alignItems='center' space={2}>
      <Icon src={ADDRESS_ICONS[location.type] || mapPinIcon} />
      <Stack>
        <Text>{location.description}</Text>
        <Text size='xs' theme='muted'>{[location.street, location.locality, location.country].filter(val => val?.trim()).join(' · ')}</Text>
      </Stack>
    </HStack>
  );
};

export { ADDRESS_ICONS, AutosuggestLocation as default };
