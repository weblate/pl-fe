import { Entities } from 'pl-fe/entity-store/entities';
import { useDeleteEntity } from 'pl-fe/entity-store/hooks';
import { useClient } from 'pl-fe/hooks';

const useDeleteBookmarkFolder = () => {
  const client = useClient();

  const { deleteEntity, isSubmitting } = useDeleteEntity(
    Entities.BOOKMARK_FOLDERS,
    (folderId: string) => client.myAccount.deleteBookmarkFolder(folderId),
  );

  return {
    deleteBookmarkFolder: deleteEntity,
    isSubmitting,
  };
};

export { useDeleteBookmarkFolder };
