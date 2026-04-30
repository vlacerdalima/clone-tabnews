import { createRouter } from "next-connect";
import controller from "infra/controller";
import activation from "models/activation";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.patch(controller.canRequest("read:activation_token"), patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(request, response) {
  const activationTokenId = request.query.token_id;
  const validToken = await activation.findOneByValidToken(activationTokenId);
  const usedActivationToken =
    await activation.markTokenAsUsed(activationTokenId);

  await activation.activateUserByUserId(validToken.user_id);

  return response.status(200).json(usedActivationToken);
}
