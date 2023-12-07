import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface GatheringDoc extends BaseDoc {
  name: string;
  description: string;
  location: string;
  date: string;
  members: ObjectId[];
  groups: ObjectId[];
  author: ObjectId;
}

export default class GatheringConcept {
  public readonly gatherings = new DocCollection<GatheringDoc>("gatherings");

  async create(name: string, description: string, location: string, date: string, author: ObjectId) {
    const gathering = await this.gatherings.createOne({ name, description, location, date: date, members: [author], author: author });
    return { msg: "Gathering successfully created!", gathering: gathering };
  }

  async getGatherings(query: Filter<GatheringDoc>): Promise<GatheringDoc[]> {
    const gatherings = await this.gatherings.readMany(query);
    return gatherings;
  }

  async getGatheringbyId(_id: ObjectId): Promise<GatheringDoc> {
    const gathering = await this.gatherings.readOne({ _id });
    if (gathering === null) {
      throw new NotFoundError("Gathering not found!");
    }
    return gathering;
  }

  async getMembers(_id: ObjectId): Promise<Array<ObjectId>> {
    const gathering = await this.getGatheringbyId(_id);
    return gathering.members;
  }

  async getGatheringsOfMember(member: ObjectId): Promise<GatheringDoc[]> {
    const query: Filter<GatheringDoc> = { members: { $elemMatch: { $eq: member } } };
    const gatherings = await this.gatherings.readMany(query);
    return gatherings;
  }

  async getEditableGatheringsOfMember(member: ObjectId): Promise<GatheringDoc[]> {
    const query: Filter<GatheringDoc> = { author: { $eq: member }, members: { $size: 1 } };
    const gatherings = await this.gatherings.readMany(query);
    return gatherings;
  }

  async update(_id: ObjectId, params: { name?: string; description?: string; location?: string; date?: string }) {
    await this.getGatheringbyId(_id);
    await this.gatherings.updateOne({ _id }, params);
    return { msg: `Gathering successfully updated!` };
  }

  async addMember(_id: ObjectId, member: ObjectId) {
    const gathering = await this.getGatheringbyId(_id);
    if (await this.isMemberOf(member, _id)) {
      throw new MemberAlreadyInGatheringError(member, gathering._id);
    }
    const maxMembers = 4;
    if (gathering.members.length > maxMembers-1) {
      throw new TooManyMembersInGatheringError(gathering._id, maxMembers);
    }
    await this.gatherings.updateOne({ _id }, { members: [...gathering.members, member] });
    return { msg: `Member successfully added to Gathering!` };
  }

  async removeMember(_id: ObjectId, member: ObjectId) {
    const gathering = await this.getGatheringbyId(_id);
    if (!(await this.isMemberOf(member, _id))) {
      throw new NotFoundError("Member is not in gathering!");
    }
    const stringMembers = gathering.members.map((id) => id.toString())
    const index = stringMembers.indexOf(member.toString());
    if (index > -1) {
      gathering.members.splice(index, 1);
      await this.gatherings.updateOne({ _id }, { members: gathering.members });
      return { msg: `Member successfully removed from Gathering!` };
    } else {
      throw new NotFoundError("Member is not in gathering! Also, this code should be unreachable.");
    }
  }

  async addGroup(_id: ObjectId, group: ObjectId) {
    const gathering = await this.getGatheringbyId(_id);
    if (await this.isGroupOf(group, _id)) {
      throw new GroupAlreadyInGatheringError(group, gathering._id);
    }
    await this.gatherings.updateOne({ _id }, { groups: [...gathering.members, group] });
    return { msg: `Group successfully added to Gathering!` };
  }

  async removeGroup(_id: ObjectId, group: ObjectId) {
    const gathering = await this.getGatheringbyId(_id);
    if (!(await this.isGroupOf(group, _id))) {
      throw new NotFoundError("Group is not in gathering!");
    }
    const stringGroups = gathering.members.map((id) => id.toString())
    const index = stringGroups.indexOf(group.toString());
    if (index > -1) {
      gathering.members.splice(index, 1);
      await this.gatherings.updateOne({ _id }, { groups: gathering.members });
      return { msg: `Group successfully removed from Gathering!` };
    } else {
      throw new NotFoundError("Group is not in gathering! Also, this code should be unreachable.");
    }
  }

  async delete(_id: ObjectId): Promise<{ msg: string }> {
    const gathering = await this.getGatheringbyId(_id);
    const name = gathering.name;
    await this.gatherings.deleteOne({ _id });
    return { msg: `Gathering '${name}' deleted!` };
  }

  async isMemberOf(user: ObjectId, _id: ObjectId): Promise<boolean> {
    const gathering = await this.getGatheringbyId(_id);
    return gathering.members.some(id => id.toString() === user.toString())
  }

  async isGroupOf(group: ObjectId, _id: ObjectId): Promise<boolean> {
    const gathering = await this.getGatheringbyId(_id);
    return gathering.groups.some(id => id.toString() === group.toString())
  }

  async canEdit(user: ObjectId, _id: ObjectId) {
    const gathering = await this.gatherings.readOne({ _id });
    if (!gathering) {
      throw new NotFoundError(`Post ${_id} does not exist!`);
    }
    if (gathering.members.length > 1) {
      throw new GatheringUneditableError(gathering._id);
    }
    if (gathering.author.toString() !== user.toString()) {
      throw new GatheringAuthorNotMatchError(user, _id);
    }
  }

  private async getGroupNumber(_id: ObjectId, group: ObjectId) {
    const gathering = await this.getGatheringbyId(_id);
    if (gathering.groups.some(id => id.toString() === group.toString())) {
      return gathering.groups.indexOf(group)
    } else {
      return -1;
    }
  }

}

export class MemberAlreadyInGatheringError extends NotAllowedError {
  constructor(
    public readonly member: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("Member {0} is already a member of gathering {1}!", member, _id);
  }
}

export class TooManyMembersInGatheringError extends NotAllowedError {
  constructor(
    public readonly _id: ObjectId,
    public readonly maxMembers: number,
  ) {
    super("Gathering {0} cannot have more than {1} members!", _id, maxMembers);
  }
}

export class GroupAlreadyInGatheringError extends NotAllowedError {
  constructor(
    public readonly group: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("Group {0} is already in {1}!", group, _id);
  }
}

export class GatheringAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of gathering {1}!", author, _id);
  }
}

export class GatheringUneditableError extends NotAllowedError {
  constructor(public readonly _id: ObjectId) {
    super("Gathering {0} cannot be edited when there are multiple members!", _id);
  }
}
