export const folder = (userId: string) => ({
  profile: `./uploads/private/user/${userId}/profile`,
  collection: `./uploads/private/user/${userId}/collection`,
  clothes: `./uploads/private/user/${userId}/clothes`,
});
