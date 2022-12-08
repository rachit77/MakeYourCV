import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CodeBracketSquareIcon } from "@heroicons/react/24/outline";

export default function Resume() {
    const [pdfUrl, setPdfUrl] = useState("");
    const navigate = useNavigate();

    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
        console.log("effect");
        if (!user) return navigate("/login");

        const token = user.token;
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        axios
            .get(process.env.REACT_APP_SERVER_URL + "/api/resume", config)
            .then((res) => {
                setPdfUrl(res.data);
            })
            .catch((err) => console.log("error", err));
    }, [user, navigate]);

    const handleGetLatexCode = (e) => {
        e.preventDefault();
        navigate("/code");
    };

    return (
        <div>
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex flex-row items-center justify-center">
                    <h2 className="text-center text-5xl font-extrabold text-gray-900">
                        Resume
                    </h2>
                </div>
                <p className="mt-2 text-center text-sm text-gray-600 max-w">
                    Here is your resume, {user && user.name}!
                </p>
            </div>

            <button
                type="button"
                className="flex flex-row justify-center items-center mx-auto mt-8 rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-semibold text-white shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                onClick={(e) => handleGetLatexCode(e)}
            >
                <CodeBracketSquareIcon className="h-6 w-6 mr-1" />
                Get Latex Code
            </button>

            <div className="mt-8 w-9/12 h-96 sm:w-10/12 sm:h-[100rem] mx-auto">
                <iframe
                    src={pdfUrl + "#view=fitH"}
                    title="resume"
                    className="border-8 border-gray-300"
                    width="100%"
                    height="100%"
                ></iframe>
            </div>

            <div className="h-20"></div>
        </div>
    );
}
