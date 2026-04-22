import { Link } from "react-router";
import axios from "axios";
import Navbar from "../components/Navbar";
import { ChevronRightIcon, Code2Icon } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";
import { useEffect, useState } from "react";

const ProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {

    const fetchProblems = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/problems/all-questions`, { withCredentials: true });

        const data = await res.data;

        if (data.success === false) {
          throw new Error(data.message || "Failed to fetch problems");
        }

        setProblems(data.data || []);
      } catch (err) {
        console.error("Error fetching problems:", err);
        setError(err.response?.data?.message || err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const easyProblemsCount = problems.filter((p) => p.difficulty === "Easy").length;
  const mediumProblemsCount = problems.filter((p) => p.difficulty === "Medium").length;
  const hardProblemsCount = problems.filter((p) => p.difficulty === "Hard").length;

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-base-200 flex items-center justify-center">
  //       <Navbar />
  //       <div className="text-xl">Loading problems...</div>
  //     </div>
  //   );
  // }

  // Loading State - Navbar stays visible
  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex flex-col">
        <Navbar />

        <div className="flex-1 flex items-center justify-center pt-20">   {/* pt-20 gives space below navbar */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg text-base-content/70">Loading problems...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Practice Problems</h1>
          <p className="text-base-content/70">
            Sharpen your coding skills with these curated problems
          </p>
        </div>

        {/* PROBLEMS LIST */}
        <div className="space-y-4">
          {problems.map((problem) => (
            <Link
              key={problem._id || problem.id}   // Use _id or your custom id
              to={`/problem/${problem.id}`}     // Using your custom "id" field for URL
              className="card bg-base-100 hover:scale-[1.01] transition-transform"
            >
              <div className="card-body">
                <div className="flex items-center justify-between gap-4">
                  {/* LEFT SIDE */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Code2Icon className="size-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-x-3 mb-1">
                          <h2 className="text-xl font-bold">{problem.title}</h2>
                          <span className={`badge ${getDifficultyBadgeClass(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                        </div>
                        {/* Minimalist Category Tags */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Array.isArray(problem.category)
                            ? problem.category.slice(0, 3).map((cat, index) => (
                              <span
                                key={index}
                                className="text-xs px-3 py-1 bg-base-200 text-base-content/70 rounded-full border border-base-300"
                              >
                                {cat}
                              </span>
                            ))
                            : problem.category && (
                              <span className="text-xs px-3 py-1 bg-base-200 text-base-content/70 rounded-full border border-base-300">
                                {problem.category}
                              </span>
                            )
                          }
                        </div>
                      </div>
                    </div>
                    <p className="text-base-content/80 mb-3">{problem.description}</p>
                  </div>
                  {/* RIGHT SIDE */}

                  <div className="flex items-center gap-2 text-primary">
                    <span className="font-medium">Solve</span>
                    <ChevronRightIcon className="size-5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* STATS FOOTER */}
        <div className="mt-12 card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="stats stats-vertical lg:stats-horizontal">
              <div className="stat">
                <div className="stat-title">Total Problems</div>
                <div className="stat-value text-primary">{problems.length}</div>
              </div>

              <div className="stat">
                <div className="stat-title">Easy</div>
                <div className="stat-value text-success">{easyProblemsCount}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Medium</div>
                <div className="stat-value text-warning">{mediumProblemsCount}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Hard</div>
                <div className="stat-value text-error">{hardProblemsCount}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemsPage;
