const Job = require('../models/Jobs'); 


// Create Jobs
exports.createJob = async (req, res) => {
  try {
    const { companyName, jobTitle, description, salary } = req.body;

    if (!companyName || !jobTitle || !description || !salary) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const job = new Job({ companyName, jobTitle, description, salary });
    await job.save();

    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


// Get Jobs
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Server error' });
  }
};