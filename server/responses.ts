import { ObjectId } from "mongodb";
import { Gathering, User } from "./app";
// import { AlreadyFriendsError, FriendNotFoundError, FriendRequestAlreadyExistsError, FriendRequestDoc, FriendRequestNotFoundError } from "./concepts/friend";
import { GatheringAuthorNotMatchError, GatheringDoc, GatheringUneditableError, GroupAlreadyInGatheringError, MemberAlreadyInGatheringError, TooManyMembersInGatheringError } from "./concepts/gathering";
import { PostAuthorNotMatchError, PostDoc } from "./concepts/post";
import { UserDoc } from "./concepts/user";
import { Router } from "./framework/router";

/**
 * This class does useful conversions for the frontend.
 * For example, it converts a {@link PostDoc} into a more readable format for the frontend.
 */
export default class Responses {
  /**
   * Convert PostDoc and GatheringDoc into more readable format for the frontend by converting the author id into a username.
   */
  static async post(post: PostDoc | null) {
    if (!post) {
      return post;
    }
    const author = await User.getUserById(post.author);
    return { ...post, author: author.username };
  }
  static async gathering(gathering: GatheringDoc | null) {
    if (!gathering) {
      return gathering;
    }
    const author = await User.getUserById(gathering.author);
    const members = [];
    for (const member of gathering.members) {
      members.push(await User.getUserById(member));
    }
    return { ...gathering, author: author.username, members: members };
  }

  /**
   * Same as {@link post} but for an array of PostDoc for improved performance.
   */
  static async posts(posts: PostDoc[]) {
    const authors = await User.idsToUsernames(posts.map((post) => post.author));
    return posts.map((post, i) => ({ ...post, author: authors[i] }));
  }
  static async gatherings(gatherings: GatheringDoc[]) {
    const authors = await User.idsToUsernames(gatherings.map((gathering) => gathering.author));
    const memberLists: ObjectId[][] = gatherings.map((gathering) => Array.from(gathering.members));
    const memberNames: String[][] = await Promise.all(memberLists.map(async (memberList) => await User.idsToUsernames(memberList)));
    return gatherings.map((gathering, i) => ({ ...gathering, author: authors[i], members: memberNames[i] }));
  }
  static async users(users: UserDoc[]) {
    return users.map((user) => user.username);
  }

//   /**
//    * Convert FriendRequestDoc into more readable format for the frontend
//    * by converting the ids into usernames.
//    */
//   static async friendRequests(requests: FriendRequestDoc[]) {
//     const from = requests.map((request) => request.from);
//     const to = requests.map((request) => request.to);
//     const usernames = await User.idsToUsernames(from.concat(to));
//     return requests.map((request, i) => ({ ...request, from: usernames[i], to: usernames[i + requests.length] }));
//   }
}

Router.registerError(PostAuthorNotMatchError, async (e) => {
  const username = (await User.getUserById(e.author)).username;
  return e.formatWith(username, e._id);
});

Router.registerError(MemberAlreadyInGatheringError, async (e) => {
  const username = (await User.getUserById(e.member)).username;
  const gathering = (await Gathering.getGatheringbyId(e._id)).name;
  return e.formatWith(username, gathering);
});

Router.registerError(TooManyMembersInGatheringError, async (e) => {
  const gathering = (await Gathering.getGatheringbyId(e._id)).name;
  return e.formatWith(gathering);
});

Router.registerError(GroupAlreadyInGatheringError, async (e) => {
  const group = (await User.getUserById(e.group));
  const gathering = (await Gathering.getGatheringbyId(e._id)).name;
  return e.formatWith(group, gathering);
});

Router.registerError(GatheringAuthorNotMatchError, async (e) => {
  const username = (await User.getUserById(e.author)).username;
  const gathering = (await Gathering.getGatheringbyId(e._id)).name;
  return e.formatWith(username, gathering);
});

Router.registerError(GatheringUneditableError, async (e) => {
  const gathering = (await Gathering.getGatheringbyId(e._id)).name;
  return e.formatWith(gathering);
});

// Router.registerError(FriendRequestAlreadyExistsError, async (e) => {
//   const [user1, user2] = await Promise.all([User.getUserById(e.from), User.getUserById(e.to)]);
//   return e.formatWith(user1.username, user2.username);
// });

// Router.registerError(FriendNotFoundError, async (e) => {
//   const [user1, user2] = await Promise.all([User.getUserById(e.user1), User.getUserById(e.user2)]);
//   return e.formatWith(user1.username, user2.username);
// });

// Router.registerError(FriendRequestNotFoundError, async (e) => {
//   const [user1, user2] = await Promise.all([User.getUserById(e.from), User.getUserById(e.to)]);
//   return e.formatWith(user1.username, user2.username);
// });

// Router.registerError(AlreadyFriendsError, async (e) => {
//   const [user1, user2] = await Promise.all([User.getUserById(e.user1), User.getUserById(e.user2)]);
//   return e.formatWith(user1.username, user2.username);
// });
