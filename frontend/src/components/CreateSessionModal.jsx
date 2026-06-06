import { Code2Icon, LoaderIcon, PlusIcon } from "lucide-react";

function CreateSessionModal({
    isOpen,
    onClose,
    roomConfig,
    setRoomConfig,
    onCreateRoom,
    isCreating,
    problems,
    loading,
    error,
}) {

    if (!isOpen) return null;

    console.log("is problems loading: ", problems);

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-2xl mb-6">Create New Session</h3>

                <div className="space-y-8">
                    {/* PROBLEM SELECTION */}
                    <div className="space-y-2">
                        <label className="label">
                            <span className="label-text font-semibold">Select Problem</span>
                            <span className="label-text-alt text-error">*</span>
                        </label>

                        {loading ? (
                            <div className="flex items-center gap-2 text-sm opacity-70">
                                <LoaderIcon className="size-4 animate-spin" />
                                Loading problems...
                            </div>
                        ) : error ? (
                            <div className="alert alert-error">
                                <span>{error}</span>
                            </div>
                        ) : (
                            <select
                                className="select w-full"
                                value={roomConfig.problem}
                                onChange={(e) => {
                                    const selectedProblem = problems.find(
                                        (p) => p.title === e.target.value
                                    );

                                    if (!selectedProblem) return;

                                    setRoomConfig({
                                        difficulty: selectedProblem.difficulty,
                                        problem: e.target.value,
                                    });
                                }}
                            >
                                <option value="" disabled>
                                    Choose a coding problem...
                                </option>

                                {problems.map((problem) => (
                                    <option key={problem.id} value={problem.title}>
                                        {problem.title} ({problem.difficulty})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* ROOM SUMMARY */}
                    {roomConfig.problem && (
                        <div className="alert alert-success">
                            <Code2Icon className="size-5" />
                            <div>
                                <p className="font-semibold">Room Summary:</p>
                                <p>
                                    Problem: <span className="font-medium">{roomConfig.problem}</span>
                                </p>
                                <p>
                                    Max Participants: <span className="font-medium">2 (1-on-1 session)</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-action">
                    <button className="btn btn-ghost" onClick={onClose}>
                        Cancel
                    </button>

                    <button
                        className="btn btn-primary gap-2"
                        onClick={onCreateRoom}
                        disabled={isCreating ||
                            loading ||
                            error ||
                            !roomConfig.problem}
                    >
                        {isCreating ? (
                            <LoaderIcon className="size-5 animate-spin" />
                        ) : (
                            <PlusIcon className="size-5" />
                        )}

                        {isCreating ? "Creating..." : "Create"}
                    </button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
}
export default CreateSessionModal;