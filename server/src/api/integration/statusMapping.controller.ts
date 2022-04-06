import { RouteHandlerFnc } from '../../types/customTypes';
import Integration from './integration.model';
import StatusMapping from './statusMapping.model';

export const setStatusMapping: RouteHandlerFnc = async (ctx) => {
  const { id, fromColumn, toStatus, ...others } = ctx.request.body;
  if (Object.keys(others).length) {
    ctx.status = 400;
    return;
  }
  const integrationId = Number(ctx.params.integrationId);
  const roadmapId = Number(ctx.params.roadmapId);
  const integration = await Integration.query()
    .findById(integrationId)
    .where({ roadmapId, name: ctx.params.integrationName });
  if (!integration) {
    ctx.status = 404;
    return;
  }
  const updated = await StatusMapping.query()
    .insert({
      integrationId,
      fromColumn,
      toStatus,
    })
    .onConflict(['integrationId', 'fromColumn'])
    .merge();
  ctx.status = updated ? 200 : 404;
};

export const deleteStatusMapping: RouteHandlerFnc = async (ctx) => {
  const mappingId = Number(ctx.params.mappingId);
  const roadmapId = Number(ctx.params.roadmapId);
  const ok = await StatusMapping.transaction(async (trx) => {
    const mapping = await StatusMapping.query(trx).findById(mappingId);
    if (!mapping) return false;
    const integration = await Integration.query(trx)
      .findById(mapping.integrationId)
      .where({ roadmapId, name: ctx.params.integrationName });
    if (!integration) return false;
    return (await mapping.$query().delete()) === 1;
  });
  ctx.status = ok ? 200 : 404;
};
