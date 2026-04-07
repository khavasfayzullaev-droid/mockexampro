// check-tables.js — Inspect Supabase table structure
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://zlyxdpdoawgjodadhgrk.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpseXhkcGRvYXdnam9kYWRoZ3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODIzNzIsImV4cCI6MjA5MTA1ODM3Mn0.yMIx-6qzDJ0dqH4cEo0CGIC4uywhbw8qpApARlguGe4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
  // Check profiles
  console.log("=== PROFILES ===");
  const { data: profiles, error: pErr } = await supabase
    .from("profiles")
    .select("*")
    .limit(5);
  console.log("Error:", pErr?.message || "none");
  console.log("Data:", JSON.stringify(profiles, null, 2));

  // Check exams  
  console.log("\n=== EXAMS ===");
  const { data: exams, error: eErr } = await supabase
    .from("exams")
    .select("*")
    .limit(5);
  console.log("Error:", eErr?.message || "none");
  console.log("Data:", JSON.stringify(exams, null, 2));

  // Check questions
  console.log("\n=== QUESTIONS ===");
  const { data: questions, error: qErr } = await supabase
    .from("questions")
    .select("id, exam_id, section, question_type")
    .limit(5);
  console.log("Error:", qErr?.message || "none");
  console.log("Data:", JSON.stringify(questions, null, 2));

  // Check auth users
  console.log("\n=== AUTH (via exams.teacher_id) ===");
  const { data: teacherExams } = await supabase
    .from("exams")
    .select("teacher_id")
    .limit(3);
  console.log("Teacher IDs from exams:", JSON.stringify(teacherExams, null, 2));
}

check().catch(console.error);
