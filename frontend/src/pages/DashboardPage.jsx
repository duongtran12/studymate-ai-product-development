import { Link } from "react-router-dom";
import { useState } from "react";

const initialCourses = [
  { id: "software-architecture", name: "Kien truc phan mem", documents: 4, activity: "Hoc hom qua", quiz: "Quiz gan nhat: 70%" },
  { id: "ai-product", name: "AI Product Development", documents: 2, activity: "Chua bat dau phien hoc", quiz: "San sang tao quiz" },
];

export default function DashboardPage() {
  const [courses, setCourses] = useState(initialCourses);
  const [newCourse, setNewCourse] = useState("");
  const [showForm, setShowForm] = useState(false);
  function createCourse(event) { event.preventDefault(); if (!newCourse.trim()) return; setCourses([...courses, { id: newCourse.toLowerCase().replaceAll(" ", "-"), name: newCourse.trim(), documents: 0, activity: "Chua co phien hoc", quiz: "Hay tai tai lieu dau tien" }]); setNewCourse(""); setShowForm(false); }
  return <section className="page-section" aria-labelledby="dashboard-title"><div className="page-heading"><div><p className="eyebrow">Tong quan hoc tap</p><h1 id="dashboard-title">Chao Minh</h1><p className="page-intro">Chon mot mon hoc de tiep tuc hoc tu tai lieu cua ban.</p></div><button className="primary-button" onClick={() => setShowForm(!showForm)}>{showForm ? "Dong" : "+ Tao mon hoc"}</button></div>{showForm && <form className="inline-form" onSubmit={createCourse}><label htmlFor="course-name">Ten mon hoc</label><input id="course-name" value={newCourse} onChange={(event) => setNewCourse(event.target.value)} placeholder="Vi du: Co so du lieu" autoFocus /><button className="primary-button" type="submit">Them mon hoc</button></form>}<section className="course-area" aria-labelledby="courses-title"><h2 id="courses-title">Mon hoc cua ban</h2><div className="course-list">{courses.map((course) => <Link className="course-card" to={`/courses?course=${course.id}`} key={course.id}><h3>{course.name}</h3><p>{course.documents} tai lieu · {course.activity}</p><span>{course.quiz}</span></Link>)}</div></section><section className="continue-study" aria-labelledby="continue-title"><h2 id="continue-title">Tiep tuc hoc</h2><p>Phien gan nhat: Hoi dap tu De cuong AI Product Development.</p><Link className="text-action" to="/study-sessions">Mo phien hoc</Link></section></section>;
}
