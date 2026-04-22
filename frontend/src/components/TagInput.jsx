import { useState, useEffect } from 'react'

const TagInput = ({ onTagsChange }) => {
    const [tags, setTags] = useState([]);
    const [input, setInput] = useState("");
    const [error, setError] = useState(false);

    // Send tags to parent whenever tags change
    useEffect(() => {
        if (onTagsChange) {
            onTagsChange(tags);
        }
    }, [tags, onTagsChange]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && input.trim() !== "") {
            e.preventDefault();

            const newTag = input.trim();

            // Limit check
            if (tags.length >= 3) {
                setError(true);
                return;
            } else {
                setError(false);
            }

            // Avoid duplicates
            if (!tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }

            setInput("");
        }
    };


    const removeTag = (index) => {
        const updated = tags.filter((_, i) => i !== index);
        setTags(updated);
        setError(false);
    };


    return (

        <div className="w-full max-w-lg mx-auto">

            <div className="flex flex-wrap items-center border border-gray-300 rounded-md p-2 space-x-2">

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-2">
                    {tags.map((tag, index) => (
                        <div
                            key={index}
                            className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
                        >
                            <span>{tag}</span>
                            <button
                                type="button"
                                className="ml-2 text-blue-500 hover:text-blue-700"
                                onClick={() => removeTag(index)}
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <input
                    type="text"
                    placeholder="Add a tag..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 border-none outline-none focus:ring-0"
                />
            </div>

            {/* Error Message */}
            {error && (
                <p className="mt-2 text-sm text-red-500">
                    You can only add up to 3 tags.
                </p>
            )}
        </div>

    )
}

export default TagInput
