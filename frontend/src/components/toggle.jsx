import React, { useEffect, useContext } from "react";
import { SelectedGroupProvider, useSelectedGroup } from '../SelectedGroupContext';
import { GroupContext } from "../GroupContext"; 

const GroupRow = ({ group, isChecked, onCheckChange }) => (
  <div className="flex items-center py-3 pl-2 border-b hover:bg-gray-100 transition text-black">
    <input
      type="checkbox"
      className="mr-3"
      checked={isChecked}
      onChange={(e) => onCheckChange(group, e.target.checked)} // Pass the whole group object
    />
    <div>{group.group_name}</div>
  </div>
);

const GroupList = () => {
  const { groups, loading, error } = useContext(GroupContext);
  const { selectedGroups, toggleSelectedGroup } = useSelectedGroup(); // Get selected groups and toggle function

  useEffect(() => {
    if (groups && groups.length > 0) {
      // Optionally, you could initialize selected groups here if needed
    }
  }, [groups]);

  const handleCheckChange = (group, isChecked) => {
    toggleSelectedGroup(group); // Use toggle function from context
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5 text-black">Group List</h1>

      <div className="overflow-y-auto max-h-[350px]">
        {groups && groups.length > 0 ? (
          groups.map((group) => (
            <GroupRow
              key={group.group_id}
              group={group}
              isChecked={selectedGroups.some((g) => g.group_id === group.group_id)} // Check if group is selected
              onCheckChange={handleCheckChange}
            />
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">No groups found</div>
        )}
      </div>
    </div>
  );
};

export default GroupList;
