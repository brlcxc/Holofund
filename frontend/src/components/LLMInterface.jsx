import { useState } from "react";
import { useSelectedGroup } from "../context/SelectedGroupContext";
import api from "../api";
import TransactionList from "../components/TransactionList";
import TransactionLineChart from "./TransactionLineChart";
import Loading3D from "./Loading3D";

function LLMInterface() {
  const { selectedGroupUUIDs } = useSelectedGroup();
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mergeData, setMergeData] = useState([]);
  const [mergeData2, setMergeData2] = useState([]);
  const [mergeData3, setMergeData3] = useState([]);
  const [evaluation, setEvaluationData] = useState(null);
  const [gptEvaluation, setGPTEvaluationData] = useState(null);
  const [geminiEvaluation, setGeminiEvaluationData] = useState(null);
  const [situations, setSituations] = useState([]);
  const [situationsSubject, setSubject] = useState("");
  const [newSituationText, setNewSituationText] = useState("");
  const [showTransactionList, setShowTransactionList] = useState(false); // New state
  const [showSelectStage, setShowSelectStage] = useState(false); // New state

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
  const resetState = () => {
    setInputText("");
    setOutputText("");
    setIsEditing(false);
    setSituations([]);
    setSubject("");
    setNewSituationText("");
    setMergeData([]);
    setMergeData2([]);
    setMergeData3([]);
    setEvaluationData(null);
    setShowTransactionList(false);
    setShowSelectStage(false);
  };
  const handleFinalGenerateResponse = async () => {
    setLoading(true);

    try {
      // Combine subject and modified situations into a new question
      const question = `${situationsSubject}: ${situations
        .map((s) => s.text)
        .join(", ")}`;

      const endpoint = `/api/llm/ask/${selectedGroupUUIDs}/`;
      const response = await api.post(endpoint, { question });

      const geminiTransactions = response.data.new_Gemini_transactions;
      const gptTransactions = response.data.new_GPT_transactions;

      // const geminiEvaluation = response.data.Gemini_evaluation.answer;
      // const gptEvaluation = response.data.GPT_evaluation.answer;

      setMergeData(geminiTransactions);
      setMergeData2(gptTransactions);

      setGeminiEvaluationData(response.data.Gemini_evaluation.answer);
      setGPTEvaluationData(response.data.GPT_evaluation.answer);

      setShowTransactionList(true); // Show TransactionList after sending response
      setShowSelectStage(true);
    } catch (error) {
      setOutputText("An error occurred while fetching the response: " + error);
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  const handleSelectingList = (dataSelected) => {
    if (dataSelected) {
      setMergeData3(mergeData);
      setEvaluationData(geminiEvaluation);
    } else {
      setMergeData3(mergeData2);
      setEvaluationData(geminiEvaluation);
    }
    setShowSelectStage(false);
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
  if (loading) {
    return (
      //H band-aid fix
      <div className="h-[700px]">
        <div className="flex items-center justify-center w-full h-full">
          <Loading3D />
        </div>
      </div>
    );
  }
  // const geminiTitle = "Transactions provided by gemini-1.5-flash-002";
  return (
    <div className="flex flex-col w-full items-center gap-6">
      {showTransactionList && showSelectStage && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col bg-white p-4 md:p-8 rounded-xl shadow-lg">
            <TransactionList
              mergeData={mergeData}
              title={"Transactions provided by gemini-1.5-flash-002"}
            />
          </div>
          <div className="flex flex-col bg-white p-4 md:p-8 rounded-xl shadow-lg">
            <TransactionList
              mergeData={mergeData2}
              title={"Transactions provided by gpt-3.5-turbo"}
            />
          </div>
          <button
            className="w-full md:w-auto px-4 py-2 text-lg md:text-2xl font-semibold text-white bg-dodger-blue rounded-lg hover:bg-blue-500"
            onClick={() => handleSelectingList(true)}
          >
            Select
          </button>
          <button
            className="w-full md:w-auto px-4 py-2 text-lg md:text-2xl font-semibold text-white bg-dodger-blue rounded-lg hover:bg-blue-500"
            onClick={() => handleSelectingList(false)}
          >
            Select
          </button>
        </div>
      )}
      {showTransactionList && !showSelectStage && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8">
          <div className="flex flex-col bg-white p-6 sm:p-8 rounded-xl shadow-lg">
            <TransactionList
              mergeData={mergeData3}
              title={"Transaction List"}
            />
          </div>
          <div className="flex flex-col bg-white p-6 sm:p-8 rounded-xl shadow-lg">
            <TransactionLineChart mergeData={mergeData3} />
          </div>
        </div>
      )}

      {showTransactionList &&
        !showSelectStage && ( // Conditionally render TransactionList
          <div className="bg-white p-8 rounded-xl text-lg shadow-lg w-[60%]">
            {evaluation}
          </div>
        )}
      {!showTransactionList && situationsSubject && (
        <div className="flex flex-col space-y-4 text-xl items-center justify-center w-full">
          {situationsSubject && (
            <div className="py-3 px-5 font-bold bg-dodger-blue text-lg md:text-2xl text-white rounded text-center transition w-fit">
              {situationsSubject}
            </div>
          )}
          <div className="flex flex-wrap gap-4 justify-center items-center w-full">
            {situations.map((situation, index) => (
              <div
                key={index}
                className="p-3 bg-dodger-blue text-white rounded cursor-pointer transition flex items-center space-x-2 w-full sm:w-auto"
              >
                <button
                  onClick={() => handleRemoveSituation(index)}
                  className="flex justify-center items-center font-bold text-white bg-coral size-9 rounded p-1 hover:bg-deep-coral focus:outline-none"
                >
                  &times;
                </button>
                <span
                  onClick={() => handleEditClick(index)}
                  className="break-words"
                >
                  {situation.text}
                </span>
              </div>
            ))}

            {situations.length > 0 && (
              <div className="p-3 bg-dodger-blue text-black rounded flex items-center space-x-3 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Add new category..."
                  value={newSituationText}
                  onChange={(e) => setNewSituationText(e.target.value)}
                  className="w-full sm:w-auto p-2 rounded border border-gray-300"
                />
                <button
                  className="font-bold flex items-center justify-center size-9 p-1 bg-green-300 hover:bg-green-400 text-white rounded cursor-pointer"
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
          className="w-full md:w-[30%] p-4 border text-base md:text-lg rounded-lg shadow-lg focus:outline-none focus:ring focus:ring-indigo-500"
          rows="3"
          placeholder="Type a financial situation you would like to predict for here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
      )}
      {showSelectStage && (
        <div className="px-5 py-3 text-2xl font-semibold text-white bg-dodger-blue rounded-lg">
          Select the Most Representative Data
        </div>
      )}
      {!showTransactionList && situationsSubject && <div></div>}
      {!showSelectStage && (
        <button
          className="px-5 py-3 text-2xl font-semibold text-white bg-dodger-blue rounded-lg hover:bg-blue-500"
          onClick={
            showTransactionList
              ? resetState
              : isEditing
              ? handleFinalGenerateResponse
              : handleInitialGenerateResponse
          }
          disabled={loading}
        >
          {loading
            ? isEditing
              ? "Sending..."
              : "Generating..."
            : showTransactionList
            ? "Predict A New Situation"
            : isEditing
            ? "Send Modified Categories"
            : "Generate Categories"}
        </button>
      )}
    </div>
  );
}

export default LLMInterface;
