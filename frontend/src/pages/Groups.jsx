import React, { useContext } from "react";
import GroupAdd from "../components/GroupAdd";
import OwnedGroups from "../components/OwnedGroups";
import GroupMembership from "../components/GroupMembership";
import GroupModify from "../components/GroupModify";
import { GroupModifyProvider } from "../context/GroupModifyContext";
import { GroupContext } from "../context/GroupContext";
// error on first load "Each child in a list should have a unique "key" prop."

function Groups() {
  const { groups, loading, error } = useContext(GroupContext);
  const style = "bg-white p-8 rounded-xl shadow-lg";
  return (
    <GroupModifyProvider groups={groups}>
      <div className="grid grid-cols-2 gap-8 size-full p-8 bg-custom-gradient animate-gradient">
        <div className="flex flex-col gap-8">
          {" "}
          <div className={`${style} h-[70%]`}>
            <GroupModify />
          </div>
          <div className={`${style} h-[26%]`}>
            <OwnedGroups />
          </div>
        </div>
        <div className="flex flex-col gap-8">
          {" "}
          <div className={`${style} h-[70%]`}>
            <GroupAdd />
          </div>
          <div className={`${style} h-[26%]`}>
            <GroupMembership />
          </div>
        </div>
      </div>
    </GroupModifyProvider>
  );
}

export default Groups;
