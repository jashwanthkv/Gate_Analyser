import express, { json } from "express";
import mongoose from "mongoose";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(json());


mongoose.connect("mongodb+srv://nira:123@cluster1.zbkf6.mongodb.net/Testdb?retryWrites=true&w=majority&appName=Cluster1")
  .then(() => console.log(`✅ Connected to MongoDB: ${mongoose.connection.name}`))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });


const studentSchema = new mongoose.Schema({
  Name: String,
  Regno: String,
  Year: String,
  Dept: String,
  Marks: {
    type: Map,
    of: [Number],
  },
  TotalQuestions: Number,
  TotalQuestionsAttempted: Number,
  TotalMarks: Number,
  TotalMarksObtained: Number,
  Qualified: String,
}, { collection: "Students_Data" });

const Student = mongoose.model("Students_Data", studentSchema);


const genAI = new GoogleGenerativeAI("AIzaSyB3yuvpO6qlGAMNXFC9oP548B9oWHyEI_8");




app.get("/students/:Regno", async (req, res) => {
  const Regno = req.params.Regno.trim();
  console.log(`Received request for student with Regno: ${Regno}`);

  try {
    const student = await Student.findOne({ Regno });

    if (!student) {
      console.warn("Student not found");
      return res.status(404).json({ message: "Student not found" });
    }

    console.log("Student found:", student);
    res.json(student);

  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ error: error.message });
  }
});


app.get("/feedback/:Regno", async (req, res) => {
  const Regno = req.params.Regno.trim();

  try {
    const student = await Student.findOne({ Regno });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    
    const prompt = `
      Analyze the student's subject-wise performance based on the given marks and generate a detailed assessment for the examiner.  

      - Name: ${student.Name}  
      - Qualified: ${student.Qualified}  

      Subject-wise Marks:  
      ${JSON.stringify(Object.fromEntries(student.Marks))}  
      use the below to give improvement feedback then arrange them for stakeholder easyness. be clear
      High Performers (80–100)
      Advanced Learning:
      Enroll them in advanced workshops (e.g., IOE lectures or IIT-led sessions).
      Assign challenging GATE PYQs (Previous Year Questions) from top AIR scorers' recommendations.
      Peer Teaching & Collaboration:
      Encourage them to conduct peer sessions explaining tough topics like Signal Systems, Thermodynamics, or Mathematics.
      Research-Based Insights:
      Recommend solving research-level questions (e.g., research papers involving mathematical modeling).
      🛠 Tools: NPTEL, MIT OCW, and IIT Bombay GATE lectures.

      📊 Moderate Performers (50–79)
      Targeted Practice:
      Provide daily practice questions with step-by-step solutions.
      Focus on time-bound problem-solving to improve speed and accuracy.
      Concept Reinforcement:
      Conduct group study sessions with problem-solving marathons.
      Assign additional reading from Made Easy or ACE Academy notes.
      Application Focus:
      Link theoretical concepts with real-world applications (e.g., Control Systems in robotics).
      🛠 Tools: GATE Virtual Calculator, Gradeup quizzes, and Testbook live sessions.

      🛠 Low Performers (<50)
      Conceptual Foundation:
      Revisit fundamental concepts using video lectures (e.g., Neso Academy for mathematics basics).
      Use simple analogies (e.g., Probability explained via dice and cards).
      Personalized Mentoring:
      Assign a mentor from higher-performing peers for one-on-one tutoring.
      Interactive Learning:
      Use simulations and interactive quizzes to build confidence gradually.
      Focus on solving GATE PYQs from the last 5 years topic-wise.
      🛠 Tools: Unacademy, GeeksforGeeks (for CS topics), and YouTube playlists (e.g., Ravindrababu Ravula).
      
    `;

    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const feedback = response.text();

    res.json({ feedback });

  } catch (error) {
    console.error("Error generating feedback:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
