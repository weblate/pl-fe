import { AppDispatch } from 'soapbox/store';

import type { ICryptoAddress } from 'soapbox/features/crypto-donate/components/crypto-address';
import type { ModalType } from 'soapbox/features/ui/components/modal-root';
import type { AccountModerationModalProps } from 'soapbox/features/ui/components/modals/account-moderation-modal/account-moderation-modal';
import type { BoostModalProps } from 'soapbox/features/ui/components/modals/boost-modal';
import type { CompareHistoryModalProps } from 'soapbox/features/ui/components/modals/compare-history-modal';
import type { ComponentModalProps } from 'soapbox/features/ui/components/modals/component-modal';
import type { ComposeModalProps } from 'soapbox/features/ui/components/modals/compose-modal';
import type { ConfirmationModalProps } from 'soapbox/features/ui/components/modals/confirmation-modal';
import type { DislikesModalProps } from 'soapbox/features/ui/components/modals/dislikes-modal';
import type { EditAnnouncementModalProps } from 'soapbox/features/ui/components/modals/edit-announcement-modal';
import type { EditBookmarkFolderModalProps } from 'soapbox/features/ui/components/modals/edit-bookmark-folder-modal';
import type { EditDomainModalProps } from 'soapbox/features/ui/components/modals/edit-domain-modal';
import type { EditFederationModalProps } from 'soapbox/features/ui/components/modals/edit-federation-modal';
import type { EditRuleModalProps } from 'soapbox/features/ui/components/modals/edit-rule-modal';
import type { EmbedModalProps } from 'soapbox/features/ui/components/modals/embed-modal';
import type { EventMapModalProps } from 'soapbox/features/ui/components/modals/event-map-modal';
import type { EventParticipantsModalProps } from 'soapbox/features/ui/components/modals/event-participants-modal';
import type { FamiliarFollowersModalProps } from 'soapbox/features/ui/components/modals/familiar-followers-modal';
import type { FavouritesModalProps } from 'soapbox/features/ui/components/modals/favourites-modal';
import type { JoinEventModalProps } from 'soapbox/features/ui/components/modals/join-event-modal';
import type { ListAdderModalProps } from 'soapbox/features/ui/components/modals/list-adder-modal';
import type { ListEditorModalProps } from 'soapbox/features/ui/components/modals/list-editor-modal';
import type { MediaModalProps } from 'soapbox/features/ui/components/modals/media-modal';
import type { MentionsModalProps } from 'soapbox/features/ui/components/modals/mentions-modal';
import type { MissingDescriptionModalProps } from 'soapbox/features/ui/components/modals/missing-description-modal';
import type { ReactionsModalProps } from 'soapbox/features/ui/components/modals/reactions-modal';
import type { ReblogsModalProps } from 'soapbox/features/ui/components/modals/reblogs-modal';
import type { ReplyMentionsModalProps } from 'soapbox/features/ui/components/modals/reply-mentions-modal';
import type { SelectBookmarkFolderModalProps } from 'soapbox/features/ui/components/modals/select-bookmark-folder-modal';
import type { TextFieldModalProps } from 'soapbox/features/ui/components/modals/text-field-modal';
import type { UnauthorizedModalProps } from 'soapbox/features/ui/components/modals/unauthorized-modal';
import type { VideoModalProps } from 'soapbox/features/ui/components/modals/video-modal';

const MODAL_OPEN = 'MODAL_OPEN' as const;
const MODAL_CLOSE = 'MODAL_CLOSE' as const;

type OpenModalProps =
  | [type: 'ACCOUNT_MODERATION', props: AccountModerationModalProps]
  | [type: 'BIRTHDAYS' | 'COMPOSE_EVENT' | 'CREATE_GROUP' | 'HOTKEYS' | 'REPORT']
  | [type: 'BOOST', props: BoostModalProps]
  | [type: 'COMPARE_HISTORY', props: CompareHistoryModalProps]
  | [type: 'COMPONENT', props: ComponentModalProps]
  | [type: 'COMPOSE', props?: ComposeModalProps]
  | [type: 'CONFIRM', props: ConfirmationModalProps]
  | [type: 'CRYPTO_DONATE', props: ICryptoAddress]
  | [type: 'DISLIKES', props: DislikesModalProps]
  | [type: 'EDIT_ANNOUNCEMENT', props?: EditAnnouncementModalProps]
  | [type: 'EDIT_BOOKMARK_FOLDER', props: EditBookmarkFolderModalProps]
  | [type: 'EDIT_DOMAIN', props?: EditDomainModalProps]
  | [type: 'EDIT_FEDERATION', props: EditFederationModalProps]
  | [type: 'EDIT_RULE', props?: EditRuleModalProps]
  | [type: 'EMBED', props: EmbedModalProps]
  | [type: 'EVENT_MAP', props: EventMapModalProps]
  | [type: 'EVENT_PARTICIPANTS', props: EventParticipantsModalProps]
  | [type: 'FAMILIAR_FOLLOWERS', props: FamiliarFollowersModalProps]
  | [type: 'FAVOURITES', props: FavouritesModalProps]
  | [type: 'JOIN_EVENT', props: JoinEventModalProps]
  | [type: 'LIST_ADDER', props: ListAdderModalProps]
  | [type: 'LIST_EDITOR', props: ListEditorModalProps]
  | [type: 'MEDIA', props: MediaModalProps]
  | [type: 'MENTIONS', props: MentionsModalProps]
  | [type: 'MISSING_DESCRIPTION', props: MissingDescriptionModalProps]
  | [type: 'MUTE']
  | [type: 'REACTIONS', props: ReactionsModalProps]
  | [type: 'REBLOGS', props: ReblogsModalProps]
  | [type: 'REPLY_MENTIONS', props: ReplyMentionsModalProps]
  | [type: 'SELECT_BOOKMARK_FOLDER', props: SelectBookmarkFolderModalProps]
  | [type: 'TEXT_FIELD', props: TextFieldModalProps]
  | [type: 'UNAUTHORIZED', props?: UnauthorizedModalProps]
  | [type: 'VIDEO', props: VideoModalProps];

/** Open a modal of the given type */
const openModal = (...[type, props]: OpenModalProps) => {
  // const [type, props] = args;
  return (dispatch: AppDispatch) => {
    dispatch(closeModal(type));
    dispatch(openModalSuccess(type, props));
  };
};

const openModalSuccess = (type: ModalType, props?: any) => ({
  type: MODAL_OPEN,
  modalType: type,
  modalProps: props,
});

/** Close the modal */
const closeModal = (type?: ModalType) => ({
  type: MODAL_CLOSE,
  modalType: type,
});

type ModalsAction =
  ReturnType<typeof openModalSuccess>
  | ReturnType<typeof closeModal>;

export {
  MODAL_OPEN,
  MODAL_CLOSE,
  openModal,
  closeModal,
  type ModalsAction,
};
