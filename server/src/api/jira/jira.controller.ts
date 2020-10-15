import { RouteHandlerFnc } from '../../types/customTypes';
import { jiraApi } from '../../utils/jiraclient';

export const getBoards: RouteHandlerFnc = async (ctx, _) => {
  const boards = await jiraApi.getAllBoards();
  ctx.body = boards.values.map((board: any) => {
    return {
      id: board.id,
      name: board.name,
    };
  });
};
