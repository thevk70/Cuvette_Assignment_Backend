import jobpost from "../modals/jobpost.mjs";
import sendJobEmail from "../Email/sendJobEmail.mjs";

const createJob = async (req, res) => {
  const { title, description, experienceLevel,salary,location, userId, addCandidates,endDate } =
    req.body;
  const job = new jobpost({
    title,
    description,
    experienceLevel,
    salary,
    location,
    userId,
    addCandidates,
    endDate
  });
  
  try {
    const savedJob = await job.save().then(async () => await sendJobEmail(job))
    res.status(201).json({ message: "Emails sent successfully!", savedJob,type:"success" });
  } catch (error) {
    res.status(500).json({ message: "Error creating job", type:"error" });
  }
};

export default createJob;
