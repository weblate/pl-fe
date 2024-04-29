import clsx from 'clsx';
import React, { forwardRef } from 'react';

const justifyContentOptions = {
  between: 'justify-between',
  center: 'justify-center',
  start: 'justify-start',
  end: 'justify-end',
  around: 'justify-around',
};

const alignItemsOptions = {
  top: 'items-start',
  bottom: 'items-end',
  center: 'items-center',
  start: 'items-start',
  stretch: 'items-stretch',
};

const spaces = {
  0: 'gap-x-0',
  [0.5]: 'gap-x-0.5',
  1: 'gap-x-1',
  1.5: 'gap-x-1.5',
  2: 'gap-x-2',
  2.5: 'gap-x-2.5',
  3: 'gap-x-3',
  4: 'gap-x-4',
  5: 'gap-x-5',
  6: 'gap-x-6',
  8: 'gap-x-8',
};

interface IHStack extends Pick<React.HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'onClick' | 'style' | 'title'> {
  /** Vertical alignment of children. */
  alignItems?: keyof typeof alignItemsOptions;
  /** Horizontal alignment of children. */
  justifyContent?: keyof typeof justifyContentOptions;
  /** Size of the gap between elements. */
  space?: keyof typeof spaces;
  /** Whether to let the flexbox grow. */
  grow?: boolean;
  /** HTML element to use for container. */
  element?: keyof JSX.IntrinsicElements;
  /** Whether to let the flexbox wrap onto multiple lines. */
  wrap?: boolean;
}

/** Horizontal row of child elements. */
const HStack = forwardRef<HTMLDivElement, IHStack>((props, ref) => {
  const { space, alignItems, justifyContent, className, grow, element = 'div', wrap, ...filteredProps } = props;

  const Elem = element as 'div';

  return (
    <Elem
      {...filteredProps}
      ref={ref}
      className={clsx('flex', {
        // @ts-ignore
        [alignItemsOptions[alignItems]]: typeof alignItems !== 'undefined',
        // @ts-ignore
        [justifyContentOptions[justifyContent]]: typeof justifyContent !== 'undefined',
        // @ts-ignore
        [spaces[space]]: typeof space !== 'undefined',
        'grow': grow,
        'flex-wrap': wrap,
      }, className)}
    />
  );
});

export default HStack;
