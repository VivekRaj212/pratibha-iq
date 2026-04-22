import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import { BookOpenIcon, LayoutDashboardIcon, SparklesIcon } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import { themes } from "../data/themesData";
import "../index.css";

const Navbar = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const dialogRef = useRef(null);

    // Apply saved theme on page load
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    }, []);

    const openThemeModal = () => {
        dialogRef.current?.showModal();
    };

    const handleThemeChange = (themeValue) => {
        document.documentElement.setAttribute('data-theme', themeValue);
        localStorage.setItem('theme', themeValue);

        setTimeout(() => {
            dialogRef.current?.close();
        }, 120);
    };

    return (
        <nav className="bg-base-100/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50 shadow-lg">
            <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
                {/* LOGO */}
                <Link
                    to="/"
                    className="group flex items-center gap-3 hover:scale-105 transition-transform duration-200"
                >
                    <div className="size-10 rounded-xl bg-linear-to-r from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
                        <SparklesIcon className="size-6 text-white" />
                    </div>

                    <div className="flex flex-col">
                        <span className="font-black text-xl bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-mono tracking-wider">
                            Pratibha IQ
                        </span>
                        <span className="text-xs text-base-content/60 font-medium -mt-1">Code Together</span>
                    </div>
                </Link>

                <div className="flex items-center gap-1">
                    {/* Problems Link */}
                    <Link
                        to="/problems"
                        className={`px-4 py-2.5 rounded-lg transition-all duration-200 
                            ${isActive("/problems") ? "bg-primary text-primary-content" : "hover:bg-base-200 text-base-content/70 hover:text-base-content"}`}
                    >
                        <div className="flex items-center gap-x-2.5">
                            <BookOpenIcon className="size-4" />
                            <span className="font-medium hidden sm:inline">Problems</span>
                        </div>
                    </Link>

                    {/* Dashboard Link */}
                    <Link
                        to="/dashboard"
                        className={`px-4 py-2.5 rounded-lg transition-all duration-200 
                            ${isActive("/dashboard") ? "bg-primary text-primary-content" : "hover:bg-base-200 text-base-content/70 hover:text-base-content"}`}
                    >
                        <div className="flex items-center gap-x-2.5">
                            <LayoutDashboardIcon className="size-4" />
                            <span className="font-medium hidden sm:inline">Dashboard</span>
                        </div>
                    </Link>

                    <div className="ml-4">
                        <UserButton />
                    </div>

                    {/* Theme Button */}
                    <div className="ml-6 flex items-center gap-x-3 cursopr-pointer" onClick={openThemeModal}>
                        <img
                            src="/change_themes.png"
                            alt="Change Theme"
                            height={27}
                            width={27}
                            className="hover:scale-110 transition-transform"

                        />
                        <svg width="12px" height="12px" className="cursor-pointer mt-px hidden size-2 fill-current opacity-60 sm:inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048"><path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path></svg>
                    </div>

                    {/* Fixed Theme Modal */}
                    <dialog
                        ref={dialogRef}
                        id="theme_modal"
                        className="modal"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                e.currentTarget.close();
                            }
                        }}
                    >
                        <form method="dialog" className="modal-backdrop">
                            <button>close</button>
                        </form>

                        <div className="modal-box bg-light rounded-2xl shadow-2xl p-0 max-w-85 mx-auto mr-30 mt-1 border border-gray-100">
                            {/* Header */}
                            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-semibold text-lg text-gray-900">Choose Theme</h3>
                            </div>

                            {/* Themes Grid */}
                            <div className="p-4 overflow-y-auto scrollbar-hide" style={{ maxHeight: "420px" }}>
                                <div className="grid grid-cols-3 gap-3">
                                    {themes.map((theme) => {
                                        const isSelected = document.documentElement.getAttribute('data-theme') === theme.value;   // Fixed variable name

                                        return (
                                            <button
                                                key={theme.value}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleThemeChange(theme.value);
                                                }}
                                                className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all hover:scale-105 active:scale-95
                                                    ${isSelected
                                                        ? 'border-blue-600 shadow-md ring-1 ring-blue-200'
                                                        : 'border-transparent hover:border-gray-200'}`}
                                            >
                                                <div className={`absolute inset-0 bg-linear-to-br ${theme.gradient}`} />

                                                <div className="absolute bottom-1 left-0 right-0 text-center px-1">
                                                    <p className="text-white text-[9px] font-medium drop-shadow-sm">
                                                        {theme.name}
                                                    </p>
                                                </div>

                                                {isSelected && (
                                                    <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </dialog>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;