import React from 'react';
import { useIntl, defineMessages, FormattedMessage } from 'react-intl';

import { openModal } from 'pl-fe/actions/modals';
import DropdownMenu from 'pl-fe/components/dropdown-menu';
import { Widget } from 'pl-fe/components/ui';
import InstanceRestrictions from 'pl-fe/features/federation-restrictions/components/instance-restrictions';
import { useAppSelector, useAppDispatch, useOwnAccount } from 'pl-fe/hooks';
import { makeGetRemoteInstance } from 'pl-fe/selectors';

const getRemoteInstance = makeGetRemoteInstance();

const messages = defineMessages({
  editFederation: { id: 'remote_instance.edit_federation', defaultMessage: 'Edit federation' },
});

interface IInstanceModerationPanel {
  /** Host (eg "gleasonator.com") of the remote instance to moderate. */
  host: string;
}

/** Widget for moderators to manage a remote instance. */
const InstanceModerationPanel: React.FC<IInstanceModerationPanel> = ({ host }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const { account } = useOwnAccount();
  const remoteInstance = useAppSelector(state => getRemoteInstance(state, host));

  const handleEditFederation = () => {
    dispatch(openModal('EDIT_FEDERATION', { host }));
  };

  const makeMenu = () => [{
    text: intl.formatMessage(messages.editFederation),
    action: handleEditFederation,
    icon: require('@tabler/icons/outline/edit.svg'),
  }];

  const menu = makeMenu();

  return (
    <Widget
      title={<FormattedMessage id='remote_instance.federation_panel.heading' defaultMessage='Federation Restrictions' />}
      action={account?.is_admin ? (
        <DropdownMenu items={menu} src={require('@tabler/icons/outline/dots-vertical.svg')} />
      ) : undefined}
    >
      <InstanceRestrictions remoteInstance={remoteInstance} />
    </Widget>
  );
};

export { InstanceModerationPanel as default };
