import { bookmarkFolderSchema } from 'pl-api';

import { Entities } from 'pl-fe/entity-store/entities';
import { useCreateEntity } from 'pl-fe/entity-store/hooks';
import { useClient } from 'pl-fe/hooks';

interface UpdateBookmarkFolderParams {
  name: string;
  emoji?: string;
}

const useUpdateBookmarkFolder = (folderId: string) => {
  const client = useClient();

  const { createEntity, ...rest } = useCreateEntity(
    [Entities.BOOKMARK_FOLDERS],
    (params: UpdateBookmarkFolderParams) =>
      client.myAccount.updateBookmarkFolder(folderId, params),
    { schema: bookmarkFolderSchema },
  );

  return {
    updateBookmarkFolder: createEntity,
    ...rest,
  };
};

export { useUpdateBookmarkFolder };