import React from "react";
import Charts from "../components/Charts";
import TransactionAdd from "../components/TransactionAdd";
import TransactionList from "../components/TransactionList";
import Toggle from "../components/Toggle";
// import { TransactionProvider } from "../context/TransactionContext";
// import { GroupProvider } from "../context/GroupContext";
// import { SelectedGroupProvider, useSelectedGroup } from '../context/SelectedGroupContext';

function BudgetContent() {

  const style = "bg-white p-8 mb-8 rounded-xl shadow-lg mb-8";
  // const { selectedGroupUUIDs } = useSelectedGroup(); // Now safe to use
  return (
    // <TransactionProvider groupUUIDs={selectedGroupUUIDs}>
      <div className="grid grid-cols-2 gap-8 size-full p-8 bg-custom-gradient animate-gradient">
        <div>
          <div className={`${style} h-[70%]`}>
            <TransactionList />
          </div>
          <div className={`${style} h-[25%]`}>
            <TransactionAdd />
          </div>
        </div>
        <div>
          <div className={`${style} h-[70%]`}>
            <Charts />
          </div>
          <div className={`${style} h-[25%]`}>
            <Toggle />
          </div>
        </div>
      </div>
    // </TransactionProvider>
  );
}

function Budget() {
  return (
    // <GroupProvider>
    //   <SelectedGroupProvider>
        <BudgetContent />
    //   </SelectedGroupProvider>
    // </GroupProvider>
  );
}

export default Budget;