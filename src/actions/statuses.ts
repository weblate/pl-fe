import { isLoggedIn } from 'soapbox/utils/auth';
import { getFeatures } from 'soapbox/utils/features';
import { shouldHaveCard } from 'soapbox/utils/status';

import { getClient } from '../api';

import { setComposeToStatus } from './compose';
import { importFetchedStatus, importFetchedStatuses } from './importer';
import { openModal } from './modals';
import { getSettings } from './settings';
import { deleteFromTimelines } from './timelines';

import type { CreateStatusParams } from 'pl-api';
import type { IntlShape } from 'react-intl';
import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity, Status } from 'soapbox/types/entities';

const STATUS_CREATE_REQUEST = 'STATUS_CREATE_REQUEST';
const STATUS_CREATE_SUCCESS = 'STATUS_CREATE_SUCCESS';
const STATUS_CREATE_FAIL = 'STATUS_CREATE_FAIL';

const STATUS_FETCH_SOURCE_REQUEST = 'STATUS_FETCH_SOURCE_REQUEST';
const STATUS_FETCH_SOURCE_SUCCESS = 'STATUS_FETCH_SOURCE_SUCCESS';
const STATUS_FETCH_SOURCE_FAIL = 'STATUS_FETCH_SOURCE_FAIL';

const STATUS_FETCH_REQUEST = 'STATUS_FETCH_REQUEST';
const STATUS_FETCH_SUCCESS = 'STATUS_FETCH_SUCCESS';
const STATUS_FETCH_FAIL = 'STATUS_FETCH_FAIL';

const STATUS_DELETE_REQUEST = 'STATUS_DELETE_REQUEST';
const STATUS_DELETE_SUCCESS = 'STATUS_DELETE_SUCCESS';
const STATUS_DELETE_FAIL = 'STATUS_DELETE_FAIL';

const CONTEXT_FETCH_REQUEST = 'CONTEXT_FETCH_REQUEST';
const CONTEXT_FETCH_SUCCESS = 'CONTEXT_FETCH_SUCCESS';
const CONTEXT_FETCH_FAIL = 'CONTEXT_FETCH_FAIL';

const STATUS_MUTE_REQUEST = 'STATUS_MUTE_REQUEST';
const STATUS_MUTE_SUCCESS = 'STATUS_MUTE_SUCCESS';
const STATUS_MUTE_FAIL = 'STATUS_MUTE_FAIL';

const STATUS_UNMUTE_REQUEST = 'STATUS_UNMUTE_REQUEST';
const STATUS_UNMUTE_SUCCESS = 'STATUS_UNMUTE_SUCCESS';
const STATUS_UNMUTE_FAIL = 'STATUS_UNMUTE_FAIL';

const STATUS_REVEAL = 'STATUS_REVEAL';
const STATUS_HIDE = 'STATUS_HIDE';

const STATUS_TRANSLATE_REQUEST = 'STATUS_TRANSLATE_REQUEST';
const STATUS_TRANSLATE_SUCCESS = 'STATUS_TRANSLATE_SUCCESS';
const STATUS_TRANSLATE_FAIL = 'STATUS_TRANSLATE_FAIL';
const STATUS_TRANSLATE_UNDO = 'STATUS_TRANSLATE_UNDO';

const STATUS_UNFILTER = 'STATUS_UNFILTER';

const STATUS_LANGUAGE_CHANGE = 'STATUS_LANGUAGE_CHANGE';

const statusExists = (getState: () => RootState, statusId: string) =>
  (getState().statuses.get(statusId) || null) !== null;

const createStatus = (params: CreateStatusParams, idempotencyKey: string, statusId: string | null) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: STATUS_CREATE_REQUEST, params, idempotencyKey, editing: !!statusId });

    return (statusId === null ? getClient(getState()).statuses.createStatus(params) : getClient(getState()).statuses.editStatus(statusId, params))
      .then((status) => {
        // The backend might still be processing the rich media attachment
        const expectsCard = !status.card && shouldHaveCard(status);

        dispatch(importFetchedStatus({ ...status, expectsCard }, idempotencyKey));
        dispatch({ type: STATUS_CREATE_SUCCESS, status, params, idempotencyKey, editing: !!statusId });

        // Poll the backend for the updated card
        if (expectsCard) {
          const delay = 1000;

          const poll = (retries = 5) => {
            return getClient(getState()).statuses.getStatus(status.id).then(response => {
              if (response.card) {
                dispatch(importFetchedStatus(response));
              } else if (retries > 0 && response) {
                setTimeout(() => poll(retries - 1), delay);
              }
            }).catch(console.error);
          };

          setTimeout(() => poll(), delay);
        }

        return status;
      }).catch(error => {
        dispatch({ type: STATUS_CREATE_FAIL, error, params, idempotencyKey, editing: !!statusId });
        throw error;
      });
  };

const editStatus = (id: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  let status = getState().statuses.get(id)!;

  if (status.poll) {
    status = status.set('poll', getState().polls.get(status.poll) as any);
  }

  dispatch({ type: STATUS_FETCH_SOURCE_REQUEST });

  return getClient(getState()).statuses.getStatusSource(id).then(response => {
    dispatch({ type: STATUS_FETCH_SOURCE_SUCCESS });
    dispatch(setComposeToStatus(status, response.text, response.spoiler_text, response.content_type, false));
    dispatch(openModal('COMPOSE'));
  }).catch(error => {
    dispatch({ type: STATUS_FETCH_SOURCE_FAIL, error });

  });
};

const fetchStatus = (id: string, intl?: IntlShape) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const skipLoading = statusExists(getState, id);

    dispatch({ type: STATUS_FETCH_REQUEST, id, skipLoading });

    const params = intl && getSettings(getState()).get('autoTranslate') ? {
      language: intl.locale,
    } : undefined;

    return getClient(getState()).statuses.getStatus(id, params).then(status => {
      dispatch(importFetchedStatus(status));
      dispatch({ type: STATUS_FETCH_SUCCESS, status, skipLoading });
      return status;
    }).catch(error => {
      dispatch({ type: STATUS_FETCH_FAIL, id, error, skipLoading, skipAlert: true });
    });
  };

const deleteStatus = (id: string, withRedraft = false) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    let status = getState().statuses.get(id)!;

    if (status.poll) {
      status = status.set('poll', getState().polls.get(status.poll) as any);
    }

    dispatch({ type: STATUS_DELETE_REQUEST, params: status });

    return getClient(getState()).statuses.deleteStatus(id).then(response => {
      dispatch({ type: STATUS_DELETE_SUCCESS, id });
      dispatch(deleteFromTimelines(id));

      if (withRedraft) {
        dispatch(setComposeToStatus(status, response.text || '', response.spoiler_text, response.content_type, withRedraft));
        dispatch(openModal('COMPOSE'));
      }
    })
      .catch(error => {
        dispatch({ type: STATUS_DELETE_FAIL, params: status, error });
      });
  };

const updateStatus = (status: APIEntity) => (dispatch: AppDispatch) =>
  dispatch(importFetchedStatus(status));

const fetchContext = (id: string, intl?: IntlShape) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: CONTEXT_FETCH_REQUEST, id });

    const params = intl && getSettings(getState()).get('autoTranslate') ? {
      language: intl.locale,
    } : undefined;

    return getClient(getState()).statuses.getContext(id, params).then(context => {
      if (Array.isArray(context)) {
        // Mitra: returns a list of statuses
        dispatch(importFetchedStatuses(context));
      } else if (typeof context === 'object') {
        // Standard Mastodon API returns a map with `ancestors` and `descendants`
        const { ancestors, descendants } = context;
        const statuses = ancestors.concat(descendants);
        dispatch(importFetchedStatuses(statuses));
        dispatch({ type: CONTEXT_FETCH_SUCCESS, id, ancestors, descendants });
      } else {
        throw context;
      }
      return context;
    }).catch(error => {
      if (error.response?.status === 404) {
        dispatch(deleteFromTimelines(id));
      }

      dispatch({ type: CONTEXT_FETCH_FAIL, id, error, skipAlert: true });
    });
  };

const fetchStatusWithContext = (id: string, intl?: IntlShape) =>
  async (dispatch: AppDispatch) => Promise.all([
    dispatch(fetchContext(id, intl)),
    dispatch(fetchStatus(id, intl)),
  ]);

const muteStatus = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch({ type: STATUS_MUTE_REQUEST, id });
    return getClient(getState()).statuses.muteStatus(id).then(() => {
      dispatch({ type: STATUS_MUTE_SUCCESS, id });
    }).catch(error => {
      dispatch({ type: STATUS_MUTE_FAIL, id, error });
    });
  };

const unmuteStatus = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch({ type: STATUS_UNMUTE_REQUEST, id });
    return getClient(getState()).statuses.unmuteStatus(id).then(() => {
      dispatch({ type: STATUS_UNMUTE_SUCCESS, id });
    }).catch(error => {
      dispatch({ type: STATUS_UNMUTE_FAIL, id, error });
    });
  };

const toggleMuteStatus = (status: Status) =>
  (dispatch: AppDispatch) => {
    if (status.muted) {
      dispatch(unmuteStatus(status.id));
    } else {
      dispatch(muteStatus(status.id));
    }
  };

const hideStatus = (ids: string[] | string) => {
  if (!Array.isArray(ids)) {
    ids = [ids];
  }

  return {
    type: STATUS_HIDE,
    ids,
  };
};

const revealStatus = (ids: string[] | string) => {
  if (!Array.isArray(ids)) {
    ids = [ids];
  }

  return {
    type: STATUS_REVEAL,
    ids,
  };
};

const toggleStatusHidden = (status: Status) => {
  if (status.hidden) {
    return revealStatus(status.id);
  } else {
    return hideStatus(status.id);
  }
};

let TRANSLATIONS_QUEUE: Set<string> = new Set();
let TRANSLATIONS_TIMEOUT: NodeJS.Timeout | null = null;

const translateStatus = (id: string, targetLanguage?: string, lazy?: boolean) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const features = getFeatures(getState().instance);

    dispatch({ type: STATUS_TRANSLATE_REQUEST, id });

    const handleTranslateMany = () => {
      const copy = [...TRANSLATIONS_QUEUE];
      TRANSLATIONS_QUEUE = new Set();
      if (TRANSLATIONS_TIMEOUT) clearTimeout(TRANSLATIONS_TIMEOUT);

      getClient(getState).request('/api/v1/pl/statuses/translate', {
        method: 'POST', body: { ids: copy, lang: targetLanguage },
      }).then((response) => {
        response.json.forEach((translation: APIEntity) => {
          dispatch({
            type: STATUS_TRANSLATE_SUCCESS,
            id: translation.id,
            translation: translation,
          });

          copy
            .filter((statusId) => !response.json.some(({ id }: APIEntity) => id === statusId))
            .forEach((id) => dispatch({
              type: STATUS_TRANSLATE_FAIL,
              id,
            }));
        });
      }).catch(error => {
        dispatch({
          type: STATUS_TRANSLATE_FAIL,
          id,
          error,
        });
      });
    };

    if (features.lazyTranslations && lazy) {
      TRANSLATIONS_QUEUE.add(id);

      if (TRANSLATIONS_TIMEOUT) clearTimeout(TRANSLATIONS_TIMEOUT);
      TRANSLATIONS_TIMEOUT = setTimeout(() => handleTranslateMany(), 3000);
    } else if (features.lazyTranslations && TRANSLATIONS_QUEUE.size) {
      TRANSLATIONS_QUEUE.add(id);

      handleTranslateMany();
    } else {
      return getClient(getState()).statuses.translateStatus(id, targetLanguage).then(response => {
        dispatch({
          type: STATUS_TRANSLATE_SUCCESS,
          id,
          translation: response,
        });
      }).catch(error => {
        dispatch({
          type: STATUS_TRANSLATE_FAIL,
          id,
          error,
        });
      });
    }
  };

const undoStatusTranslation = (id: string) => ({
  type: STATUS_TRANSLATE_UNDO,
  id,
});

const unfilterStatus = (id: string) => ({
  type: STATUS_UNFILTER,
  id,
});

const changeStatusLanguage = (id: string, language: string) => ({
  type: STATUS_LANGUAGE_CHANGE,
  id,
  language,
});

export {
  STATUS_CREATE_REQUEST,
  STATUS_CREATE_SUCCESS,
  STATUS_CREATE_FAIL,
  STATUS_FETCH_SOURCE_REQUEST,
  STATUS_FETCH_SOURCE_SUCCESS,
  STATUS_FETCH_SOURCE_FAIL,
  STATUS_FETCH_REQUEST,
  STATUS_FETCH_SUCCESS,
  STATUS_FETCH_FAIL,
  STATUS_DELETE_REQUEST,
  STATUS_DELETE_SUCCESS,
  STATUS_DELETE_FAIL,
  CONTEXT_FETCH_REQUEST,
  CONTEXT_FETCH_SUCCESS,
  CONTEXT_FETCH_FAIL,
  STATUS_MUTE_REQUEST,
  STATUS_MUTE_SUCCESS,
  STATUS_MUTE_FAIL,
  STATUS_UNMUTE_REQUEST,
  STATUS_UNMUTE_SUCCESS,
  STATUS_UNMUTE_FAIL,
  STATUS_REVEAL,
  STATUS_HIDE,
  STATUS_TRANSLATE_REQUEST,
  STATUS_TRANSLATE_SUCCESS,
  STATUS_TRANSLATE_FAIL,
  STATUS_TRANSLATE_UNDO,
  STATUS_UNFILTER,
  STATUS_LANGUAGE_CHANGE,
  createStatus,
  editStatus,
  fetchStatus,
  deleteStatus,
  updateStatus,
  fetchContext,
  fetchStatusWithContext,
  muteStatus,
  unmuteStatus,
  toggleMuteStatus,
  hideStatus,
  revealStatus,
  toggleStatusHidden,
  translateStatus,
  undoStatusTranslation,
  unfilterStatus,
  changeStatusLanguage,
};
