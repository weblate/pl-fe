import React, { useEffect } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';

import { deleteList, fetchList } from 'pl-fe/actions/lists';
import { openModal } from 'pl-fe/actions/modals';
import { fetchListTimeline } from 'pl-fe/actions/timelines';
import { useListStream } from 'pl-fe/api/hooks';
import DropdownMenu from 'pl-fe/components/dropdown-menu';
import MissingIndicator from 'pl-fe/components/missing-indicator';
import { Column, Button, Spinner } from 'pl-fe/components/ui';
import { useAppDispatch, useAppSelector, useTheme } from 'pl-fe/hooks';
import { useIsMobile } from 'pl-fe/hooks/useIsMobile';

import Timeline from '../ui/components/timeline';

const messages = defineMessages({
  deleteHeading: { id: 'confirmations.delete_list.heading', defaultMessage: 'Delete list' },
  deleteMessage: { id: 'confirmations.delete_list.message', defaultMessage: 'Are you sure you want to permanently delete this list?' },
  deleteConfirm: { id: 'confirmations.delete_list.confirm', defaultMessage: 'Delete' },
  editList: { id: 'lists.edit', defaultMessage: 'Edit list' },
  deleteList: { id: 'lists.delete', defaultMessage: 'Delete list' },
});

const ListTimeline: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMobile = useIsMobile();

  const list = useAppSelector((state) => state.lists.get(id));

  useListStream(id);

  useEffect(() => {
    dispatch(fetchList(id));
    dispatch(fetchListTimeline(id));
  }, [id]);

  const handleLoadMore = () => {
    dispatch(fetchListTimeline(id, true));
  };

  const handleEditClick = () => {
    dispatch(openModal('LIST_EDITOR', { listId: id }));
  };

  const handleDeleteClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();

    dispatch(openModal('CONFIRM', {
      heading: intl.formatMessage(messages.deleteHeading),
      message: intl.formatMessage(messages.deleteMessage),
      confirm: intl.formatMessage(messages.deleteConfirm),
      onConfirm: () => {
        dispatch(deleteList(id));
      },
    }));
  };

  const title = list ? list.title : id;

  if (typeof list === 'undefined') {
    return (
      <Column>
        <div>
          <Spinner />
        </div>
      </Column>
    );
  } else if (list === false) {
    return (
      <MissingIndicator />
    );
  }

  const emptyMessage = (
    <div>
      <FormattedMessage id='empty_column.list' defaultMessage='There is nothing in this list yet. When members of this list create new posts, they will appear here.' />
      <br /><br />
      <Button onClick={handleEditClick}><FormattedMessage id='list.click_to_add' defaultMessage='Click here to add people' /></Button>
    </div>
  );

  const items = [
    {
      text: intl.formatMessage(messages.editList),
      action: handleEditClick,
      icon: require('@tabler/icons/outline/edit.svg'),
    },
    {
      text: intl.formatMessage(messages.deleteList),
      action: handleDeleteClick,
      icon: require('@tabler/icons/outline/trash.svg'),
    },
  ];

  return (
    <Column
      label={title}
      action={<DropdownMenu items={items} src={require('@tabler/icons/outline/dots-vertical.svg')} />}
      transparent={!isMobile}
    >
      <Timeline
        className='black:p-0 black:sm:p-4'
        loadMoreClassName='black:sm:mx-4'
        scrollKey='list_timeline'
        timelineId={`list:${id}`}
        onLoadMore={handleLoadMore}
        emptyMessage={emptyMessage}
        divideType={(theme === 'black' || isMobile) ? 'border' : 'space'}
      />
    </Column>
  );
};

export { ListTimeline as default };