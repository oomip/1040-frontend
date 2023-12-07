import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Gathering, Group, Post, User, WebSession } from "./app";
// import { FriendDoc } from "./concepts/friend";
import { GatheringDoc } from "./concepts/gathering";
import { GroupDoc } from "./concepts/group";
import { PostDoc, PostOptions } from "./concepts/post";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import Responses from "./responses";

class Routes {
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  // Users CRUD
  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    return await User.create(username, password);
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    return await User.delete(user);
  }

  // WebSession
  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  // Posts CRUD
  @Router.get("/posts")
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getByAuthor(id);
    } else {
      posts = await Post.getPosts({});
    }
    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: WebSessionDoc, content: string, options?: PostOptions) {
    const user = WebSession.getUser(session);
    const created = await Post.create(user, content, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:_id")
  async updatePost(session: WebSessionDoc, _id: ObjectId, update: Partial<PostDoc>) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return await Post.update(_id, update);
  }

  @Router.delete("/posts/:_id")
  async deletePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return Post.delete(_id);
  }

  // Groups CRUD
  @Router.get("/groups")
  async getGroups(query: Partial<GroupDoc>) {
    // query.members = { $elemMatch: { $eq: member } }
    return await Group.getGroups(query);
  }

  @Router.post("/groups")
  async createGroup(members: Set<ObjectId>) {
    return await Group.create(members);
  }

  @Router.patch("/groups/:_id")
  async updateGroup(_id: ObjectId, update: Partial<GroupDoc>) {
    return await Group.update(_id, update);
  }

  @Router.delete("/groups/:_id")
  async deleteGroup(_id: ObjectId) {
    return await Group.delete(_id);
  }

  // Gatherings CRUD
  @Router.get("/gatherings")
  async getGatherings(query: Partial<GatheringDoc>) {
    return Responses.gatherings(await Gathering.getGatherings(query));
  }

  @Router.post("/gatherings")
  async createGathering(session: WebSessionDoc, name: string, description: string, location: string, date: string) {
    const user = WebSession.getUser(session);
    const created = await Gathering.create(name, description, location, date, user);
    const gathering = await Gathering.getGatheringbyId(created.gathering)
    return { msg: created.msg, gathering: Responses.gathering(gathering) };
  }

  @Router.patch("/gatherings/:_id")
  async updateGathering(session: WebSessionDoc, _id: ObjectId, update: Partial<GatheringDoc>) {
    const user = WebSession.getUser(session);
    await Gathering.canEdit(user, _id);
    return await Gathering.update(_id, update);
  }

  @Router.delete("/gatherings/:_id")
  async deleteGathering(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Gathering.canEdit(user, _id);
    return await Gathering.delete(_id);
  }

  @Router.get("/gatherings/:_id/checkEditable")
  async checkGatheringEditable(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    try {
      await Gathering.canEdit(user, _id);
      return true;
    } catch (error) {
      return false;
    }
  }

  @Router.get("/gatherings/byMember")
  async getGatheringsOfMember(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return Responses.gatherings(await Gathering.getGatheringsOfMember(user));
  }
  @Router.get("/gatherings/editableByMember")
  async getEditableGatheringsOfMember(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return Responses.gatherings(await Gathering.getEditableGatheringsOfMember(user));
  }

  @Router.get("/gatherings/:_id/members")
  async getMembersOfGathering(session: WebSessionDoc, _id: ObjectId) {
    return User.idsToUsernames(await Gathering.getMembers(_id));
  }

  @Router.post("/gatherings/:_id/join")
  async joinGathering(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const gathering = await Gathering.getGatheringbyId(_id);
    try {
      await Gathering.addMember(_id, user);
    } catch (e) {
      return e;
    }
    
    // for (const groupId of gathering.groups) {
    //   const group = await Group.getGroupById(groupId);
    //   if (group.members.size == 2) {
    //     // create group at 3 members
    //     const newGroup = (await Group.create(group.members)).group;
    //     if (newGroup !== null) {
    //       await Group.addMember(newGroup._id, user);
    //       await Gathering.addGroup(gathering._id, newGroup._id);
    //     }
    //   } else if (2 < group.members.size && group.members.size < 8) {
    //     await Group.addMember(group._id, user);
    //     await Gathering.addGroup(gathering._id, group._id);
    //   }
    // }
    return await Gathering.addMember(_id, user);
  }

  @Router.post("/gatherings/:_id/leave")
  async leaveGathering(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    return await Gathering.removeMember(_id, user);
  }

  @Router.get("/gatherings/:_id/checkMember")
  async checkMemberOfGathering(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    return await Gathering.isMemberOf(user, _id);
  }

  // @Router.get("/friends")
  // async getFriends(session: WebSessionDoc) {
  //   const user = WebSession.getUser(session);
  //   return await User.idsToUsernames(await Friend.getFriends(user));
  // }

  // @Router.delete("/friends/:friend")
  // async removeFriend(session: WebSessionDoc, friend: string) {
  //   const user = WebSession.getUser(session);
  //   const friendId = (await User.getUserByUsername(friend))._id;
  //   return await Friend.removeFriend(user, friendId);
  // }

  // @Router.get("/friend/requests")
  // async getRequests(session: WebSessionDoc) {
  //   const user = WebSession.getUser(session);
  //   return await Responses.friendRequests(await Friend.getRequests(user));
  // }

  // @Router.post("/friend/requests/:to")
  // async sendFriendRequest(session: WebSessionDoc, to: string) {
  //   const user = WebSession.getUser(session);
  //   const toId = (await User.getUserByUsername(to))._id;
  //   return await Friend.sendRequest(user, toId);
  // }

  // @Router.delete("/friend/requests/:to")
  // async removeFriendRequest(session: WebSessionDoc, to: string) {
  //   const user = WebSession.getUser(session);
  //   const toId = (await User.getUserByUsername(to))._id;
  //   return await Friend.removeRequest(user, toId);
  // }

  // @Router.put("/friend/accept/:from")
  // async acceptFriendRequest(session: WebSessionDoc, from: string) {
  //   const user = WebSession.getUser(session);
  //   const fromId = (await User.getUserByUsername(from))._id;
  //   return await Friend.acceptRequest(fromId, user);
  // }

  // @Router.put("/friend/reject/:from")
  // async rejectFriendRequest(session: WebSessionDoc, from: string) {
  //   const user = WebSession.getUser(session);
  //   const fromId = (await User.getUserByUsername(from))._id;
  //   return await Friend.rejectRequest(fromId, user);
  // }
}

export default getExpressRouter(new Routes());
