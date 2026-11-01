import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::gallery.gallery', ({ strapi }) => ({
  
  async findOne(ctx) {
    const { id } = ctx.params;
    console.log("🔍 API 请求 ID:", id);

    const entity = await strapi.entityService.findOne('api::gallery.gallery', id, {
      populate: '*',
    });

    if (!entity) {
      console.log("❌ 没找到数据");
      return ctx.notFound();
    }

    return entity;
  },

}));
