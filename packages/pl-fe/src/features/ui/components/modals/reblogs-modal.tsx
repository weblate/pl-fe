import React, { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { fetchReblogs, expandReblogs } from 'pl-fe/actions/interactions';
import { fetchStatus } from 'pl-fe/actions/statuses';
import ScrollableList from 'pl-fe/components/scrollable-list';
import { Modal, Spinner } from 'pl-fe/components/ui';
import AccountContainer from 'pl-fe/containers/account-container';
import { useAppDispatch, useAppSelector } from 'pl-fe/hooks';

import type { BaseModalProps } from '../modal-root';

interface ReblogsModalProps {
  statusId: string;
}

const ReblogsModal: React.FC<BaseModalProps & ReblogsModalProps> = ({ onClose, statusId }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const accountIds = useAppSelector((state) => state.user_lists.reblogged_by.get(statusId)?.items);
  const next = useAppSelector((state) => state.user_lists.reblogged_by.get(statusId)?.next);

  const fetchData = () => {
    dispatch(fetchReblogs(statusId));
    dispatch(fetchStatus(statusId, intl));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onClickClose = () => {
    onClose('REBLOGS');
  };

  const handleLoadMore = () => {
    if (next) {
      dispatch(expandReblogs(statusId, next!));
    }
  };

  let body;

  if (!accountIds) {
    body = <Spinner />;
  } else {
    const emptyMessage = <FormattedMessage id='status.reblogs.empty' defaultMessage='No one has reposted this post yet. When someone does, they will show up here.' />;

    body = (
      <ScrollableList
        scrollKey='reblogs'
        emptyMessage={emptyMessage}
        listClassName='max-w-full'
        itemClassName='pb-3'
        style={{ height: 'calc(80vh - 88px)' }}
        useWindowScroll={false}
        onLoadMore={handleLoadMore}
        hasMore={!!next}
      >
        {accountIds.map((id) =>
          <AccountContainer key={id} id={id} />,
        )}
      </ScrollableList>
    );
  }

  return (
    <Modal
      title={<FormattedMessage id='column.reblogs' defaultMessage='Reposts' />}
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export { ReblogsModal as default, type ReblogsModalProps };
