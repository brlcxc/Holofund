import { useState } from "react";
import { useSelectedGroup } from "../context/SelectedGroupContext";
import api from "../api";
import TransactionList from "../components/TransactionList";
import TransactionLineChart from "./TransactionLineChart";

function LLMInterface() {
  const { selectedGroupUUIDs } = useSelectedGroup();
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mergeData, setMergeData] = useState([]);
  const [evaluation, setEvaluationData] = useState(null);
  const [situations, setSituations] = useState([]);
  const [situationsSubject, setSubject] = useState("");
  const [newSituationText, setNewSituationText] = useState("");
  const [showTransactionList, setShowTransactionList] = useState(false); // New state

  const handleInitialGenerateResponse = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/api/llm/ask/`, { question: inputText });
      const situationsList = response.data.situations.map((situation) => ({
        text: situation,
        isEditing: false,
      }));
      const subject = response.data.subject;
      setSituations(situationsList);
      setSubject(subject);
      setOutputText(situationsList.map((s) => s.text).join(", "));
      setIsEditing(true);
    } catch (error) {
      setOutputText("An error occurred while fetching the response: " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalGenerateResponse = async () => {
    setLoading(true);
    try {
      const endpoint = `/api/llm/ask/${selectedGroupUUIDs}/`;
      const response = await api.post(endpoint, { question: outputText });
      const transactions = response.data.new_transactions;
      const evaluation = response.data.evaluation.answer;
      setMergeData(transactions);
      setEvaluationData(evaluation);
      setShowTransactionList(true); // Show TransactionList after sending response
    } catch (error) {
      setOutputText("An error occurred while fetching the response: " + error);
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  const handleRemoveSituation = (index) => {
    setSituations(situations.filter((_, i) => i !== index));
  };

  const handleEditClick = (index) => {
    setSituations(
      situations.map((situation, i) =>
        i === index ? { ...situation, isEditing: true } : situation
      )
    );
  };

  const handleSaveEdit = (index, newText) => {
    setSituations(
      situations.map((situation, i) =>
        i === index ? { text: newText, isEditing: false } : situation
      )
    );
  };

  const handleEditChange = (index, newText) => {
    setSituations(
      situations.map((situation, i) =>
        i === index ? { ...situation, text: newText } : situation
      )
    );
  };

  const handleAddSituation = () => {
    if (newSituationText.trim()) {
      setSituations([
        ...situations,
        { text: newSituationText, isEditing: false },
      ]);
      setNewSituationText("");
    }
  };

  return (
    <div className="flex flex-col w-full items-center gap-6">
      {showTransactionList && (
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col bg-white p-8 rounded-xl shadow-lg">
            <TransactionList mergeData={mergeData} />
          </div>
          <div className="flex flex-col bg-white p-8 rounded-xl shadow-lg">
            <TransactionLineChart mergeData={mergeData} />
          </div>
        </div>
      )}
      {showTransactionList && ( // Conditionally render TransactionList
        <div className="bg-white p-8 rounded-xl text-lg shadow-lg w-[60%]">
          {evaluation}
        </div>
      )}
      {!showTransactionList && situationsSubject && (
        <div className="flex flex-col space-y-4 h-16 text-xl items-center justify-center">
          {situationsSubject && (
            <div className="py-3 px-5 font-bold bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 text-center transition w-fit">
              {situationsSubject}
            </div>
          )}
          <div className="flex space-x-4 h-16 text-xl">
            {situations.map((situation, index) => (
              <div
                key={index}
                className="p-4 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 transition flex items-center space-x-2 h-full"
              >
                <button
                  onClick={() => handleRemoveSituation(index)}
                  className="font-bold text-white bg-red-500 size-9 rounded p-1 hover:bg-red-600 focus:outline-none"
                >
                  &times;
                </button>
                <span onClick={() => handleEditClick(index)}>
                  {situation.text}
                </span>
              </div>
            ))}

            {situations.length > 0 && (
              <div className="p-4 bg-blue-500 text-black rounded space-x-3 cursor-pointer hover:bg-blue-600 flex items-center">
                <input
                  type="text"
                  placeholder="Add new category..."
                  value={newSituationText}
                  onChange={(e) => setNewSituationText(e.target.value)}
                  className="p-2 rounded border border-gray-300"
                />
                <button
                  className="font-bold flex items-center justify-center size-9 p-1 bg-green-500 text-white rounded cursor-pointer hover:bg-green-600"
                  onClick={handleAddSituation}
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* width full is only of this small size */}
      {situations.length === 0 && (
        <textarea
          className="w-[30%] p-4 border text-lg rounded-lg shadow-lg focus:outline-none focus:ring focus:ring-indigo-500"
          rows="2"
          placeholder="Type a financial situation you would like to predict for here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
      )}
      
      <button
        className="px-5 py-3 text-2xl font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        onClick={
          isEditing
            ? handleFinalGenerateResponse
            : handleInitialGenerateResponse
        }
        disabled={loading}
      >
        {loading
          ? isEditing
            ? "Sending..."
            : "Generating..."
          : isEditing
          ? "Send Modified Categories"
          : showTransactionList
          ? "Predict A New Situation"
          : "Generate Categories"}
      </button>
    </div>
  );
}

export default LLMInterface;

//Maybe instruction thing always at top
//Transaction list should order with newest first

//I need to fix the gap at the top for the unloaded stuff not making it center
//I might move subject to the top line and remove the word subject
//different color for subject too maybe?
