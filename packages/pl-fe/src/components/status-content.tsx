import clsx from 'clsx';
import parse, { Element, type HTMLReactParserOptions, domToReact, type DOMNode } from 'html-react-parser';
import React, { useState, useRef, useLayoutEffect, useMemo } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { toggleStatusSpoilerExpanded } from 'pl-fe/actions/statuses';
import Icon from 'pl-fe/components/icon';
import { Button, Stack, Text } from 'pl-fe/components/ui';
import { useAppDispatch, useSettings } from 'pl-fe/hooks';
import { onlyEmoji as isOnlyEmoji } from 'pl-fe/utils/rich-content';

import { getTextDirection } from '../utils/rtl';

import HashtagLink from './hashtag-link';
import HoverRefWrapper from './hover-ref-wrapper';
import Markup from './markup';
import Poll from './polls/poll';

import type { Sizes } from 'pl-fe/components/ui/text/text';
import type { MinifiedStatus } from 'pl-fe/reducers/statuses';

const MAX_HEIGHT = 322; // 20px * 16 (+ 2px padding at the top)
const BIG_EMOJI_LIMIT = 10;

const messages = defineMessages({
  collapse: { id: 'status.spoiler.collapse', defaultMessage: 'Collapse' },
  expand: { id: 'status.spoiler.expand', defaultMessage: 'Expand' },
});

interface IReadMoreButton {
  onClick: React.MouseEventHandler;
}

/** Button to expand a truncated status (due to too much content) */
const ReadMoreButton: React.FC<IReadMoreButton> = ({ onClick }) => (
  <div className='relative'>
    <div className='absolute -top-16 h-16 w-full bg-gradient-to-b from-transparent to-white black:to-black dark:to-primary-900' />
    <button className='flex items-center border-0 bg-transparent p-0 pt-2 text-gray-900 hover:underline active:underline dark:text-gray-300' onClick={onClick}>
      <FormattedMessage id='status.read_more' defaultMessage='Read more' />
      <Icon className='inline-block h-5 w-5' src={require('@tabler/icons/outline/chevron-right.svg')} />
    </button>
  </div>
);

interface IStatusContent {
  status: MinifiedStatus;
  onClick?: () => void;
  collapsable?: boolean;
  translatable?: boolean;
  textSize?: Sizes;
}

/** Renders the text content of a status */
const StatusContent: React.FC<IStatusContent> = React.memo(({
  status,
  onClick,
  collapsable = false,
  translatable,
  textSize = 'md',
}) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { displaySpoilers } = useSettings();

  const [collapsed, setCollapsed] = useState(false);
  const [onlyEmoji, setOnlyEmoji] = useState(false);

  const node = useRef<HTMLDivElement>(null);

  const maybeSetCollapsed = (): void => {
    if (!node.current) return;

    if (collapsable && !collapsed) {
      if (node.current.clientHeight > MAX_HEIGHT) {
        setCollapsed(true);
      }
    }
  };

  const maybeSetOnlyEmoji = (): void => {
    if (!node.current) return;
    const only = isOnlyEmoji(node.current, BIG_EMOJI_LIMIT, true);

    if (only !== onlyEmoji) {
      setOnlyEmoji(only);
    }
  };

  const toggleExpanded: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(toggleStatusSpoilerExpanded(status));
  };

  useLayoutEffect(() => {
    maybeSetCollapsed();
    maybeSetOnlyEmoji();
  });

  const parsedHtml = useMemo(
    (): string => translatable && status.translation
      ? status.translation.content!
      : (status.contentMapHtml && status.currentLanguage)
        ? (status.contentMapHtml[status.currentLanguage] || status.contentHtml)
        : status.contentHtml,
    [status.contentHtml, status.translation, status.currentLanguage],
  );

  if (status.content.length === 0) {
    return null;
  }

  const withSpoiler = status.spoiler_text.length > 0;

  const baseClassName = 'text-gray-900 dark:text-gray-100 break-words text-ellipsis overflow-hidden relative focus:outline-none';

  const options: HTMLReactParserOptions = {
    replace(domNode) {
      if (domNode instanceof Element && ['script', 'iframe'].includes(domNode.name)) {
        return null;
      }

      if (domNode instanceof Element && domNode.name === 'a') {
        const classes = domNode.attribs.class?.split(' ');

        if (classes?.includes('mention')) {
          const mention = status.mentions.find(({ url }) => domNode.attribs.href === url);
          if (mention) {
            return (
              <HoverRefWrapper accountId={mention.id} inline>
                <Link
                  to={`/@${mention.acct}`}
                  className='text-primary-600 hover:underline dark:text-accent-blue'
                  dir='ltr'
                  onClick={(e) => e.stopPropagation()}
                >
                  @{mention.username}
                </Link>
              </HoverRefWrapper>
            );
          }
        }

        if (classes?.includes('hashtag')) {
          const child = domToReact(domNode.children as DOMNode[]);
          const hashtag = typeof child === 'string' ? child.replace(/^#/, '') : undefined;
          if (hashtag) {
            return <HashtagLink hashtag={hashtag} />;
          }
        }

        return (
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions
          <a
            {...domNode.attribs}
            onClick={(e) => e.stopPropagation()}
            rel='nofollow noopener'
            target='_blank'
            title={domNode.attribs.href}
          >
            {domToReact(domNode.children as DOMNode[], options)}
          </a>
        );
      }
    },
  };

  const spoilerText = status.spoilerMapHtml && status.currentLanguage
    ? status.spoilerMapHtml[status.currentLanguage] || status.spoilerHtml
    : status.spoilerHtml;

  const content = parse(parsedHtml, options);

  const direction = getTextDirection(status.search_index);
  const className = clsx(baseClassName, {
    'cursor-pointer': onClick,
    'whitespace-normal': withSpoiler,
    'max-h-[200px]': collapsed,
    'leading-normal big-emoji': onlyEmoji,
  });

  const expandable = !displaySpoilers;
  const expanded = !withSpoiler || status.expanded || false;

  const output = [];

  if (spoilerText) {
    output.push(
      <Text key='spoiler' size='2xl' weight='medium'>
        <span dangerouslySetInnerHTML={{ __html: spoilerText }} />
        {expandable && (
          <Button
            className='ml-2 align-middle'
            type='button'
            theme='muted'
            size='xs'
            onClick={toggleExpanded}
            icon={expanded ? require('@tabler/icons/outline/chevron-up.svg') : require('@tabler/icons/outline/chevron-down.svg')}
          >
            {intl.formatMessage(expanded ? messages.collapse : messages.expand)}
          </Button>
        )}
      </Text>,
    );
  }

  if (expandable && !expanded) return <>{output}</>;

  if (onClick) {
    output.push(
      <Markup
        ref={node}
        tabIndex={0}
        key='content'
        className={className}
        direction={direction}
        lang={status.language || undefined}
        size={textSize}
      >
        {content}
      </Markup>,
    );

    if (collapsed) {
      output.push(<ReadMoreButton onClick={onClick} key='read-more' />);
    }

    let hasPoll = false;

    if (status.poll_id) {
      hasPoll = true;
      output.push(<Poll id={status.poll_id} key='poll' status={status} />);
    }

    return <Stack space={4} className={clsx({ 'bg-gray-100 dark:bg-primary-800 rounded-md p-4': hasPoll })}>{output}</Stack>;
  } else {
    output.push(
      <Markup
        ref={node}
        tabIndex={0}
        key='content'
        className={clsx(baseClassName, {
          'leading-normal big-emoji': onlyEmoji,
        })}
        direction={direction}
        lang={status.language || undefined}
        size={textSize}
      >
        {content}
      </Markup>,
    );

    if (status.poll_id) {
      output.push(<Poll id={status.poll_id} key='poll' status={status} />);
    }

    return <>{output}</>;
  }
});

export { StatusContent as default };