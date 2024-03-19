import { MAX_OTHER_LENGTH, ProfileData } from "src/components/Account/UserProfile";
import { withoutRole } from "src/lib/auth";
import prisma from "src/lib/prismadb";

const getSerializedProfile = (request: ProfileData) => {
  if (request.advocate.length > MAX_OTHER_LENGTH
      || request.diet.length > MAX_OTHER_LENGTH) {
    return null;
  }

  if (request.roles.find(r => r.length > MAX_OTHER_LENGTH)) {
    return null;
  }

  const serializedProfile = JSON.stringify({
    advocacyApproach: request.advocacyApproach,
    advocate: request.advocate,
    diet: request.diet,
    roles: request.roles,
  })

  return serializedProfile.length < 5000 ? serializedProfile : null;
}

/**
 * Updates the user's profile.
 */
const handler = withoutRole("banned", async (req, res, token) => {
  if (req.method === "GET") {
    const user = await prisma.user.findUnique({
      where: {
        id: token.sub,
      },
      select: {
        profileContent: true,
      },
    });


    try {
      const profileObj = user.profileContent
        ? JSON.parse(user.profileContent)
        : {};
      return res.status(200).json(profileObj);
    } catch {
      return res.status(200).json({});
    }
  }

  const request = req.body as ProfileData;
  const serializedProfile = getSerializedProfile(request);
  if (serializedProfile === null) {
    return res.status(422);
  }

  const user = await prisma.user.update({
    where: {
      id: token.sub,
    },
    data: {
      profileContent: serializedProfile,
    },
    select: {
      profileContent: true,
    },
  });

  return res.status(200).json(user.profileContent);
});

export default handler;
