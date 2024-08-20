import { useInfiniteQuery } from '@tanstack/react-query';
import { PaginatedResponse, type Account as BaseAccount } from 'pl-api';

import { Entities } from 'soapbox/entity-store/entities';
import { useClient } from 'soapbox/hooks';
import { type Account, normalizeAccount } from 'soapbox/normalizers';
import { flattenPages } from 'soapbox/utils/queries';

import { useRelationships } from './useRelationships';

import type { EntityFn } from 'soapbox/entity-store/hooks/types';

interface useAccountListOpts {
  enabled?: boolean;
}

const useAccountList = (listKey: string[], entityFn: EntityFn<void>, opts: useAccountListOpts = {}) => {
  const getAccounts = async (pageParam?: Pick<PaginatedResponse<BaseAccount>, 'next'>) => {
    const response = await (pageParam?.next ? pageParam.next() : entityFn()) as PaginatedResponse<BaseAccount>;

    return {
      ...response,
      items: response.items.map(normalizeAccount),
    };
  };

  const queryInfo = useInfiniteQuery({
    queryKey: [Entities.ACCOUNTS, ...listKey],
    queryFn: ({ pageParam }) => getAccounts(pageParam),
    enabled: true,
    initialPageParam: { next: null as (() => Promise<PaginatedResponse<BaseAccount>>) | null },
    getNextPageParam: (config) => config.next ? config : undefined,
  });

  const data = flattenPages<Account>(queryInfo.data as any)?.toReversed() || [];

  const { relationships } = useRelationships(
    listKey,
    data.map(({ id }) => id),
  );

  const accounts = data.map((account) => ({
    ...account,
    relationship: relationships[account.id],
  }));

  return { accounts, ...queryInfo };
};

const useBlocks = () => {
  const client = useClient();
  return useAccountList(['blocks'], () => client.filtering.getBlocks());
};

const useMutes = () => {
  const client = useClient();
  return useAccountList(['mutes'], () => client.filtering.getMutes());
};

const useFollowing = (accountId: string | undefined) => {
  const client = useClient();

  return useAccountList(
    [accountId!, 'following'],
    () => client.accounts.getAccountFollowing(accountId!),
    { enabled: !!accountId },
  );
};

const useFollowers = (accountId: string | undefined) => {
  const client = useClient();

  return useAccountList(
    [accountId!, 'followers'],
    () => client.accounts.getAccountFollowers(accountId!),
    { enabled: !!accountId },
  );
};

export {
  useAccountList,
  useBlocks,
  useMutes,
  useFollowing,
  useFollowers,
};
