import clsx from 'clsx';
import React, { useEffect, useState, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { usePopper } from 'react-popper';
import { useHistory } from 'react-router-dom';

import { closeStatusHoverCard, updateStatusHoverCard } from 'pl-fe/actions/status-hover-card';
import { fetchStatus } from 'pl-fe/actions/statuses';
import StatusContainer from 'pl-fe/containers/status-container';
import { useAppSelector, useAppDispatch } from 'pl-fe/hooks';

import { showStatusHoverCard } from './hover-status-wrapper';
import { Card, CardBody } from './ui';

interface IStatusHoverCard {
  visible?: boolean;
}

/** Popup status preview that appears when hovering reply to */
const StatusHoverCard: React.FC<IStatusHoverCard> = ({ visible = true }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const history = useHistory();

  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);

  const statusId: string | undefined = useAppSelector(state => state.status_hover_card.statusId || undefined);
  const status = useAppSelector(state => state.statuses.get(statusId!));
  const targetRef = useAppSelector(state => state.status_hover_card.ref?.current);

  useEffect(() => {
    if (statusId && !status) {
      dispatch(fetchStatus(statusId, intl));
    }
  }, [statusId, status]);

  useEffect(() => {
    const unlisten = history.listen(() => {
      showStatusHoverCard.cancel();
      dispatch(closeStatusHoverCard());
    });

    return () => {
      unlisten();
    };
  }, []);

  const { styles, attributes } = usePopper(targetRef, popperElement, {
    placement: 'top',
  });

  const handleMouseEnter = useCallback((): React.MouseEventHandler => () => {
    dispatch(updateStatusHoverCard());
  }, []);

  const handleMouseLeave = useCallback((): React.MouseEventHandler => () => {
    dispatch(closeStatusHoverCard(true));
  }, []);

  if (!statusId) return null;

  const renderStatus = (statusId: string) => (
    // @ts-ignore
    <StatusContainer
      key={statusId}
      id={statusId}
      hoverable={false}
      hideActionBar
      muted
    />
  );

  return (
    <div
      className={clsx({
        'absolute transition-opacity w-[500px] z-50 top-0 left-0': true,
        'opacity-100': visible,
        'opacity-0 pointer-events-none': !visible,
      })}
      ref={setPopperElement}
      style={styles.popper}
      {...attributes.popper}
      onMouseEnter={handleMouseEnter()}
      onMouseLeave={handleMouseLeave()}
    >
      <Card className='relative black:rounded-xl black:border black:border-gray-800'>
        <CardBody>
          {renderStatus(statusId)}
        </CardBody>
      </Card>
    </div>
  );
};

export { StatusHoverCard as default };
