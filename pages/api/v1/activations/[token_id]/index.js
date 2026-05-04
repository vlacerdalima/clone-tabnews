import { createRouter } from "next-connect";
import controller from "infra/controller";
import activation from "models/activation";
import authorization from "models/authorization.js";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.patch(controller.canRequest("read:activation_token"), patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(request, response) {
  const activationTokenId = request.query.token_id;
  const userTryingToPatch = request.context.user;
  const validToken = await activation.findOneByValidToken(activationTokenId);

  await activation.activateUserByUserId(validToken.user_id);

  const usedActivationToken =
    await activation.markTokenAsUsed(activationTokenId);

  const secureOutputValues = authorization.filterOutput(
    userTryingToPatch,
    "read:activation_token",
    usedActivationToken,
  );

  return response.status(200).json(secureOutputValues);
}
