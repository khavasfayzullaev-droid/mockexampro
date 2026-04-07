// seed-demo-exam.js — Insert a full 4-skill demo mock exam into Supabase
// This version handles the case where no profiles exist yet by using auth.signUp
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://zlyxdpdoawgjodadhgrk.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpseXhkcGRvYXdnam9kYWRoZ3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODIzNzIsImV4cCI6MjA5MTA1ODM3Mn0.yMIx-6qzDJ0dqH4cEo0CGIC4uywhbw8qpApARlguGe4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── LISTENING DATA ──────────────────────────────────────
const listeningContent = {
  exam_type: "IELTS_MOCK",
  audio_url: "",
  time_limit: 30,
  play_limit: 2,
  sections: [
    {
      id: "ls-1",
      title: "Part 1 — Everyday Conversation",
      instruction:
        "You will hear a telephone conversation between a student and a university accommodation officer. Listen carefully and answer questions 1–5.",
      audioUrl: "",
      imageUrl: "",
      questions: [
        {
          id: "lq-1", type: "MCQ",
          text: "What type of accommodation does the student prefer?",
          options: [
            { id: "lq1-a", label: "A", text: "University dormitory" },
            { id: "lq1-b", label: "B", text: "Shared apartment" },
            { id: "lq1-c", label: "C", text: "Home-stay with a local family" },
            { id: "lq1-d", label: "D", text: "Studio apartment" },
          ],
        },
        {
          id: "lq-2", type: "MCQ",
          text: "How much is the student willing to pay per month?",
          options: [
            { id: "lq2-a", label: "A", text: "Up to $400" },
            { id: "lq2-b", label: "B", text: "Up to $600" },
            { id: "lq2-c", label: "C", text: "Up to $800" },
            { id: "lq2-d", label: "D", text: "No budget limit" },
          ],
        },
        {
          id: "lq-3", type: "MCQ",
          text: "When does the student need to move in?",
          options: [
            { id: "lq3-a", label: "A", text: "Immediately" },
            { id: "lq3-b", label: "B", text: "Next week" },
            { id: "lq3-c", label: "C", text: "Beginning of the semester" },
          ],
        },
        {
          id: "lq-4", type: "GAP_FILL",
          text: "The student's contact phone number is __________.",
        },
        {
          id: "lq-5", type: "GAP_FILL",
          text: "The student is studying in the Faculty of __________.",
        },
      ],
    },
    {
      id: "ls-2",
      title: "Part 2 — Academic Lecture",
      instruction:
        "You will hear part of a lecture about the effects of climate change on marine ecosystems. Answer questions 6–10.",
      audioUrl: "",
      imageUrl: "",
      questions: [
        {
          id: "lq-6", type: "MCQ",
          text: "According to the speaker, what is the primary cause of coral bleaching?",
          options: [
            { id: "lq6-a", label: "A", text: "Ocean pollution" },
            { id: "lq6-b", label: "B", text: "Rising ocean temperatures" },
            { id: "lq6-c", label: "C", text: "Overfishing" },
          ],
        },
        {
          id: "lq-7", type: "MCQ",
          text: "The Great Barrier Reef has lost approximately what percentage of its coral coverage since 1995?",
          options: [
            { id: "lq7-a", label: "A", text: "25%" },
            { id: "lq7-b", label: "B", text: "50%" },
            { id: "lq7-c", label: "C", text: "75%" },
          ],
        },
        {
          id: "lq-8", type: "GAP_FILL",
          text: "The speaker mentions that __________ species of fish depend directly on coral reefs.",
        },
        {
          id: "lq-9", type: "GAP_FILL",
          text: "The research was conducted over a period of __________ years.",
        },
        {
          id: "lq-10", type: "MCQ",
          text: "What solution does the lecturer propose?",
          options: [
            { id: "lq10-a", label: "A", text: "Artificial reef construction" },
            { id: "lq10-b", label: "B", text: "Reducing global carbon emissions" },
            { id: "lq10-c", label: "C", text: "Marine protected areas only" },
          ],
        },
      ],
    },
  ],
};

// ─── READING DATA ──────────────────────────────────────
const readingContent = {
  exam_type: "IELTS_MOCK",
  time_limit: 60,
  sections: [
    {
      id: "rs-1",
      title: "Passage 1 — The History of Coffee",
      instruction:
        "Read the passage below and answer questions 1–7. Choose the correct letter A, B, C or D for questions 1–4 and complete the sentences for questions 5–7.",
      audioUrl: "",
      imageUrl: "",
      questions: [
        {
          id: "rq-1", type: "MCQ",
          text: "Where was coffee first discovered according to the passage?",
          options: [
            { id: "rq1-a", label: "A", text: "Yemen" },
            { id: "rq1-b", label: "B", text: "Ethiopia" },
            { id: "rq1-c", label: "C", text: "Turkey" },
            { id: "rq1-d", label: "D", text: "Brazil" },
          ],
        },
        {
          id: "rq-2", type: "MCQ",
          text: "According to the legend, who first noticed the effects of coffee beans?",
          options: [
            { id: "rq2-a", label: "A", text: "A merchant" },
            { id: "rq2-b", label: "B", text: "A goat herder named Kaldi" },
            { id: "rq2-c", label: "C", text: "A Buddhist monk" },
            { id: "rq2-d", label: "D", text: "A European explorer" },
          ],
        },
        {
          id: "rq-3", type: "MCQ",
          text: "The first coffeehouses appeared in which century?",
          options: [
            { id: "rq3-a", label: "A", text: "13th century" },
            { id: "rq3-b", label: "B", text: "15th century" },
            { id: "rq3-c", label: "C", text: "17th century" },
            { id: "rq3-d", label: "D", text: "19th century" },
          ],
        },
        {
          id: "rq-4", type: "MCQ",
          text: "What was coffee initially called in Europe?",
          options: [
            { id: "rq4-a", label: "A", text: "The Arabian wine" },
            { id: "rq4-b", label: "B", text: "The devil's drink" },
            { id: "rq4-c", label: "C", text: "The energy elixir" },
            { id: "rq4-d", label: "D", text: "The black gold" },
          ],
        },
        {
          id: "rq-5", type: "GAP_FILL",
          text: "Coffee became popular in Europe after being endorsed by Pope __________.",
        },
        {
          id: "rq-6", type: "GAP_FILL",
          text: "Today, the world's largest coffee producing country is __________.",
        },
        {
          id: "rq-7", type: "GAP_FILL",
          text: "An estimated __________ billion cups of coffee are consumed worldwide each day.",
        },
      ],
    },
    {
      id: "rs-2",
      title: "Passage 2 — Artificial Intelligence in Healthcare",
      instruction:
        "Read the passage about AI in healthcare and answer questions 8–13.",
      audioUrl: "",
      imageUrl: "",
      questions: [
        {
          id: "rq-8", type: "MCQ",
          text: "What is the main advantage of AI-powered diagnostics mentioned in the passage?",
          options: [
            { id: "rq8-a", label: "A", text: "Lower cost" },
            { id: "rq8-b", label: "B", text: "Faster and more accurate diagnosis" },
            { id: "rq8-c", label: "C", text: "Replacing doctors entirely" },
          ],
        },
        {
          id: "rq-9", type: "MCQ",
          text: "Which medical field has seen the most impact from AI so far?",
          options: [
            { id: "rq9-a", label: "A", text: "Surgery" },
            { id: "rq9-b", label: "B", text: "Radiology and imaging" },
            { id: "rq9-c", label: "C", text: "General practice" },
          ],
        },
        {
          id: "rq-10", type: "GAP_FILL",
          text: "The AI system can analyze a chest X-ray in approximately __________ seconds.",
        },
        {
          id: "rq-11", type: "GAP_FILL",
          text: "According to the study, AI achieved an accuracy rate of __________%.",
        },
        {
          id: "rq-12", type: "MCQ",
          text: "What ethical concern is raised about AI in healthcare?",
          options: [
            { id: "rq12-a", label: "A", text: "Patient data privacy" },
            { id: "rq12-b", label: "B", text: "Machine bias in diagnostics" },
            { id: "rq12-c", label: "C", text: "Both A and B" },
          ],
        },
        {
          id: "rq-13", type: "MCQ",
          text: "The author's overall tone toward AI in healthcare is:",
          options: [
            { id: "rq13-a", label: "A", text: "Completely skeptical" },
            { id: "rq13-b", label: "B", text: "Cautiously optimistic" },
            { id: "rq13-c", label: "C", text: "Entirely enthusiastic" },
          ],
        },
      ],
    },
  ],
};

// ─── WRITING DATA ──────────────────────────────────────
const writingContent = {
  tasks: [
    {
      id: "wt-1", type: "TASK1", title: "Writing Task 1",
      text: "The chart below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
      minWords: 150, imageUrl: "",
    },
    {
      id: "wt-2", type: "TASK2", title: "Writing Task 2",
      text: "Some people believe that the best way to reduce crime is to give longer prison sentences. Others, however, think that there are better alternative methods of reducing crime.\n\nDiscuss both views and give your own opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.",
      minWords: 250, imageUrl: "",
    },
  ],
};

// ─── SPEAKING DATA ──────────────────────────────────────
const speakingContent = {
  parts: [
    {
      id: "sp-1", title: "Part 1 — Introduction & Interview",
      imageFileUrl: "", audioFileUrl: "",
      questions: [
        { id: "sq-1", text: "Can you tell me your full name, please?" },
        { id: "sq-2", text: "Where are you from?" },
        { id: "sq-3", text: "Do you work or are you a student? What do you study?" },
        { id: "sq-4", text: "What do you like most about your studies?" },
        { id: "sq-5", text: "How often do you use public transportation? Why or why not?" },
      ],
    },
    {
      id: "sp-2", title: "Part 2 — Individual Long Turn (Cue Card)",
      imageFileUrl: "", audioFileUrl: "",
      questions: [
        {
          id: "sq-6",
          text: "Describe a book that you have recently read and found interesting.\n\nYou should say:\n• what the book was about\n• why you decided to read it\n• how long it took you to finish it\n• and explain why you found it interesting.\n\nYou have 1 minute to prepare and should speak for 1–2 minutes.",
        },
      ],
    },
    {
      id: "sp-3", title: "Part 3 — Discussion",
      imageFileUrl: "", audioFileUrl: "",
      questions: [
        { id: "sq-7", text: "Do you think reading habits have changed in recent years? How?" },
        { id: "sq-8", text: "What are the advantages of reading books compared to watching films?" },
        { id: "sq-9", text: "Do you think schools should encourage students to read more? How?" },
        { id: "sq-10", text: "In your opinion, will physical books disappear in the future?" },
      ],
    },
  ],
};

async function seed() {
  console.log("🔐 Step 1: Creating a demo teacher account...");

  // Sign up a demo teacher
  const demoEmail = "demo-teacher@mockexampro.uz";
  const demoPassword = "DemoTeacher2026!";

  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email: demoEmail,
    password: demoPassword,
    options: {
      data: {
        display_name: "Demo Teacher",
        role: "teacher",
      },
    },
  });

  let teacherId;

  if (signUpErr) {
    console.log("⚠️  SignUp error (may already exist):", signUpErr.message);
    // Try to sign in instead
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });
    
    if (signInErr) {
      console.error("❌ Cannot sign in either:", signInErr.message);
      console.log("\n📝 Trying to insert exam without teacher_id...");
      teacherId = null;
    } else {
      teacherId = signInData.user.id;
      console.log("✅ Signed in as existing teacher:", teacherId);
    }
  } else {
    teacherId = signUpData.user?.id;
    console.log("✅ Demo teacher created:", teacherId);
    
    // Also create the profile manually if needed
    if (teacherId) {
      const { error: profileErr } = await supabase.from("profiles").upsert({
        id: teacherId,
        display_name: "Demo Teacher",
        role: "teacher",
      });
      if (profileErr) {
        console.log("⚠️  Profile upsert note:", profileErr.message);
      } else {
        console.log("✅ Profile created for teacher");
      }
    }
  }

  // Create the exam record
  console.log("\n📝 Step 2: Creating demo exam...");
  
  const examPayload = {
    title: "IELTS Academic Mock Test — Full Demo",
    duration_minutes: 180,
    is_active: true,
  };
  
  if (teacherId) {
    examPayload.teacher_id = teacherId;
  }

  const { data: exam, error: examErr } = await supabase
    .from("exams")
    .insert(examPayload)
    .select()
    .single();

  if (examErr) {
    console.error("❌ Failed to create exam:", examErr.message);
    process.exit(1);
  }

  const examId = exam.id;
  console.log("✅ Exam created:", examId);

  // Insert questions for all 4 sections
  console.log("\n📦 Step 3: Inserting all 4 skill sections...");
  const questions = [
    { exam_id: examId, section: "listening", question_type: "exam_section_v1", content: listeningContent, order_index: 1 },
    { exam_id: examId, section: "reading", question_type: "exam_section_v1", content: readingContent, order_index: 2 },
    { exam_id: examId, section: "writing", question_type: "exam_section_v1", content: writingContent, order_index: 3 },
    { exam_id: examId, section: "speaking", question_type: "exam_section_v1", content: speakingContent, order_index: 4 },
  ];

  const { error: qErr } = await supabase.from("questions").insert(questions);

  if (qErr) {
    console.error("❌ Failed to insert questions:", qErr.message);
    process.exit(1);
  }

  console.log("✅ All 4 sections inserted!\n");
  console.log("━".repeat(50));
  console.log("🎉 DEMO EXAM READY!");
  console.log("━".repeat(50));
  console.log(`\n📋 Exam: "IELTS Academic Mock Test — Full Demo"`);
  console.log(`🔑 Exam ID: ${examId}`);
  console.log(`🔗 Preview: /dashboard/exam/${examId}`);
  console.log(`\n👨‍🏫 Demo Teacher Login:`);
  console.log(`   Email:    ${demoEmail}`);
  console.log(`   Password: ${demoPassword}`);
  console.log(`\n📊 Content:`);
  console.log(`   🎧 Listening: 2 parts, 10 questions (MCQ + GAP_FILL)`);
  console.log(`   📖 Reading:   2 passages, 13 questions (MCQ + GAP_FILL)`);
  console.log(`   ✍️  Writing:   2 tasks (Task 1 + Task 2)`);
  console.log(`   🗣️  Speaking:  3 parts, 10 questions`);
}

seed().catch(console.error);
