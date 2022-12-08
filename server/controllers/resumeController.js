const asyncHandler = require("express-async-handler");
const Resume = require("../models/resumeModel");
const User = require("../models/userModel");
const { headerTex } = require("./tex/headerTex");
const { getIntroTex } = require("./tex/introTex");
const { getEduTex } = require("./tex/eduTex");
const { getExpTex } = require("./tex/expTex");
const { getProjectsTex } = require("./tex/projectsTex");
const { getAchTex } = require("./tex/achTex");
const { getSkillsTex } = require("./tex/skillsTex");
const { getProfilesTex } = require("./tex/profilesTex");
const { footerTex } = require("./tex/footerTex");
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
const axios = require("axios");

const getSHA = async (user_id) => {
    const PATH = `${user_id}.tex`;
    const config = {
        method: "get",
        url: `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${PATH}`,
        headers: {
            Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
        },
    };

    try {
        const res = await axios(config);
        return res.data.sha;
    } catch (e) {
        console.log(e.message);
    }
};

const createGithubFile = async (user_id, resume) => {
    const content = Buffer.from(resume).toString("base64");
    // console.log(content);

    var data = JSON.stringify({
        message: "File Created Successfully!",
        content: `${content}`,
    });

    const PATH = `${user_id}.tex`;

    var config = {
        method: "put",
        url: `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${PATH}`,
        headers: {
            Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        },
        data: `${data}`,
    };

    try {
        const res = await axios(config);
    } catch (e) {
        console.log("error here", e.stack);
    }
};

const updateGithubFile = async (user_id, resume) => {
    const shaGithubFile = await getSHA(user_id);
    const content = Buffer.from(resume).toString("base64");

    var data = JSON.stringify({
        message: "File Updated!",
        content: `${content}`,
        sha: `${shaGithubFile}`,
    });

    const PATH = `${user_id}.tex`;

    var config = {
        method: "put",
        url: `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${PATH}`,
        headers: {
            Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        },
        data: data,
    };

    axios(config)
        .then(function (response) {})
        .catch(function (error) {
            console.log(error.message);
        });
};

const getLatexCode = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const resume = await Resume.findById(user.resume);

        const introTex = getIntroTex(resume.intro);
        const eduTex = getEduTex(resume.edu);
        const expTex = getExpTex(resume.exp);
        const projectsTex = getProjectsTex(resume.projects);
        const achTex = getAchTex(resume.ach);
        const skillsTex = getSkillsTex(resume.skills);
        const profilesTex = getProfilesTex(resume.profiles);
        const resumeTex =
            headerTex +
            introTex +
            eduTex +
            expTex +
            projectsTex +
            achTex +
            skillsTex +
            profilesTex +
            footerTex;

        res.send(resumeTex);
    } catch (e) {
        throw new Error(e.message);
    }
});

const getResume = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const resume = await Resume.findById(user.resume);

        const introTex = getIntroTex(resume.intro);
        const eduTex = getEduTex(resume.edu);
        const expTex = getExpTex(resume.exp);
        const projectsTex = getProjectsTex(resume.projects);
        const achTex = getAchTex(resume.ach);
        const skillsTex = getSkillsTex(resume.skills);
        const profilesTex = getProfilesTex(resume.profiles);
        const resumeTex =
            headerTex +
            introTex +
            eduTex +
            expTex +
            projectsTex +
            achTex +
            skillsTex +
            profilesTex +
            footerTex;

        try {
            if (req.user.isResumeFile) {
                // update existing github file
                await updateGithubFile(req.user._id, resumeTex);
            } else {
                await createGithubFile(req.user._id, resumeTex);

                await User.findOneAndUpdate(
                    req.user._id,
                    { isResumeFile: true },
                    { new: true }
                );
            }

            const PDF_URL = `https://texlive2020.latexonline.cc/compile?git=https://github.com/404fixer/tempRepo2&target=${req.user._id}.tex&command=pdflatex&force=true`;
            res.send(PDF_URL);
        } catch (e) {
            console.log(e.message);
            throw new Error("Something went wrong!");
        }
    } catch (e) {
        throw new Error(e.message);
    }
});

module.exports = {
    getResume,
    getLatexCode,
};
