import { Entities } from 'pl-fe/entity-store/entities';
import { isLoggedIn } from 'pl-fe/utils/auth';

import { getClient } from '../api';

import type { PaginatedResponse } from 'pl-api';
import type { EntityStore } from 'pl-fe/entity-store/types';
import type { Account } from 'pl-fe/normalizers';
import type { AppDispatch, RootState } from 'pl-fe/store';

const DOMAIN_BLOCK_REQUEST = 'DOMAIN_BLOCK_REQUEST' as const;
const DOMAIN_BLOCK_SUCCESS = 'DOMAIN_BLOCK_SUCCESS' as const;
const DOMAIN_BLOCK_FAIL = 'DOMAIN_BLOCK_FAIL' as const;

const DOMAIN_UNBLOCK_REQUEST = 'DOMAIN_UNBLOCK_REQUEST' as const;
const DOMAIN_UNBLOCK_SUCCESS = 'DOMAIN_UNBLOCK_SUCCESS' as const;
const DOMAIN_UNBLOCK_FAIL = 'DOMAIN_UNBLOCK_FAIL' as const;

const DOMAIN_BLOCKS_FETCH_REQUEST = 'DOMAIN_BLOCKS_FETCH_REQUEST' as const;
const DOMAIN_BLOCKS_FETCH_SUCCESS = 'DOMAIN_BLOCKS_FETCH_SUCCESS' as const;
const DOMAIN_BLOCKS_FETCH_FAIL = 'DOMAIN_BLOCKS_FETCH_FAIL' as const;

const DOMAIN_BLOCKS_EXPAND_REQUEST = 'DOMAIN_BLOCKS_EXPAND_REQUEST' as const;
const DOMAIN_BLOCKS_EXPAND_SUCCESS = 'DOMAIN_BLOCKS_EXPAND_SUCCESS' as const;
const DOMAIN_BLOCKS_EXPAND_FAIL = 'DOMAIN_BLOCKS_EXPAND_FAIL' as const;

const blockDomain = (domain: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(blockDomainRequest(domain));

    return getClient(getState).filtering.blockDomain(domain).then(() => {
      const accounts = selectAccountsByDomain(getState(), domain);
      if (!accounts) return;
      dispatch(blockDomainSuccess(domain, accounts));
    }).catch(err => {
      dispatch(blockDomainFail(domain, err));
    });
  };

const blockDomainRequest = (domain: string) => ({
  type: DOMAIN_BLOCK_REQUEST,
  domain,
});

const blockDomainSuccess = (domain: string, accounts: string[]) => ({
  type: DOMAIN_BLOCK_SUCCESS,
  domain,
  accounts,
});

const blockDomainFail = (domain: string, error: unknown) => ({
  type: DOMAIN_BLOCK_FAIL,
  domain,
  error,
});

const unblockDomain = (domain: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(unblockDomainRequest(domain));

    return getClient(getState).filtering.unblockDomain(domain).then(() => {
      const accounts = selectAccountsByDomain(getState(), domain);
      if (!accounts) return;
      dispatch(unblockDomainSuccess(domain, accounts));
    }).catch(err => {
      dispatch(unblockDomainFail(domain, err));
    });
  };

const unblockDomainRequest = (domain: string) => ({
  type: DOMAIN_UNBLOCK_REQUEST,
  domain,
});

const unblockDomainSuccess = (domain: string, accounts: string[]) => ({
  type: DOMAIN_UNBLOCK_SUCCESS,
  domain,
  accounts,
});

const unblockDomainFail = (domain: string, error: unknown) => ({
  type: DOMAIN_UNBLOCK_FAIL,
  domain,
  error,
});

const fetchDomainBlocks = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(fetchDomainBlocksRequest());

    return getClient(getState).filtering.getDomainBlocks().then(response => {
      dispatch(fetchDomainBlocksSuccess(response.items, response.next));
    }).catch(err => {
      dispatch(fetchDomainBlocksFail(err));
    });
  };

const fetchDomainBlocksRequest = () => ({
  type: DOMAIN_BLOCKS_FETCH_REQUEST,
});

const fetchDomainBlocksSuccess = (domains: string[], next: (() => Promise<PaginatedResponse<string>>) | null) => ({
  type: DOMAIN_BLOCKS_FETCH_SUCCESS,
  domains,
  next,
});

const fetchDomainBlocksFail = (error: unknown) => ({
  type: DOMAIN_BLOCKS_FETCH_FAIL,
  error,
});

const expandDomainBlocks = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    const next = getState().domain_lists.blocks.next;

    if (!next) return;

    dispatch(expandDomainBlocksRequest());

    next().then(response => {
      dispatch(expandDomainBlocksSuccess(response.items, response.next));
    }).catch(err => {
      dispatch(expandDomainBlocksFail(err));
    });
  };

const selectAccountsByDomain = (state: RootState, domain: string): string[] => {
  const store = state.entities[Entities.ACCOUNTS]?.store as EntityStore<Account> | undefined;
  const entries = store ? Object.entries(store) : undefined;
  const accounts = entries
    ?.filter(([_, item]) => item && item.acct.endsWith(`@${domain}`))
    .map(([_, item]) => item!.id);
  return accounts || [];
};

const expandDomainBlocksRequest = () => ({
  type: DOMAIN_BLOCKS_EXPAND_REQUEST,
});

const expandDomainBlocksSuccess = (domains: string[], next: (() => Promise<PaginatedResponse<string>>) | null) => ({
  type: DOMAIN_BLOCKS_EXPAND_SUCCESS,
  domains,
  next,
});

const expandDomainBlocksFail = (error: unknown) => ({
  type: DOMAIN_BLOCKS_EXPAND_FAIL,
  error,
});

type DomainBlocksAction =
  ReturnType<typeof blockDomainRequest>
  | ReturnType<typeof blockDomainSuccess>
  | ReturnType<typeof blockDomainFail>
  | ReturnType<typeof unblockDomainRequest>
  | ReturnType<typeof unblockDomainSuccess>
  | ReturnType<typeof unblockDomainFail>
  | ReturnType<typeof fetchDomainBlocksRequest>
  | ReturnType<typeof fetchDomainBlocksSuccess>
  | ReturnType<typeof fetchDomainBlocksFail>
  | ReturnType<typeof expandDomainBlocksRequest>
  | ReturnType<typeof expandDomainBlocksSuccess>
  | ReturnType<typeof expandDomainBlocksFail>;

export {
  DOMAIN_BLOCK_REQUEST,
  DOMAIN_BLOCK_SUCCESS,
  DOMAIN_BLOCK_FAIL,
  DOMAIN_UNBLOCK_REQUEST,
  DOMAIN_UNBLOCK_SUCCESS,
  DOMAIN_UNBLOCK_FAIL,
  DOMAIN_BLOCKS_FETCH_REQUEST,
  DOMAIN_BLOCKS_FETCH_SUCCESS,
  DOMAIN_BLOCKS_FETCH_FAIL,
  DOMAIN_BLOCKS_EXPAND_REQUEST,
  DOMAIN_BLOCKS_EXPAND_SUCCESS,
  DOMAIN_BLOCKS_EXPAND_FAIL,
  blockDomain,
  blockDomainRequest,
  blockDomainSuccess,
  blockDomainFail,
  unblockDomain,
  unblockDomainRequest,
  unblockDomainSuccess,
  unblockDomainFail,
  fetchDomainBlocks,
  fetchDomainBlocksRequest,
  fetchDomainBlocksSuccess,
  fetchDomainBlocksFail,
  expandDomainBlocks,
  expandDomainBlocksRequest,
  expandDomainBlocksSuccess,
  expandDomainBlocksFail,
  type DomainBlocksAction,
};
