import { createRouter } from "next-connect";
import controller from "infra/controller";
import activation from "models/activation";
import { act } from "react";

const router = createRouter();
router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(request, response) {
  const activationTokenId = request.query.token_id;
  const validToken = await activation.findOneByValidToken(activationTokenId);
  const usedActivationToken =
    await activation.markTokenAsUsed(activationTokenId);

  await activation.activateUserByUserId(validToken.user_id);

  return response.status(200).json(usedActivationToken);
}
